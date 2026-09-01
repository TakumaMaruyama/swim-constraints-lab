import { describe, expect, it } from "vitest";
import { evidenceSources } from "../data/evidenceSources";
import { constraintModifiers } from "../data/constraintModifiers";
import { competitiveObservedTagsByPhase } from "../data/options";
import { getAvailableObservedTagOptions, getAvailablePhaseOrDomainOptions, learnDomainsByLevel } from "../data/formOptions";
import { taskTemplates } from "../data/taskTemplates";
import { matchTasks } from "../engine";
import type { CardDirection, CompetitivePhase, LearnToSwimLevel, Mode, TaskTemplate } from "../types";

const directions: CardDirection[] = ["establish", "explore", "transfer"];
const competitivePhases: CompetitivePhase[] = ["start", "turn", "underwater", "breakout", "swimming", "finish"];
const learnLevels: LearnToSwimLevel[] = ["beginner", "intermediate", "advanced"];

const tasksForMode = (mode: Mode) => taskTemplates.filter((task) => task.mode === mode);
const tasksForDirection = (tasks: TaskTemplate[], direction: CardDirection) =>
  tasks.filter((task) => task.direction === direction);
const details = {
  currentStates: [], individualConstraints: [], taskConstraints: [], environmentConstraints: [],
  implementationConditions: [], specificConditions: [],
};

