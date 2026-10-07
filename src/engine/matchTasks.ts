import { taskTemplates } from "../data/taskTemplates";
import type {
  CardDirection,
  EquipmentId,
  MatchInput,
  MatchResult,
  MatchTrace,
  RelaxationStep,
  TaskTemplate,
} from "../types";

type ScoredTemplate = {
  template: TaskTemplate;
  score: number;
  matched: string[];
};

type CandidateCombination = {
  candidates: ScoredTemplate[];
  distinctConstraints: number;
  totalScore: number;
  idKey: string;
};

const directions: CardDirection[] = ["establish", "explore", "transfer"];

const equipmentWithoutNone = (equipment: EquipmentId[]): EquipmentId[] =>
  equipment.filter((item) => item !== "none");

const relaxationOrderFor = (input: MatchInput): RelaxationStep[] => {
  const { details } = input;
  const hasDetailPreferences = [
    details.currentStates,
    details.individualConstraints,
    details.taskConstraints,
    details.environmentConstraints,
    details.implementationConditions,
    details.specificConditions,
  ].some((values) => values.length > 0);

  return [
    ...(details.cueStyle ? ["cuePreference" as const] : []),
    ...(details.feedbackStyle ? ["feedback" as const] : []),
    ...(details.variabilityLevel || details.presentationOrder ? ["variabilityPreference" as const] : []),
    ...(equipmentWithoutNone(input.equipment).length > 0 ? ["equipmentPreference" as const] : []),
    ...(hasDetailPreferences ? ["detailPreferences" as const] : []),
  ];
};

const hasOverlap = (values: string[], requested: string[]) =>
  requested.some((value) => values.includes(value));

const includesAnyTerm = (template: TaskTemplate, terms: string[]) => {
  if (terms.length === 0) return true;

  const text = [
    template.title,
    template.summary,
    template.primaryConstraintLabel,
    ...template.observedTags,
    ...template.environmentTags,
    ...template.fixedConditions,
    ...template.instructions,
    template.setup,
  ].join("\n");

  return terms.some((term) => text.includes(term));
};

const matchesRequiredEquipment = (template: TaskTemplate, equipment: EquipmentId[]) => {
  const available = equipmentWithoutNone(equipment);
  if (available.length === 0) return template.requiredEquipment.length === 0;
  return template.requiredEquipment.every((item) => available.includes(item));
};

const matchesPreferences = (
  template: TaskTemplate,
  input: MatchInput,
  relaxed: ReadonlySet<RelaxationStep>,
) => {
  const { details } = input;

  if (!relaxed.has("cuePreference")) {
    if (details.cueStyle && template.cueStyle !== details.cueStyle) return false;
  }

  if (!relaxed.has("variabilityPreference")) {
    if (details.variabilityLevel && template.variabilityLevel !== details.variabilityLevel) return false;
    if (details.presentationOrder && template.presentationOrder !== details.presentationOrder) return false;
  }

  if (!relaxed.has("feedback") && details.feedbackStyle && template.feedbackStyle !== details.feedbackStyle) {
    return false;
  }

  const selectedEquipment = equipmentWithoutNone(input.equipment);
  if (!relaxed.has("equipmentPreference") && selectedEquipment.length > 0) {
    const templateEquipment = [...template.requiredEquipment, ...template.optionalEquipment];
    if (!hasOverlap(templateEquipment, selectedEquipment)) return false;
  }

  if (!relaxed.has("detailPreferences")) {
    const detailTerms = [
      ...details.currentStates,
      ...details.individualConstraints,
      ...details.taskConstraints,
      ...details.environmentConstraints,
      ...details.implementationConditions,
      ...details.specificConditions,
    ];
    if (!includesAnyTerm(template, detailTerms)) return false;
  }

  return true;
};

const scoreTemplate = (template: TaskTemplate, input: MatchInput): ScoredTemplate => {
  const { details } = input;
  const matched: string[] = [`局面・技能領域: ${input.phaseOrDomain}`];
  let score = 25;

  if (template.goals.includes(input.goal)) {
    score += 30;
    matched.push("今日の狙い");
  }
  if (template.observedTags.includes(input.observedTag)) {
    score += 20;
    matched.push("観察事実");
  }
  const environmentTerms = [
    ...details.environmentConstraints,
    ...details.implementationConditions,
  ];
  if (hasOverlap(template.environmentTags, environmentTerms)) {
    score += 5;
    matched.push("環境・実施条件");
  }

  const selectedEquipment = equipmentWithoutNone(input.equipment);
  if (hasOverlap([...template.requiredEquipment, ...template.optionalEquipment], selectedEquipment)) {
    score += 5;
    matched.push("用具");
  }

  const matchesCueOrVariability = Boolean(
    (details.variabilityLevel && template.variabilityLevel === details.variabilityLevel) ||
      (details.presentationOrder && template.presentationOrder === details.presentationOrder) ||
      (details.cueStyle && template.cueStyle === details.cueStyle),
  );
  if (matchesCueOrVariability) {
    score += 5;
    matched.push("声かけ・変動設定");
  }

  return { template, score, matched };
};

