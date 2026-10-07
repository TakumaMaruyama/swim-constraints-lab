import { getAvailablePhaseOrDomainOptions } from "../data/formOptions";
import { competitiveLevels, goals, learnLevels } from "../data/options";
import { taskTemplates } from "../data/taskTemplates";
import type { AdjustmentAction, CardDirection, GoalId, Mode, TargetLevel, TaskTemplate } from "../types";
import { adjustTask } from "./adjustTask";
import { matchTasks } from "./matchTasks";

export interface LessonConditions {
  participants: number;
  lanes: number;
  minutes: number;
  level: TargetLevel;
  goal: GoalId;
  skill: string;
}

export interface LessonContent {
  title: string;
  activity: string;
  amount: string;
  coaching: string;
  setup: string;
}

export interface LessonBlock extends LessonContent {
  id: string;
  minutes: string;
  kind: "opening" | "task" | "rest" | "closing" | "custom";
  taskId?: string;
  direction?: CardDirection;
  adjustments: AdjustmentAction[];
}

export interface LessonPlan {
  conditions: LessonConditions;
  blocks: LessonBlock[];
  grouping: string;
  alternative: number;
  alternativeCount: number;
}

export const lessonLevels = [
  ...learnLevels,
  ...competitiveLevels.map((level) => ({ ...level, label: `選手（${level.label}）` })),
];
export const lessonDirections: Record<CardDirection, string> = {
  establish: "成立 · まずできるようにする",
  explore: "探索 · やり方を比べる",
  transfer: "実場面 · 普段の泳ぎで試す",
};
export const defaultConditions: LessonConditions = {
  participants: 12, lanes: 1, minutes: 50, level: "beginner", goal: "confidence", skill: "水慣れ",
};
export const lessonMode = (level: TargetLevel): Mode =>
  ["beginner", "intermediate", "advanced"].includes(level) ? "learnToSwim" : "competitive";

// Facility-specific exclusions apply only to the staff builder. The 144 source
// tasks and the original task finder stay intact. This is not a safety rating.
export function getLessonCatalog(conditions: Pick<LessonConditions, "lanes" | "participants">) {
  return taskTemplates.filter((task) => {
    if (task.phases.some((phase) => ["start", "underwater", "breakout"].includes(phase))) return false;
    if (["learn-adv-establish-underwater", "learn-adv-explore-route"].includes(task.id)) return false;
    const content = [task.title, task.summary, task.setup, ...task.instructions,
      ...Object.values(task.prescription), task.participantCue, ...task.successCriteria,
      task.easier, task.harder, task.noEquipment, task.largeGroup,
      task.transferConnection, JSON.stringify(task.adjustments ?? {})].join("\n");
    if (/息止め|息を止め(?!ず|ない)|無呼吸|潜水|飛び込|飛込み|入水角度|呼吸あり・なし|息継ぎあり・なし|息継ぎする[^。\n]*しない|呼吸の間隔を変え/.test(content)) return false;
    if ((conditions.lanes < 2 || conditions.participants < 2) && /隣[のレーン泳者選手]|並走|波の発生/.test(content)) return false;
    return true;
  });
}

export function getLessonSkills(conditions: Pick<LessonConditions, "level" | "lanes" | "participants">) {
  return getAvailablePhaseOrDomainOptions(lessonMode(conditions.level), conditions.level, getLessonCatalog(conditions));
}

export function validateConditions(conditions: LessonConditions): string[] {
  const errors: string[] = [];
  if (!Number.isInteger(conditions.participants) || conditions.participants < 1 || conditions.participants > 60) errors.push("人数は1〜60人の整数で入力してください（安全な定員を示す値ではありません）。");
  if (!Number.isInteger(conditions.lanes) || conditions.lanes < 1 || conditions.lanes > 3) errors.push("使用コース数は1〜3で選んでください。");
  if (!Number.isInteger(conditions.minutes) || conditions.minutes < 20 || conditions.minutes > 120) errors.push("レッスン時間は20〜120分の整数で入力してください。");
  if (!lessonLevels.some((level) => level.value === conditions.level)) errors.push("レベルを選んでください。");
  if (!goals.some((goal) => goal.value === conditions.goal)) errors.push("狙いを選んでください。");
  if (!getLessonSkills(conditions).some((skill) => skill.value === conditions.skill)) errors.push("この条件で3方向の案が揃う練習内容を選んでください。");
  return errors;
}