describe("task template catalog", () => {
  it("contains 144 unique templates with 108 competitive and 36 learn-to-swim tasks", () => {
    expect(taskTemplates).toHaveLength(144);
    expect(tasksForMode("competitive")).toHaveLength(108);
    expect(tasksForMode("learnToSwim")).toHaveLength(36);
    expect(new Set(taskTemplates.map((task) => task.id)).size).toBe(taskTemplates.length);
    expect(new Set(taskTemplates.map((task) => task.title)).size).toBe(taskTemplates.length);
  });

  it("keeps the competitive catalog balanced across six phases and three directions", () => {
    const competitive = tasksForMode("competitive");

    for (const phase of competitivePhases) {
      const phaseTasks = competitive.filter((task) => task.phases.includes(phase));
      expect(phaseTasks).toHaveLength(18);
      for (const direction of directions) {
        expect(tasksForDirection(phaseTasks, direction)).toHaveLength(6);
        for (const level of ["intro", "develop", "race"] as const) {
          expect(tasksForDirection(phaseTasks.filter((task) => task.levels.includes(level)), direction)).toHaveLength(2);
        }
      }
    }
  });

  it("assigns every competitive template to exactly one level", () => {
    for (const task of tasksForMode("competitive")) expect(task.levels).toHaveLength(1);
  });

  it("offers only observed facts that exist in templates for each competitive phase", () => {
    const competitive = tasksForMode("competitive");

    for (const phase of competitivePhases) {
      const observedTags = new Set(
        competitive.filter((task) => task.phases.includes(phase)).flatMap((task) => task.observedTags),
      );
      for (const option of competitiveObservedTagsByPhase[phase]) {
        expect(observedTags, `${phase} has no template for observed fact: ${option}`).toContain(option);
      }
    }
  });

  it("keeps the learn-to-swim catalog balanced across three levels and three directions", () => {
    const learnToSwim = tasksForMode("learnToSwim");

    for (const level of learnLevels) {
      const levelTasks = learnToSwim.filter((task) => task.levels.includes(level));
      expect(levelTasks).toHaveLength(12);
      for (const direction of directions) {
        expect(tasksForDirection(levelTasks, direction)).toHaveLength(4);
      }
    }
  });

  it("keeps every task as a draft with a valid evidence reference", () => {
    const evidenceIds = new Set(evidenceSources.map((source) => source.id));

    for (const task of taskTemplates) {
      expect(task.reviewStatus).toBe("draft");
      expect(task.evidenceNote).toContain("監修前の案");
      expect(task.evidenceIds.length).toBeGreaterThan(0);
      expect(task.evidenceIds.every((id) => evidenceIds.has(id))).toBe(true);
      expect(Object.values(task.prescription).every((value) => value.trim() !== "")).toBe(true);
    }
  });

  it("keeps reference metadata displayable and public", () => {
    for (const source of evidenceSources) {
      expect(source.title.trim()).not.toBe("");
      expect(source.authorsOrOrganisation.trim()).not.toBe("");
      expect(() => new URL(source.url)).not.toThrow();
      expect(new URL(source.url).protocol).toMatch(/^https?:$/);
      expect(source.supports.length).toBeGreaterThan(0);
      expect(source.doesNotProve.length).toBeGreaterThan(0);
    }
  });

  it("does not retain none as equipment and provides one coach-facing cue and observation", () => {
    for (const task of taskTemplates) {
      expect(task.requiredEquipment).not.toContain("none");
      expect(task.optionalEquipment).not.toContain("none");
      expect(task.participantCue.trim()).not.toBe("");
      expect(task.coachObservation.trim()).not.toBe("");
      expect(task.equipmentFunctions.length).toBeGreaterThan(0);
      expect(task.easier.trim()).not.toBe("");
      expect(task.harder.trim()).not.toBe("");
      expect(task.noEquipment.trim()).not.toBe("");
      expect(task.largeGroup.trim()).not.toBe("");
      expect(task.participantCue).not.toMatch(/[\r\n]/);
      expect(task.coachObservation).not.toMatch(/[\r\n]/);
      expect((task.participantCue.match(/[。！？!?]/g) ?? []).length).toBeLessThanOrEqual(1);
      expect((task.coachObservation.match(/[。！？!?]/g) ?? []).length).toBeLessThanOrEqual(1);
    }
  });

  it("keeps no-equipment learn menus free of portable-equipment dependencies", () => {
    const portableEquipmentTerms = [
      "ビート板", "ヌードル", "マット", "フープ", "色マーカー", "浮く物",
      "沈む物", "フィン", "パドル", "プルブイ", "シュノーケル", "抵抗具",
      "四色", "青・赤", "色を置く",
    ];

    for (const task of tasksForMode("learnToSwim")) {
      expect(task.requiredEquipment, task.id).toEqual([]);
      const coreMenu = [
        task.title,
        task.summary,
        ...Object.values(task.prescription),
        task.setup,
        ...task.instructions,
        task.participantCue,
        ...task.successCriteria,
      ].join("\n");
      for (const term of portableEquipmentTerms) {
        expect(coreMenu, `${task.id} depends on ${term}`).not.toContain(term);
      }
    }
  });

  it("keeps coach-facing task copy free of known broken or AI-like wording", () => {
    const forbiddenTerms = [
      "監修前ドラフト", "舟", "星", "三つの駅", "三色の島", "ミッション", "疲れした",
      "選手手がかり", "相互見る", "転移", "試行", "変更情報", "許容幅", "振幅", "協調",
      "転用", "接続", "小さなキックの大きさ", "2つの方法条件", "でも試す", "レースの速さ後",
    ];
    const displayFields = [
      "title", "summary", "primaryConstraintLabel", "fixedConditions", "setup", "instructions",
      "participantCue", "informationToUse", "permittedSolutions", "participantChoices", "successCriteria",
      "coachObservation", "easier", "harder", "noEquipment", "largeGroup",
      "transferConnection", "evidenceNote",
    ] as const;

    for (const task of taskTemplates) {
      const displayCopy = displayFields
        .map((field) => task[field])
        .flat()
        .concat(Object.values(task.prescription))
        .join("\n");
      for (const forbiddenTerm of forbiddenTerms) {
        expect(displayCopy, `${task.id} contains forbidden wording: ${forbiddenTerm}`).not.toContain(forbiddenTerm);
      }
    }
  });

  it("provides one unique static modifier for every result adjustment", () => {
    const actions = ["easier", "harder", "noEquipment", "largeGroup", "changeCue", "moreExplore", "moreTransfer"];
    expect(constraintModifiers.map((modifier) => modifier.action).sort()).toEqual([...actions].sort());
    expect(new Set(constraintModifiers.map((modifier) => modifier.id)).size).toBe(constraintModifiers.length);
  });

  it("can return all three directions without portable equipment for every selectable phase or skill", () => {
    for (const [mode, levels] of [["competitive", ["intro", "develop", "race"]], ["learnToSwim", ["beginner", "intermediate", "advanced"]] ] as const) {
      for (const level of levels) {
        const options = getAvailablePhaseOrDomainOptions(mode, level);
        expect(options.length).toBeGreaterThan(0);
        for (const option of options) {
          const candidates = tasksForMode(mode).filter((task) => task.levels.includes(level) &&
            (mode === "competitive" ? task.phases.includes(option.value as CompetitivePhase) : task.domains.includes(option.value)) &&
            task.requiredEquipment.length === 0);
          const observed = candidates.flatMap((task) => task.observedTags)[0] ?? getAvailableObservedTagOptions(mode, level, option.value)[0]?.value;
          expect(observed, `${mode}/${level}/${option.value} has no observed option`).toBeDefined();
          expect(matchTasks({
            mode, goal: mode === "competitive" ? "firstSuccess" : "confidence", phaseOrDomain: option.value,
            observedTag: observed!, level, equipment: ["none"], details,
          }).cards).toHaveLength(3);
        }
      }
    }
  });

  it("returns different competitive task IDs when only the level changes", () => {
    const ids = ["intro", "develop", "race"].map((level) => {
      const observed = getAvailableObservedTagOptions("competitive", level as "intro" | "develop" | "race", "start")[0]!;
      return matchTasks({ mode: "competitive", goal: "firstSuccess", phaseOrDomain: "start", observedTag: observed.value, level: level as "intro" | "develop" | "race", equipment: ["none"], details }).cards.map((card) => card.id);
    });
    expect(new Set(ids.flat())).toHaveLength(9);
  });

  it("keeps every competitive menu synchronized with its structured amount", () => {
    const competitive = tasksForMode("competitive");
    expect(new Set(competitive.map((task) => task.prescription.activity))).toHaveLength(108);

    for (const task of competitive) {
      expect(task.instructions.join("\n"), task.id).toContain(task.prescription.oneRep);
      expect(task.successCriteria.join("\n"), task.id).toContain(task.prescription.oneRep);
    }

    const startAmounts = ["intro", "develop", "race"].map((level) =>
      competitive.find((task) => task.id === `comp-start-establish-01-${level}`)?.prescription.oneRep,
    );
    expect(startAmounts).toEqual(["スタートから5mまで", "スタートから10mまで", "スタートから15mまで"]);
  });

  it("changes the learn-to-swim candidates when the selected skill changes", () => {
    for (const level of learnLevels) {
      const options = getAvailablePhaseOrDomainOptions("learnToSwim", level);
      expect(options.map((option) => option.value).sort()).toEqual([...learnDomainsByLevel[level]].sort());
      const taskSets = options.map((option) => {
        const observed = getAvailableObservedTagOptions("learnToSwim", level, option.value)[0]!.value;
        return matchTasks({
          mode: "learnToSwim", goal: "confidence", phaseOrDomain: option.value,
          observedTag: observed, level, equipment: ["none"], details,
        }).cards.map((task) => task.id).sort().join("|");
      });
      expect(new Set(taskSets).size, `${level} skills should not all show the same cards`).toBeGreaterThan(1);
    }
  });

  it("keeps every competitive exploration task as an actual comparison", () => {
    for (const task of tasksForMode("competitive").filter((item) => item.direction === "explore")) {
      expect(task.instructions.join("\n"), task.id).toMatch(/2つ|2通り|比べ/);
    }
  });
});
