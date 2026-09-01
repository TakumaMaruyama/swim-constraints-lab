import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MatchInput, TaskTemplate } from "../types";

const templates = vi.hoisted(() => [] as TaskTemplate[]);

vi.mock("../data/taskTemplates", () => ({ taskTemplates: templates }));

import { adjustTask, matchTasks } from "../engine";
import {
  getAvailableObservedTagOptions,
  getAvailablePhaseOrDomainOptions,
  learnDomainsByLevel,
} from "../data/formOptions";

const input: MatchInput = {
  mode: "competitive",
  goal: "stabilize",
  phaseOrDomain: "start",
  observedTag: "初動が遅い",
  level: "develop",
  equipment: ["wall"],
  details: {
    currentStates: [],
    individualConstraints: [],
    taskConstraints: [],
    environmentConstraints: [],
    implementationConditions: [],
    specificConditions: [],
  },
};

const task = (id: string, direction: TaskTemplate["direction"], overrides: Partial<TaskTemplate> = {}): TaskTemplate => ({
  id,
  mode: "competitive",
  direction,
  title: id,
  summary: "スタートの課題",
  phases: ["start"],
  domains: [],
  goals: ["stabilize"],
  observedTags: ["初動が遅い"],
  levels: ["develop"],
  primaryConstraint: direction === "establish" ? "individual" : direction === "explore" ? "task" : "environment",
  primaryConstraintLabel: "条件",
  fixedConditions: ["壁"],
  requiredEquipment: ["wall"],
  optionalEquipment: [],
  equipmentFunctions: [],
  environmentTags: ["個人"],
  setup: "壁から開始する。",
  instructions: ["合図で動く。"],
  participantCue: "壁の音を聞く。",
  informationToUse: ["壁"],
  permittedSolutions: ["自分で選ぶ"],
  participantChoices: ["開始姿勢"],
  successCriteria: ["2回できる"],
  coachObservation: "初動を観察する。",
  prescription: {
    activity: "合図で壁から動く",
    oneRep: "15m",
    repetitions: "3回",
    recovery: "各回30秒",
  },
  variabilityLevel: "constant",
  presentationOrder: "block",
  cueStyle: "outcome",
  feedbackStyle: "oneObservation",
  easier: "距離を短くする。",
  harder: "合図を遅らせる。",
  noEquipment: "壁だけで行う。",
  largeGroup: "3人ずつ行う。",
  transferConnection: "レースの合図につなぐ。",
  evidenceIds: ["source-1"],
  evidenceNote: "監修前の案。",
  reviewStatus: "draft",
  ...overrides,
});

beforeEach(() => {
  templates.splice(
    0,
    templates.length,
    task("establish-a", "establish"),
    task("explore-a", "explore"),
    task("transfer-a", "transfer"),
  );
});

describe("matchTasks", () => {
  it("keeps mode and phase/domain as hard filters and returns three directions", () => {
    templates.push(
      task("wrong-mode", "establish", { mode: "learnToSwim", phases: [], domains: ["水慣れ"] }),
      task("wrong-phase", "explore", { phases: ["turn"] }),
    );

    const result = matchTasks(input);

    expect(result.cards.map((card) => card.direction)).toEqual(["establish", "explore", "transfer"]);
    expect(result.cards.map((card) => card.id)).not.toContain("wrong-mode");
    expect(result.cards.map((card) => card.id)).not.toContain("wrong-phase");
    expect(result.trace.every((trace) => trace.score === 80)).toBe(true);
  });

  it("keeps the selected level as a hard filter", () => {
    templates.push(
      task("intro-establish", "establish", { levels: ["intro"] }),
      task("intro-explore", "explore", { levels: ["intro"] }),
      task("intro-transfer", "transfer", { levels: ["intro"] }),
    );

    const result = matchTasks(input);

    expect(result.cards.map((card) => card.id)).not.toContain("intro-establish");
    expect(result.cards.map((card) => card.id)).not.toContain("intro-explore");
    expect(result.cards.map((card) => card.id)).not.toContain("intro-transfer");
  });

  it("maximizes primary-constraint diversity before score and cycles alternatives stably", () => {
    templates.push(
      task("establish-b", "establish", { primaryConstraint: "task", goals: [] }),
      task("explore-b", "explore", { primaryConstraint: "individual", goals: [] }),
    );

    const first = matchTasks(input, 0);
    const repeated = matchTasks(input, 0);
    const next = matchTasks(input, 1);

    expect(first.cards.map((card) => card.primaryConstraint)).toEqual(["individual", "task", "environment"]);
    expect(repeated.cards.map((card) => card.id)).toEqual(first.cards.map((card) => card.id));
    expect(next.selectedAlternative).toBe(1);
    expect(matchTasks(input, first.alternativeCount).cards.map((card) => card.id)).toEqual(first.cards.map((card) => card.id));
  });

  it("orders later alternatives to minimize shared task ids with the previous result", () => {
    templates.push(
      task("establish-b", "establish", { primaryConstraint: "task" }),
      task("explore-b", "explore", { primaryConstraint: "environment" }),
      task("transfer-b", "transfer", { primaryConstraint: "individual" }),
    );

    const first = matchTasks(input, 0);
    const next = matchTasks(input, 1);
    const firstIds = new Set(first.cards.map((card) => card.id));

    expect(next.cards.filter((card) => firstIds.has(card.id))).toHaveLength(0);
    expect(matchTasks(input, 1).cards.map((card) => card.id)).toEqual(next.cards.map((card) => card.id));
  });

  it("excludes required equipment that is unavailable, and treats none as no required equipment", () => {
    templates.splice(
      0,
      templates.length,
      task("wall-establish", "establish"),
      task("wall-explore", "explore"),
      task("wall-transfer", "transfer"),
      task("none-establish", "establish", { requiredEquipment: [] }),
      task("none-explore", "explore", { requiredEquipment: [] }),
      task("none-transfer", "transfer", { requiredEquipment: [] }),
    );

    const result = matchTasks({ ...input, equipment: ["none"] });

    expect(result.cards.map((card) => card.id)).toEqual(["none-establish", "none-explore", "none-transfer"]);
  });

  it("relaxes cue, feedback, then variability preferences in order", () => {
    const result = matchTasks({
      ...input,
      details: {
        ...input.details,
        cueStyle: "externalFar",
        feedbackStyle: "summary",
        variabilityLevel: "wide",
      },
    });

    expect(result.relaxationSteps).toEqual(["cuePreference", "feedback", "variabilityPreference"]);
    expect(result.cards).toHaveLength(3);
  });
});