/** Explicit 25m-pool distance mapping; do not change seconds, reps or IDs. */
export const adaptTo15m = (text: string) => text.replace(/\b(25|50|75|100)m\b/g, (_, distance: string) => `${Number(distance) / 25 * 15}m`);

export function taskContent(task: TaskTemplate, actions: AdjustmentAction[] = []): LessonContent {
  const card = adjustTask(task, actions, ["none"]);
  const prescription = card.effectivePrescription;
  // The shared largeGroup modifier mentions up to four lanes. Use only its
  // instruction here; grouping for this facility is provided separately.
  const setup = actions.includes("largeGroup") ? adjustTask(task, actions.filter((a) => a !== "largeGroup"), ["none"]).effectiveSetup : card.effectiveSetup;
  return {
    title: adaptTo15m(card.title),
    activity: adaptTo15m([...new Set([prescription.activity, ...card.effectiveInstructions])].join("\n")),
    amount: adaptTo15m(`1回分：${prescription.oneRep}\n回数：${prescription.repetitions} ／ 休み：${prescription.recovery}`),
    coaching: adaptTo15m(`見る点：${card.coachObservation}\n声かけ：「${card.effectiveParticipantCue}」\nできた目安：${card.effectiveSuccessCriteria.join(" ")}`),
    setup: adaptTo15m(setup),
  };
}

export function makeTaskBlock(task: TaskTemplate, id: string, minutes = "5", actions: AdjustmentAction[] = []): LessonBlock {
  return { ...taskContent(task, actions), id, minutes, kind: "task", taskId: task.id, direction: task.direction, adjustments: actions };
}

export function adjustLessonBlock(block: LessonBlock, action: AdjustmentAction): LessonBlock {
  const template = taskTemplates.find((task) => task.id === block.taskId);
  if (!template) return block;
  const actions = block.adjustments.filter((item) => item !== action &&
    !(action === "easier" && item === "harder") && !(action === "harder" && item === "easier"));
  if (!block.adjustments.includes(action)) actions.push(action);
  return { ...block, ...taskContent(template, actions), title: block.title, adjustments: actions };
}

