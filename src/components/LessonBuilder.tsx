import { useEffect, useReducer, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Printer, Redo2, Undo2 } from "lucide-react";
import { goals } from "../data/options";
import {
  adaptTo15m, adjustLessonBlock, allocateMinutes, blockMinutes, buildLesson, defaultConditions,
  getLessonCatalog, getLessonSkills, initialHistory, lessonDirections, lessonHistory, lessonLevels,
  lessonMode, lessonTiming, makeCustomBlock, makeTaskBlock, planIssues, validateConditions,
} from "../engine/lessonPlan";
import type { LessonBlock, LessonConditions, LessonContent, LessonPlan } from "../engine/lessonPlan";
import type { AdjustmentAction, GoalId, TargetLevel } from "../types";

type ConditionsForm = Omit<LessonConditions, "participants" | "minutes"> & { participants: string; minutes: string };
const formFor = (conditions: LessonConditions): ConditionsForm => ({ ...conditions, participants: String(conditions.participants), minutes: String(conditions.minutes) });
const readForm = (form: ConditionsForm): LessonConditions => ({ ...form, participants: Number(form.participants), minutes: Number(form.minutes) });
const adjustmentOptions: { action: AdjustmentAction; label: string }[] = [
  { action: "easier", label: "易しくする" }, { action: "harder", label: "難しくする" },
  { action: "largeGroup", label: "待つ人の観察を加える" }, { action: "changeCue", label: "質問で声をかける" },
  { action: "noEquipment", label: "用具なしにする" },
];
const fields: { key: keyof LessonContent; label: string; rows: number }[] = [
  { key: "activity", label: "活動内容", rows: 4 },
  { key: "amount", label: "距離・回数・休み", rows: 2 },
  { key: "coaching", label: "指導ポイント・声かけ", rows: 4 },
];