describe("form catalogue selectors", () => {
  it("returns only level-specific competitive phases and authored observations", () => {
    expect(getAvailablePhaseOrDomainOptions("competitive", "develop").map((option) => option.value)).toEqual(["start"]);
    expect(getAvailablePhaseOrDomainOptions("competitive", "intro")).toEqual([]);
    expect(getAvailableObservedTagOptions("competitive", "develop", "start").map((option) => option.value))
      .toEqual(["初動が遅い"]);
  });

  it("returns a learn domain only when the selected level has all three directions", () => {
    templates.splice(
      0,
      templates.length,
      task("learn-establish", "establish", {
        mode: "learnToSwim", phases: [], domains: ["顔つけ"], levels: ["beginner"], observedTags: ["顔をつけたがらない"],
      }),
      task("learn-explore", "explore", {
        mode: "learnToSwim", phases: [], domains: ["顔つけ"], levels: ["beginner"], observedTags: ["顔をすぐ上げる"],
      }),
      task("learn-transfer", "transfer", {
        mode: "learnToSwim", phases: [], domains: ["顔つけ"], levels: ["beginner"], observedTags: ["顔をつけたがらない"],
      }),
      task("learn-only-establish", "establish", {
        mode: "learnToSwim", phases: [], domains: ["背浮き"], levels: ["beginner"],
      }),
    );

    expect(getAvailablePhaseOrDomainOptions("learnToSwim", "beginner").map((option) => option.value)).toEqual(["顔つけ"]);
    expect(getAvailableObservedTagOptions("learnToSwim", "beginner", "顔つけ").map((option) => option.value))
      .toEqual(["顔をすぐ上げる", "顔をつけたがらない"]);
  });

  it("limits learn domains to the authored level permission list before checking coverage", () => {
    templates.splice(
      0,
      templates.length,
      ...(["establish", "explore", "transfer"] as const).flatMap((direction) => [
        task(`beginner-${direction}`, direction, {
          mode: "learnToSwim", phases: [], domains: ["水慣れ"], levels: ["beginner"],
        }),
        task(`not-beginner-${direction}`, direction, {
          mode: "learnToSwim", phases: [], domains: ["クロール"], levels: ["beginner"],
        }),
      ]),
    );

    expect(learnDomainsByLevel.beginner).not.toContain("クロール");
    expect(getAvailablePhaseOrDomainOptions("learnToSwim", "beginner").map((option) => option.value)).toEqual(["水慣れ"]);
  });
});

describe("adjustTask", () => {
  it("makes every adjustment visible in the rendered card content", () => {
    const actions = ["easier", "harder", "noEquipment", "largeGroup", "changeCue", "moreExplore", "moreTransfer"] as const;
    const base = task("visible-adjustments", "explore");
    const visibleState = (rendered: ReturnType<typeof adjustTask>) => ({
      prescription: rendered.effectivePrescription,
      setup: rendered.effectiveSetup,
      instructions: rendered.effectiveInstructions,
      participantCue: rendered.effectiveParticipantCue,
      successCriteria: rendered.effectiveSuccessCriteria,
      equipment: rendered.effectiveEquipment,
      transferConnection: rendered.effectiveTransferConnection,
    });
    const unchanged = visibleState(adjustTask(base, []));

    for (const action of actions) {
      expect(visibleState(adjustTask(base, [action])), action).not.toEqual(unchanged);
    }
  });

  it("uses static modifiers and task-specific overrides without generating text", () => {
    const rendered = adjustTask(task("custom", "explore", {
      adjustments: {
        easier: { label: "個別に易しく", participantCue: "水面の変化を選ぶ。" },
      },
    }), ["easier", "harder", "noEquipment", "largeGroup", "changeCue", "moreExplore", "moreTransfer"]);

    expect(rendered.activeAdjustments).toHaveLength(7);
    expect(rendered.activeAdjustments).toContain("個別に易しく");
    expect(rendered.effectiveEquipment).toEqual(["none"]);
    expect(rendered.effectiveInstructions).toEqual(expect.arrayContaining([expect.stringContaining("ねらいは変えず"), expect.stringContaining("本人が変えること")]));
    expect(rendered.effectiveParticipantCue).toBe("今の1回で、一番やりやすかったのはどこ？");
    expect(rendered.variabilityLevel).toBe("medium");
    expect(rendered.presentationOrder).toBe("natural");
  });

  it("applies prescription patches without changing unrelated fields", () => {
    const rendered = adjustTask(task("custom-dose", "establish", {
      adjustments: {
        easier: {
          label: "短くする",
          prescriptionPatch: { oneRep: "10m", repetitions: "2回" },
        },
      },
    }), ["easier"]);

    expect(rendered.effectivePrescription).toEqual({
      activity: "合図で壁から動く",
      oneRep: "10m",
      repetitions: "2回",
      recovery: "各回30秒",
    });
  });
});
