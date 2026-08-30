import { describe, expect, it } from "vitest";
import { evidenceSources } from "../data/evidenceSources";
import { constraintModifiers } from "../data/constraintModifiers";
import { learnDomains as learnDomainOptions } from "../data/options";
import { taskTemplates } from "../data/taskTemplates";
import { matchTasks } from "../engine";
import type { CardDirection, CompetitivePhase, LearnToSwimLevel, Mode, TaskTemplate } from "../types";

const directions: CardDirection[] = ["establish", "explore", "transfer"];
const competitivePhases: CompetitivePhase[] = ["start", "turn", "underwater", "breakout", "swimming", "finish"];
const learnLevels: LearnToSwimLevel[] = ["beginner", "intermediate", "advanced"];

const tasksForMode = (mode: Mode) => taskTemplates.filter((task) => task.mode === mode);
const tasksForDirection = (tasks: TaskTemplate[], direction: CardDirection) =>
  tasks.filter((task) => task.direction === direction);

describe("task template catalog", () => {
  it("contains at least 72 unique templates with 36 or more in each mode", () => {
    expect(taskTemplates.length).toBeGreaterThanOrEqual(72);
    expect(tasksForMode("competitive")).toHaveLength(36);
    expect(tasksForMode("learnToSwim")).toHaveLength(36);
    expect(new Set(taskTemplates.map((task) => task.id)).size).toBe(taskTemplates.length);
    expect(new Set(taskTemplates.map((task) => task.title)).size).toBe(taskTemplates.length);
  });

  it("keeps the competitive catalog balanced across six phases and three directions", () => {
    const competitive = tasksForMode("competitive");

    for (const phase of competitivePhases) {
      const phaseTasks = competitive.filter((task) => task.phases.includes(phase));
      expect(phaseTasks).toHaveLength(6);
      for (const direction of directions) {
        expect(tasksForDirection(phaseTasks, direction)).toHaveLength(2);
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
      expect(task.evidenceNote).toContain("監修前ドラフト");
      expect(task.evidenceIds.length).toBeGreaterThan(0);
      expect(task.evidenceIds.every((id) => evidenceIds.has(id))).toBe(true);
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

  it("provides one unique static modifier for every result adjustment", () => {
    const actions = ["easier", "harder", "noEquipment", "largeGroup", "changeCue", "moreExplore", "moreTransfer"];
    expect(constraintModifiers.map((modifier) => modifier.action).sort()).toEqual([...actions].sort());
    expect(new Set(constraintModifiers.map((modifier) => modifier.id)).size).toBe(constraintModifiers.length);
  });

  it("can return all three directions without portable equipment for every selectable phase or skill", () => {
    const details = {
      currentStates: [], individualConstraints: [], taskConstraints: [], environmentConstraints: [],
      implementationConditions: [], specificConditions: [],
    };

    for (const phase of competitivePhases) {
      expect(matchTasks({
        mode: "competitive", goal: "firstSuccess", phaseOrDomain: phase,
        observedTag: "合図後の初動が遅い", level: "intro", equipment: ["none"], details,
      }).cards).toHaveLength(3);
    }

    for (const domain of learnDomainOptions) {
      expect(matchTasks({
        mode: "learnToSwim", goal: "confidence", phaseOrDomain: domain.value,
        observedTag: "水に入ることを嫌がる", level: "beginner", equipment: ["none"], details,
      }).cards).toHaveLength(3);
    }
  });
});
