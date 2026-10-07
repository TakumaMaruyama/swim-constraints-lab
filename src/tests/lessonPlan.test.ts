import { describe, expect, it } from "vitest";
import { taskTemplates } from "../data/taskTemplates";
import {
  adaptTo15m, adjustLessonBlock, allocateMinutes, blockMinutes, buildLesson, defaultConditions,
  getLessonCatalog, getLessonSkills, groupingFor, initialHistory, lessonHistory, lessonLevels,
  lessonTiming, makeCustomBlock, planIssues, validateConditions,
} from "../engine/lessonPlan";

describe("staff lesson planning", () => {
  it("builds a complete 50-minute lesson using the three existing directions", () => {
    const plan = buildLesson(defaultConditions)!;
    expect(plan).toBeDefined();
    expect(plan.blocks.map((block) => block.kind)).toEqual(["opening", "task", "task", "rest", "task", "closing"]);
    expect(plan.blocks.map((block) => block.minutes)).toEqual(["7", "10", "12", "3", "13", "5"]);
    expect(plan.blocks.filter((block) => block.taskId).map((block) => block.direction)).toEqual(["establish", "explore", "transfer"]);
    expect(lessonTiming(plan.blocks)).toEqual({ total: 50, ranges: ["0–7分", "7–17分", "17–29分", "29–32分", "32–45分", "45–50分"] });
    expect(planIssues(plan)).toEqual([]);
  });

  it("provides deterministic plans at every level, with usable skills for one person and one lane too", () => {
    const before = JSON.stringify(taskTemplates);
    for (const { value: level } of lessonLevels) {
      for (const [participants, lanes] of [[1, 1], [2, 3], [12, 1], [60, 3]]) {
        const conditions = { ...defaultConditions, level, participants, lanes };
        const skills = getLessonSkills(conditions);
        expect(skills.length, level).toBeGreaterThan(0);
        for (const skill of skills) {
          for (const minutes of [20, 50, 120]) {
            const input = { ...conditions, skill: skill.value, minutes };
            const plan = buildLesson(input)!;
            expect(plan, `${level}/${skill.value}`).toBeDefined();
            expect(plan).toEqual(buildLesson(input));
            expect(lessonTiming(plan.blocks).total).toBe(minutes);
            expect(planIssues(plan)).toEqual([]);
            expect(plan.blocks.filter((block) => block.taskId)).toHaveLength(3);
          }
        }
      }
    }
    expect(JSON.stringify(taskTemplates)).toBe(before);
    expect(taskTemplates).toHaveLength(144);
    expect(taskTemplates.every((task) => task.reviewStatus === "draft")).toBe(true);
  });

  it("does not offer starts, underwater-distance drills, or breath-restriction comparisons", () => {
    for (const participants of [1, 12]) {
      for (const lanes of [1, 3]) {
        const catalog = getLessonCatalog({ participants, lanes });
        expect(catalog.length).toBeGreaterThan(0);
        for (const task of catalog) {
          expect(task.phases.some((phase) => ["start", "underwater", "breakout"].includes(phase))).toBe(false);
          expect(["learn-adv-establish-underwater", "learn-adv-explore-route"]).not.toContain(task.id);
          const instructions = [task.title, ...task.instructions, ...Object.values(task.prescription)].join("\n");
          expect(instructions).not.toMatch(/息止め競争|無呼吸|飛び込|呼吸あり・なし|息継ぎする[^。\n]*しない/);
          if (lanes === 1 || participants === 1) expect(instructions).not.toMatch(/並走|隣レーン|隣の泳者/);
        }
      }
    }
    expect(getLessonSkills(defaultConditions).some((option) => option.value === "水慣れ")).toBe(true);
    expect(getLessonSkills(defaultConditions).some((option) => option.value === "水中呼気")).toBe(true);
  });

  it("rejects invalid input and a skill incompatible with the level", () => {
    for (const participants of [0, -1, 61, 2.5, NaN, Infinity]) {
      expect(buildLesson({ ...defaultConditions, participants })).toBeUndefined();
    }
    for (const minutes of [0, 19, 121, 50.5, NaN, Infinity]) {
      expect(buildLesson({ ...defaultConditions, minutes })).toBeUndefined();
    }
    for (const lanes of [0, 4, 1.5, NaN]) expect(validateConditions({ ...defaultConditions, lanes }).length).toBeGreaterThan(0);
    expect(buildLesson({ ...defaultConditions, skill: "start" })).toBeUndefined();
  });

  it("shortens 25m-pool distances without rewriting repetitions, rests or existing 15m multiples", () => {
    expect(adaptTo15m("25m・50m・75m・100m、各25回、50秒休む。30m・60m・125m"))
      .toBe("15m・30m・45m・60m、各25回、50秒休む。30m・60m・125m");
    const plan = buildLesson({ ...defaultConditions, level: "race", skill: "swimming" })!;
    for (const block of plan.blocks) expect(JSON.stringify(block)).not.toMatch(/\b(25|50|75|100)m\b/);
  });

  it("distributes every minute without zero-length activities", () => {
    for (let total = 20; total <= 120; total++) {
      for (let count = 1; count <= 20; count++) {
        const times = allocateMinutes(total, Array.from({ length: count }, (_, index) => index + 1));
        expect(times).toHaveLength(count);
        expect(times.reduce((a, b) => a + b, 0)).toBe(total);
        expect(times.every((value) => Number.isInteger(value) && value >= 1)).toBe(true);
      }
    }
    expect(allocateMinutes(2, [1, 1, 1])).toEqual([]);
    expect(allocateMinutes(50, [])).toEqual([]);
  });

  it("does not treat an empty or invalid duration as zero", () => {
    for (const value of ["", " ", "0", "-1", "1.2", "121", "NaN", "Infinity"]) expect(blockMinutes(value)).toBeUndefined();
    const plan = buildLesson(defaultConditions)!;
    const invalid = { ...plan, blocks: plan.blocks.map((block, index) => index === 2 ? { ...block, minutes: "" } : block) };
    expect(lessonTiming(invalid.blocks).total).toBeUndefined();
    expect(lessonTiming(invalid.blocks).ranges.slice(2)).toEqual(Array(4).fill("時間未確定"));
    expect(planIssues(invalid).join(" ")).toContain("各活動の時間");
    expect(planIssues({ ...plan, blocks: [] }).join(" ")).toContain("活動を1つ以上");
    expect(planIssues({ ...plan, blocks: [...plan.blocks, makeCustomBlock("extra")] }).join(" ")).toContain("活動内容");
  });

  it("uses the shared adjustments without four-lane copy or accumulating repeated modifiers", () => {
    const block = buildLesson(defaultConditions)!.blocks[1];
    const easier = adjustLessonBlock(block, "easier");
    expect(easier.amount).toContain("2回");
    const harder = adjustLessonBlock(easier, "harder");
    expect(harder.adjustments).toEqual(["harder"]);
    expect(harder.minutes).toBe(block.minutes);
    expect(adjustLessonBlock(harder, "harder")).toEqual(block);
    expect(adjustLessonBlock(block, "largeGroup").setup).not.toContain("4レーン");
    expect(adjustLessonBlock(block, "largeGroup").activity).toContain("待つ人");
  });

  it("keeps grouping inside selected lanes and does not invent empty groups", () => {
    expect(groupingFor({ participants: 13, lanes: 3 })).toContain("5人・4人・4人");
    expect(groupingFor({ participants: 1, lanes: 3 })).toContain("1組（1人）");
    expect(groupingFor({ participants: 12, lanes: 1 })).toContain("1組（12人）");
  });
});