/** Reserve one minute per activity, then distribute the rest deterministically. */
export function allocateMinutes(total: number, weights: number[]): number[] {
  if (!Number.isInteger(total) || !weights.length || total < weights.length || weights.some((weight) => !Number.isFinite(weight) || weight <= 0)) return [];
  const sum = weights.reduce((a, b) => a + b, 0);
  const shares = weights.map((weight) => (total - weights.length) * weight / sum);
  const result = shares.map((share) => 1 + Math.floor(share));
  const order = shares.map((share, index) => ({ index, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  const remainder = total - result.reduce((a, b) => a + b, 0);
  for (let index = 0; index < remainder; index++) result[order[index].index]++;
  return result;
}

export function groupingFor({ participants, lanes }: Pick<LessonConditions, "participants" | "lanes">): string {
  const groups = Math.min(lanes, participants);
  const sizes = Array.from({ length: groups }, (_, index) => Math.floor(participants / groups) + (index < participants % groups ? 1 : 0));
  return `${participants}人を${groups}組（${sizes.map((size) => `${size}人`).join("・")}）に分ける案。使用する${lanes}コース内で、各組の出発・到着・待機場所を決める。同じ課題を行い、前の人の到着と間隔をスタッフが確認して交代する。待つ人は安全な場所から見る点を1つ選ぶ。待ちが長ければ距離・回数や組分けを見直す。組数は同時に泳がせる人数や安全な定員を意味しない。`;
}

export function makeCustomBlock(id: string, rest = false): LessonBlock {
  return {
    id, kind: rest ? "rest" : "custom", minutes: rest ? "3" : "5", adjustments: [],
    title: rest ? "休憩・水分補給" : "追加の活動",
    activity: rest ? "安全な待機場所で休み、体調と呼吸が落ち着いているか確認する。" : "",
    amount: rest ? "必要に応じて延長する。" : "",
    coaching: rest ? "疲れ・寒さ・不安がある場合は再開を急がない。" : "",
    setup: "",
  };
}

export function buildLesson(conditions: LessonConditions, alternative = 0): LessonPlan | undefined {
  if (validateConditions(conditions).length) return undefined;
  const result = matchTasks({
    mode: lessonMode(conditions.level), level: conditions.level, goal: conditions.goal,
    phaseOrDomain: conditions.skill, observedTag: "", equipment: ["none"],
    details: { currentStates: [], individualConstraints: [], taskConstraints: [], environmentConstraints: [], implementationConditions: [], specificConditions: [] },
  }, alternative, getLessonCatalog(conditions));
  if (result.cards.length !== 3) return undefined;
  const minutes = allocateMinutes(conditions.minutes, [6, 9, 11, 2, 12, 4]);
  const tasks = result.cards.map((task, index) => makeTaskBlock(task, `task-${index}`, "1"));
  const blocks: LessonBlock[] = [
    { id: "opening", kind: "opening", minutes: "1", adjustments: [], title: "体調確認・準備・水に慣れる", activity: "人数・体調を確認し、今日の狙いと中止の合図を共有する。本人が選べる無理のない動きから始める。", amount: "入退水・説明・準備の時間を含む。", coaching: "一度に伝えることは1つ。できた動きと表情を見る。水深1.1mで立てるか、必要な補助と指導体制を確認する。", setup: "出発・到着・待機場所、入退水の動線を共有する。" },
    tasks[0], tasks[1], makeCustomBlock("rest", true), tasks[2],
    { id: "closing", kind: "closing", minutes: "1", adjustments: [], title: "好きなやり方を振り返る・退水", activity: "楽しかったこと・やりやすかった方法を本人の言葉や動きで振り返る。人数と体調を確認して退水する。", amount: "振り返り・片付け・退水の時間を含む。", coaching: "答えを先に教えず、本人が気づいたことを1つ聞く。", setup: "" },
  ];
  return { conditions: { ...conditions }, blocks: blocks.map((block, index) => ({ ...block, minutes: String(minutes[index]) })), grouping: groupingFor(conditions), alternative: result.selectedAlternative, alternativeCount: result.alternativeCount };
}

export const blockMinutes = (value: string): number | undefined => {
  const number = Number(value);
  return value.trim() !== "" && Number.isInteger(number) && number >= 1 && number <= 120 ? number : undefined;
};

export function lessonTiming(blocks: LessonBlock[]) {
  let elapsed = 0;
  let valid = true;
  const ranges = blocks.map((block) => {
    const minutes = blockMinutes(block.minutes);
    if (minutes === undefined) valid = false;
    const start = elapsed;
    elapsed += minutes ?? 0;
    return valid ? `${start}–${elapsed}分` : "時間未確定";
  });
  return { total: valid ? elapsed : undefined, ranges };
}

export function planIssues(plan: LessonPlan): string[] {
  const issues: string[] = [];
  if (!plan.blocks.length) issues.push("活動を1つ以上追加してください。");
  if (plan.blocks.some((block) => blockMinutes(block.minutes) === undefined)) issues.push("各活動の時間は1〜120分の整数で入力してください。");
  if (plan.blocks.some((block) => !block.title.trim() || !block.activity.trim() || !block.coaching.trim())) issues.push("各活動の名前・活動内容・指導ポイントを入力してください。");
  if (!plan.grouping.trim()) issues.push("人数に合わせた進め方を入力してください。");
  const total = lessonTiming(plan.blocks).total;
  if (total !== undefined && total !== plan.conditions.minutes) issues.push(`配分は${total}分です。設定した${plan.conditions.minutes}分に合わせてください。`);
  return issues;
}

export interface LessonHistory { past: (LessonPlan | null)[]; present: LessonPlan | null; future: (LessonPlan | null)[]; editKey?: string }
export const initialHistory: LessonHistory = { past: [], present: null, future: [] };
export type HistoryAction = { type: "set"; plan: LessonPlan; editKey?: string } | { type: "undo" | "redo" | "endEdit" };

// Coalesce typing in one field until blur; structural edits always get a step.
export function lessonHistory(state: LessonHistory, action: HistoryAction): LessonHistory {
  if (action.type === "endEdit") return { ...state, editKey: undefined };
  if (action.type === "undo") {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past.at(-1)!, future: [state.present, ...state.future] };
  }
  if (action.type === "redo") {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1) };
  }
  if (action.type === "set") {
    if (JSON.stringify(action.plan) === JSON.stringify(state.present)) return state;
    const coalesced = Boolean(action.editKey && state.editKey === action.editKey);
    return { past: coalesced ? state.past : [...state.past, state.present].slice(-60), present: action.plan, future: [], editKey: action.editKey };
  }
  return state;
}
