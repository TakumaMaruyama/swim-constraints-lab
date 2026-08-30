import { expect, it } from "vitest";
import adjustTaskSource from "../engine/adjustTask.ts?raw";
import matchTasksSource from "../engine/matchTasks.ts?raw";

it("does not use Math.random in task selection or adjustment", () => {
  expect(matchTasksSource).not.toContain("Math.random");
  expect(adjustTaskSource).not.toContain("Math.random");
});