describe("lesson editing history", () => {
  it("coalesces typing, restores deleted/adjusted text, and clears redo after a new edit", () => {
    const plan = buildLesson(defaultConditions)!;
    let history = lessonHistory(initialHistory, { type: "set", plan });
    history = lessonHistory(history, { type: "set", plan: { ...plan, grouping: "編" }, editKey: "grouping" });
    history = lessonHistory(history, { type: "set", plan: { ...plan, grouping: "編集した進め方" }, editKey: "grouping" });
    expect(history.past).toHaveLength(2);
    history = lessonHistory(history, { type: "endEdit" });
    const edited = history.present!;
    history = lessonHistory(history, { type: "set", plan: { ...edited, blocks: edited.blocks.slice(1) } });
    history = lessonHistory(history, { type: "undo" });
    expect(history.present).toEqual(edited);
    history = lessonHistory(history, { type: "undo" });
    expect(history.present).toEqual(plan);
    history = lessonHistory(history, { type: "redo" });
    expect(history.present).toEqual(edited);
    history = lessonHistory(history, { type: "set", plan: { ...edited, grouping: "別の編集" } });
    expect(history.future).toEqual([]);
  });

  it("can undo and redo full regeneration, including conditions, through the initial empty state", () => {
    const plan = buildLesson(defaultConditions)!;
    const next = buildLesson({ ...defaultConditions, minutes: 30 })!;
    let history = lessonHistory(initialHistory, { type: "set", plan });
    history = lessonHistory(history, { type: "set", plan: next });
    history = lessonHistory(history, { type: "undo" });
    expect(history.present).toEqual(plan);
    history = lessonHistory(history, { type: "undo" });
    expect(history.present).toBeNull();
    history = lessonHistory(history, { type: "redo" });
    history = lessonHistory(history, { type: "redo" });
    expect(history.present).toEqual(next);
  });
});
