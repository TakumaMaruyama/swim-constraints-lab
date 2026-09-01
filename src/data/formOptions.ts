import {
  competitivePhases,
  learnDomains,
  observedTagLabels,
} from "./options";
import { taskTemplates } from "./taskTemplates";
import type {
  CardDirection,
  CompetitivePhase,
  LearnToSwimLevel,
  Mode,
  SelectOption,
  TargetLevel,
  TaskTemplate,
} from "../types";

const directions: CardDirection[] = ["establish", "explore", "transfer"];

/**
 * The lesson flow deliberately exposes a small, level-appropriate skill list.
 * Catalogue coverage still decides whether each entry can actually be selected.
 */
export const learnDomainsByLevel: Record<LearnToSwimLevel, string[]> = {
  beginner: [
    "水慣れ", "顔つけ", "水中呼気", "ボビング", "浮力", "バランス", "うつ伏せ浮き",
    "背浮き", "うつ伏せと仰向けの切替", "回転", "方向づけ",
  ],
  intermediate: [
    "ストリームライン", "壁蹴り", "バタ足", "任意の方法で進む", "呼吸しながら進む",
    "クロール", "背泳ぎ", "平泳ぎ", "バタフライ", "連続泳", "30mクロール",
  ],
  advanced: [
    "ストリームライン", "壁蹴り", "クロール", "背泳ぎ", "平泳ぎ", "バタフライ",
    "壁への接近", "ターン", "泳法切替", "連続泳", "60m個人メドレー",
  ],
};

const hasAllDirections = (templates: TaskTemplate[]) =>
  directions.every((direction) => templates.some((template) => template.direction === direction));

const templatesFor = (mode: Mode, level: TargetLevel) =>
  taskTemplates.filter((template) => template.mode === mode && template.levels.includes(level));

/**
 * Returns only fields that can produce all three card directions at the selected
 * level. It reads the task catalogue, so the UI cannot offer a dead-end choice.
 */
export const getAvailablePhaseOrDomainOptions = (
  mode: Mode,
  level?: TargetLevel,
): SelectOption[] => {
  if (!level) return [];
  const templates = templatesFor(mode, level);
  const source = mode === "competitive"
    ? competitivePhases
    : learnDomains.filter((option) => learnDomainsByLevel[level as LearnToSwimLevel]?.includes(option.value));

  return source.filter((option) => {
    const matching = templates.filter((template) =>
      mode === "competitive"
        ? template.phases.includes(option.value as CompetitivePhase)
        : template.domains.includes(option.value),
    );
    return hasAllDirections(matching);
  });
};

/** Returns only observations authored for the selected mode, level and field. */
export const getAvailableObservedTagOptions = (
  mode: Mode,
  level?: TargetLevel,
  phaseOrDomain?: string,
): SelectOption[] => {
  if (!level || !phaseOrDomain) return [];

  const matching = templatesFor(mode, level).filter((template) =>
    mode === "competitive"
      ? template.phases.includes(phaseOrDomain as CompetitivePhase)
      : template.domains.includes(phaseOrDomain),
  );
  const tags = new Set(matching.flatMap((template) => template.observedTags));
  return [...tags]
    .sort((left, right) => left.localeCompare(right, "ja"))
    .map((value) => ({ value, label: observedTagLabels[value] ?? value }));
};