export function LessonBuilder({ active, onBack }: { active: boolean; onBack: () => void }) {
  const [form, setForm] = useState<ConditionsForm>(() => formFor(defaultConditions));
  const [history, dispatch] = useReducer(lessonHistory, initialHistory);
  const [errors, setErrors] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [status, setStatus] = useState("");
  const [addChoice, setAddChoice] = useState("custom");
  const nextId = useRef(0);
  const planHeading = useRef<HTMLHeadingElement>(null);
  const plan = history.present;
  const conditions = readForm(form);
  const skills = getLessonSkills(conditions);
  const pendingConditions = Boolean(plan && JSON.stringify(conditions) !== JSON.stringify(plan.conditions));
  const timing = lessonTiming(plan?.blocks ?? []);
  const issues = plan ? planIssues(plan) : [];
  const ready = Boolean(plan && !pendingConditions && !issues.length);
  const catalog = getLessonCatalog(plan?.conditions ?? conditions).filter((task) =>
    task.mode === lessonMode((plan?.conditions ?? conditions).level) && task.levels.includes((plan?.conditions ?? conditions).level));

  useEffect(() => {
    if (!plan) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [plan]);

  const commit = (next: LessonPlan, editKey?: string, message = "") => {
    dispatch({ type: "set", plan: next, editKey });
    setReviewed(false);
    setStatus(message);
  };
  const endEdit = () => dispatch({ type: "endEdit" });
  const updateBlock = (id: string, patch: Partial<LessonBlock>, editKey?: string) => {
    if (plan) commit({ ...plan, blocks: plan.blocks.map((block) => block.id === id ? { ...block, ...patch } : block) }, editKey);
  };
  const changeConditions = (patch: Partial<ConditionsForm>) => {
    const next = { ...form, ...patch };
    if (patch.level || patch.lanes || patch.participants !== undefined) {
      const available = getLessonSkills(readForm(next));
      if (!available.some((skill) => skill.value === next.skill)) next.skill = available[0]?.value ?? "";
    }
    setForm(next);
    setErrors([]);
    setReviewed(false);
  };
  const generate = (alternative = 0) => {
    const nextErrors = validateConditions(conditions);
    setErrors(nextErrors);
    if (nextErrors.length) return;
    const next = buildLesson(conditions, alternative);
    if (!next) { setErrors(["この条件で3方向の案が揃いません。練習内容を選び直してください。"]); return; }
    commit(next, undefined, `レッスン案を作りました。${conditions.minutes}分の配分と活動を確認してください。`);
    setAddChoice("custom");
    requestAnimationFrame(() => {
      planHeading.current?.focus({ preventScroll: true });
      planHeading.current?.scrollIntoView({ block: "start" });
    });
  };
  const travel = (type: "undo" | "redo") => {
    const next = type === "undo" ? history.past.at(-1) : history.future[0];
    if (next === undefined) return;
    dispatch({ type });
    setForm(formFor(next?.conditions ?? defaultConditions));
    setReviewed(false);
    setErrors([]);
    setAddChoice("custom");
    setStatus(type === "undo" ? "1つ前の編集に戻しました。" : "編集をやり直しました。");
  };
  const move = (index: number, offset: number) => {
    if (!plan || index + offset < 0 || index + offset >= plan.blocks.length) return;
    const blocks = [...plan.blocks];
    [blocks[index], blocks[index + offset]] = [blocks[index + offset], blocks[index]];
    commit({ ...plan, blocks }, undefined, "活動の順序を変えました。");
  };
  const add = () => {
    if (!plan || plan.blocks.length >= 20) return;
    const id = `added-${nextId.current++}`;
    const task = catalog.find((task) => task.id === addChoice);
    if (!task && !["custom", "rest"].includes(addChoice)) return;
    const block = task ? makeTaskBlock(task, id) : makeCustomBlock(id, addChoice === "rest");
    commit({ ...plan, blocks: [...plan.blocks, block] }, undefined, "末尾に活動を追加しました。時間配分を確認してください。");
  };
  const rebalance = () => {
    if (!plan) return;
    const minutes = allocateMinutes(plan.conditions.minutes, plan.blocks.map((block) => Math.max(1, (blockMinutes(block.minutes) ?? 2) - 1)));
    if (!minutes.length) return;
    commit({ ...plan, blocks: plan.blocks.map((block, index) => ({ ...block, minutes: String(minutes[index]) })) }, undefined, "活動数と現在の配分をもとに、合計時間を合わせました。実施量は別途確認してください。");
  };

  return (
    <main className="page-shell lesson-page" id={active ? "main-content" : undefined} hidden={!active}>
      <div className="lesson-screen-only">
        <button type="button" className="text-button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> 練習選びへ戻る</button>
        <p className="section-kicker">スタッフ用 · はまだスイミングスクール</p>
        <h1>レッスンを組み立てる</h1>
        <p className="lead">3方向の課題を、今日の人数と時間に合わせて。順番も、言葉も、現場で使う形に整えられます。</p>
        <div className="lesson-facility">
          <strong>15m × 3コース · 幅 約6.2m · 水深1.1m</strong>
          <p>全課題が監修前の案です。飛び込み・長い水中移動・呼吸を制限する課題は、この画面の候補から除いています。息止め競争は行いません。</p>
          <p>距離は25m→15m、50m→30m等に短縮しています。15mを超える距離は折り返しを含む合計です。折り返し地点・実施量・休みは必ずスタッフが確認してください。</p>
        </div>
        <p className="lesson-help">氏名などの個人情報は入力しないでください。案はこの画面を開いている間だけ保持されます。必要な案は印刷／PDFで残してください。</p>
      </div>

      <div className="lesson-workspace">
        <details className="lesson-conditions lesson-screen-only" open={!plan}>
          <summary>レッスン条件{plan ? ` · ${plan.conditions.participants}人 / ${plan.conditions.minutes}分` : ""}</summary>
          <form noValidate onSubmit={(event) => { event.preventDefault(); generate(); }}>
            <div className="lesson-form-grid">
              <label>人数<input type="number" min="1" max="60" step="1" required value={form.participants} onChange={(event) => changeConditions({ participants: event.target.value })} /></label>
              <label>レッスン時間（分）<input type="number" min="20" max="120" step="1" required value={form.minutes} onChange={(event) => changeConditions({ minutes: event.target.value })} /></label>
              <label>レベル<select value={form.level} onChange={(event) => changeConditions({ level: event.target.value as TargetLevel })}>{lessonLevels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}</select></label>
              <label>使用コース数<select value={form.lanes} onChange={(event) => changeConditions({ lanes: Number(event.target.value) })}>{[1, 2, 3].map((lanes) => <option key={lanes} value={lanes}>{lanes}コース</option>)}</select></label>
              <label className="lesson-span">今日の狙い<select value={form.goal} onChange={(event) => changeConditions({ goal: event.target.value as GoalId })}>{goals.map((goal) => <option key={goal.value} value={goal.value}>{goal.label}</option>)}</select></label>
              <label className="lesson-span">練習内容<select value={form.skill} onChange={(event) => changeConditions({ skill: event.target.value })}><option value="">選んでください</option>{skills.map((skill) => <option key={skill.value} value={skill.value}>{skill.label}</option>)}</select></label>
            </div>
            <p className="lesson-help">一般コースは50分が基本です。実際に使えるコース数を選択してください。用具なしで始められる課題から、狙いを優先して選びます。</p>
            {errors.length ? <ul className="error-summary" role="alert">{errors.map((error) => <li key={error}>{error}</li>)}</ul> : null}
            <button type="submit" className="primary-button">{plan ? "この条件で案を作り直す" : "レッスン案を作る"}</button>
            {plan ? <p className="lesson-help">作り直すと編集内容を置き換えます。「元に戻す」で復元できます。</p> : null}
          </form>
        </details>

        <div className="lesson-editor">
          <div className="lesson-toolbar lesson-screen-only">
            <button type="button" className="secondary-button" disabled={!history.past.length} onClick={() => travel("undo")}><Undo2 size={18} aria-hidden="true" /> 元に戻す</button>
            <button type="button" className="secondary-button" disabled={!history.future.length} onClick={() => travel("redo")}><Redo2 size={18} aria-hidden="true" /> やり直す</button>
          </div>
          <p className="lesson-status lesson-screen-only" role="status" aria-live="polite">{status}</p>
          {!plan ? <div className="empty-state lesson-screen-only"><h2>今日のレッスンを、ここから。</h2><p>条件を選ぶと、導入・3方向の活動・休憩・振り返りを時間内に配分します。</p></div> : <>
            <header className="lesson-plan-heading">
              <span className="draft-badge">監修前の案</span>
              <h2 ref={planHeading} tabIndex={-1}>今日のレッスン案</h2>
              <p>{lessonLevels.find((level) => level.value === plan.conditions.level)?.label} · {plan.conditions.participants}人 · {plan.conditions.minutes}分 · {plan.conditions.lanes}コース使用</p>
              <p>狙い：{goals.find((goal) => goal.value === plan.conditions.goal)?.label}<br />練習内容：{getLessonSkills(plan.conditions).find((skill) => skill.value === plan.conditions.skill)?.label}</p>
              <div className="lesson-print-only">
                <p>はまだスイミングスクール · 15m × 3コース · 幅 約6.2m · 水深1.1m</p>
                <p>飛び込み・息止め競争は行わない。泳力・体調・水深での立位と補助・指導体制を確認する。15mを超える距離は折り返しを含む合計。実施量・休みは現場で調整する。</p>
                <p><strong>{reviewed && ready ? "この案のスタッフ確認済み（課題の監修を意味しません）" : "スタッフ未確認・実施前に確認してください"}</strong></p>
                {issues.length ? <ul>{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul> : null}
              </div>
            </header>
            {pendingConditions ? <div className="error-summary lesson-screen-only" role="alert"><p>入力条件が変わっています。今の案は変更前の条件です。作り直してから確認してください。</p><button type="button" className="secondary-button" onClick={() => { setForm(formFor(plan.conditions)); setErrors([]); }}>入力を今の案の条件に戻す</button></div> : null}
            <div className={`lesson-time-summary ${timing.total !== plan.conditions.minutes ? "lesson-time-summary--unbalanced" : ""}`}>
              <strong>配分合計 <output aria-label="配分合計">{timing.total ?? "未確定"}</output> / {plan.conditions.minutes}分</strong>
              <span>{timing.total === undefined ? "時間の未入力・小数・範囲外を確認" : timing.total === plan.conditions.minutes ? "時間内に収まっています" : `${Math.abs(timing.total - plan.conditions.minutes)}分${timing.total > plan.conditions.minutes ? "超過" : "不足"}`}</span>
              <button type="button" className="secondary-button lesson-screen-only" onClick={rebalance} disabled={!plan.blocks.length || plan.blocks.length > plan.conditions.minutes || timing.total === plan.conditions.minutes}>合計を{plan.conditions.minutes}分に合わせる</button>
            </div>
            <p className="lesson-help">配分には説明・移動・休憩を含みます。回数をこなすために休みを削らず、余裕に合わせて実施量を減らしてください。</p>
            <label className="lesson-grouping lesson-screen-only">人数に合わせた進め方<textarea rows={5} maxLength={1500} value={plan.grouping} onChange={(event) => commit({ ...plan, grouping: event.target.value }, "grouping")} onBlur={endEdit} /></label>
            <div className="lesson-print-only lesson-print-grouping"><strong>人数に合わせた進め方</strong><p>{plan.grouping}</p></div>
            <div className="lesson-toolbar lesson-screen-only">
              <button type="button" className="secondary-button" disabled={pendingConditions || plan.alternativeCount < 2} onClick={() => generate(plan.alternative + 1)}>別の課題で作り直す</button>
              <span className="lesson-help">{plan.alternative + 1} / {plan.alternativeCount}案 · 編集は「元に戻す」で復元できます。</span>
            </div>

            <ol className="lesson-blocks" aria-label="レッスンの活動">
              {plan.blocks.map((block, index) => (
                <li key={block.id} className={`lesson-block lesson-block--${block.direction ?? block.kind}`}>
                  <div className="lesson-block-heading">
                    <span className="lesson-block-number">{index + 1}</span><strong>{timing.ranges[index]}</strong>
                    <span>{block.direction ? lessonDirections[block.direction] : block.kind === "rest" ? "休憩" : "進行"}</span>
                  </div>
                  <div className="lesson-block-inputs lesson-screen-only">
                    <label>活動名<input maxLength={100} value={block.title} onChange={(event) => updateBlock(block.id, { title: event.target.value }, `${block.id}-title`)} onBlur={endEdit} /></label>
                    <label>配分時間（分）<input type="number" min="1" max="120" step="1" aria-invalid={blockMinutes(block.minutes) === undefined} value={block.minutes} onChange={(event) => updateBlock(block.id, { minutes: event.target.value }, `${block.id}-minutes`)} onBlur={endEdit} /></label>
                  </div>
                  <h3 className="lesson-print-only">{block.title}（{block.minutes}分）</h3>
                  <div className="lesson-block-actions lesson-screen-only">
                    <button type="button" className="secondary-button" aria-label={`活動${index + 1}を上へ`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} aria-hidden="true" /> 上へ</button>
                    <button type="button" className="secondary-button" aria-label={`活動${index + 1}を下へ`} disabled={index === plan.blocks.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} aria-hidden="true" /> 下へ</button>
                    <button type="button" className="text-button" aria-label={`活動${index + 1}を削除`} onClick={() => commit({ ...plan, blocks: plan.blocks.filter((item) => item.id !== block.id) }, undefined, "活動を削除しました。元に戻すことができます。")}>削除</button>
                  </div>
                  {fields.map(({ key, label, rows }) => <div key={key} className="lesson-content-field">
                    <label className="lesson-screen-only">{label}<textarea maxLength={2500} rows={rows} value={block[key]} onChange={(event) => updateBlock(block.id, { [key]: event.target.value }, `${block.id}-${key}`)} onBlur={endEdit} /></label>
                    <div className="lesson-print-only"><strong>{label}</strong><p>{block[key] || "—"}</p></div>
                  </div>)}
                  {block.taskId ? <details className="lesson-task-tools lesson-screen-only">
                    <summary>準備・課題の調整と入れ替え</summary>
                    <label>準備・場所<textarea rows={3} maxLength={1500} value={block.setup} onChange={(event) => updateBlock(block.id, { setup: event.target.value }, `${block.id}-setup`)} onBlur={endEdit} /></label>
                    <p className="lesson-help">調整すると活動・実施量・指導ポイント・準備を提案文に置き換えます。手で編集した内容は「元に戻す」で復元できます。難化でも呼吸の我慢や水中距離の延長は行いません。</p>
                    <div className="lesson-toolbar">{adjustmentOptions.map(({ action, label }) => <button key={action} type="button" className="secondary-button" aria-pressed={block.adjustments.includes(action)} onClick={() => updateBlock(block.id, adjustLessonBlock(block, action))}>{label}</button>)}</div>
                    <label>収録課題を入れ替える<select value={block.taskId} onChange={(event) => {
                      const task = catalog.find((task) => task.id === event.target.value);
                      if (task) updateBlock(block.id, makeTaskBlock(task, block.id, block.minutes));
                    }}>{catalog.map((task) => <option key={task.id} value={task.id}>{adaptTo15m(task.title)}</option>)}</select></label>
                  </details> : null}
                  {block.setup ? <div className="lesson-print-only"><strong>準備・場所</strong><p>{block.setup}</p></div> : null}
                  {block.taskId ? <p className="lesson-source">収録課題：{block.taskId} · 監修前{block.adjustments.length ? ` · 調整：${block.adjustments.map((action) => adjustmentOptions.find((option) => option.action === action)?.label).join("、")}` : ""}</p> : null}
                </li>
              ))}
            </ol>
            <div className="lesson-add lesson-screen-only">
              <label>追加する活動<select value={addChoice} onChange={(event) => setAddChoice(event.target.value)}><option value="custom">自由に記入する活動</option><option value="rest">休憩・水分補給</option>{catalog.map((task) => <option key={task.id} value={task.id}>{adaptTo15m(task.title)}</option>)}</select></label>
              <button type="button" className="secondary-button" onClick={add} disabled={plan.blocks.length >= 20}><Plus size={18} aria-hidden="true" /> 活動を追加</button>
              <small>最大20活動。追加後に順序・時間を調整してください。</small>
            </div>
            <section className="lesson-review lesson-screen-only">
              <h2>実施前のスタッフ確認</h2>
              <p>水深1.1mでの立位・補助、泳力・体調、待機場所と動線、全員を見られる指導体制、距離・回数・休憩を確認してください。確認後も「監修前の案」のままです。</p>
              {issues.length ? <ul role="alert">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul> : null}
              <label className="lesson-check lesson-screen-only"><input type="checkbox" checked={reviewed} disabled={!ready} onChange={(event) => setReviewed(event.target.checked)} />この案の内容と実施条件をスタッフが確認した</label>
              <p className="lesson-review-state">{reviewed && ready ? "この案のスタッフ確認済み（課題の監修を意味しません）" : "スタッフ未確認・実施前に確認してください"}</p>
              <button type="button" className="primary-button lesson-screen-only" disabled={!ready || !reviewed} onClick={() => window.print()}><Printer size={18} aria-hidden="true" /> レッスン案を印刷 / PDF</button>
              <p className="lesson-help lesson-screen-only">内容を編集すると確認が外れます。印刷時はブラウザの用紙をA4に設定してください。</p>
            </section>
          </>}
        </div>
      </div>
    </main>
  );
}