const isHardMatch = (template: TaskTemplate, input: MatchInput) =>
  template.mode === input.mode &&
  (template.phases.some((phase) => phase === input.phaseOrDomain) || template.domains.includes(input.phaseOrDomain)) &&
  template.levels.includes(input.level) &&
  matchesRequiredEquipment(template, input.equipment);

const getCandidates = (input: MatchInput, relaxed: ReadonlySet<RelaxationStep>, catalog: TaskTemplate[]) =>
  catalog
    .filter((template) => isHardMatch(template, input))
    .filter((template) => matchesPreferences(template, input, relaxed))
    .map((template) => scoreTemplate(template, input))
    .sort((left, right) => right.score - left.score || left.template.id.localeCompare(right.template.id));

const makeCombinations = (candidates: ScoredTemplate[]): CandidateCombination[] => {
  const byDirection = directions.map((direction) => candidates.filter((candidate) => candidate.template.direction === direction));
  if (byDirection.some((group) => group.length === 0)) return [];

  const combinations: CandidateCombination[] = [];
  for (const establish of byDirection[0]) {
    for (const explore of byDirection[1]) {
      for (const transfer of byDirection[2]) {
        const selected = [establish, explore, transfer];
        combinations.push({
          candidates: selected,
          distinctConstraints: new Set(selected.map((candidate) => candidate.template.primaryConstraint)).size,
          totalScore: selected.reduce((total, candidate) => total + candidate.score, 0),
          idKey: selected.map((candidate) => candidate.template.id).join("\u0000"),
        });
      }
    }
  }

  return combinations.sort(
    (left, right) =>
      right.distinctConstraints - left.distinctConstraints ||
      right.totalScore - left.totalScore ||
      left.idKey.localeCompare(right.idKey),
  );
};

const sharedTaskCount = (left: CandidateCombination, right: CandidateCombination) => {
  const rightIds = new Set(right.candidates.map((candidate) => candidate.template.id));
  return left.candidates.filter((candidate) => rightIds.has(candidate.template.id)).length;
};

/**
 * Keeps the highest-ranked combination first. Subsequent alternatives are chosen
 * against the immediately preceding result so each click changes as much as
 * possible without using randomness.
 */
const orderAlternatives = (combinations: CandidateCombination[]) => {
  if (combinations.length < 2) return combinations;

  const remaining = [...combinations];
  const ordered = [remaining.shift()!];

  while (remaining.length > 0) {
    const previous = ordered.at(-1)!;
    remaining.sort(
      (left, right) =>
        sharedTaskCount(left, previous) - sharedTaskCount(right, previous) ||
        right.distinctConstraints - left.distinctConstraints ||
        right.totalScore - left.totalScore ||
        left.idKey.localeCompare(right.idKey),
    );
    ordered.push(remaining.shift()!);
  }

  return ordered;
};

/**
 * Returns one task in each direction. Matching is deliberately deterministic:
 * identical input always produces the same card order and alternative cycle.
 */
export const matchTasks = (input: MatchInput, alternativeIndex = 0, catalog = taskTemplates): MatchResult => {
  const relaxed = new Set<RelaxationStep>();
  let candidates = getCandidates(input, relaxed, catalog);
  let combinations = makeCombinations(candidates);

  for (const step of relaxationOrderFor(input)) {
    if (combinations.length > 0) break;
    relaxed.add(step);
    candidates = getCandidates(input, relaxed, catalog);
    combinations = makeCombinations(candidates);
  }

  if (combinations.length === 0) {
    return {
      cards: [],
      relaxationSteps: [...relaxed],
      alternativeCount: 0,
      selectedAlternative: 0,
      trace: [],
    };
  }

  const orderedCombinations = orderAlternatives(combinations);
  const selectedAlternative = ((alternativeIndex % orderedCombinations.length) + orderedCombinations.length) % orderedCombinations.length;
  const selected = orderedCombinations[selectedAlternative];
  const trace: MatchTrace[] = selected.candidates.map(({ template, score, matched }) => ({
    templateId: template.id,
    score,
    matched,
  }));

  return {
    cards: selected.candidates.map((candidate) => candidate.template),
    relaxationSteps: [...relaxed],
    alternativeCount: orderedCombinations.length,
    selectedAlternative,
    trace,
  };
};
