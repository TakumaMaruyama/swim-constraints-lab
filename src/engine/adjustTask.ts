import type {
  AdjustmentAction,
  EquipmentId,
  RenderedTaskCard,
  TaskAdjustment,
  TaskTemplate,
} from "../types";
import { constraintModifiers } from "../data/constraintModifiers";

const unique = <T,>(values: T[]) => [...new Set(values)];

const fallbackAdjustment = (template: TaskTemplate, action: AdjustmentAction): TaskAdjustment => {
  const genericInstruction = {
    easier: template.easier,
    harder: template.harder,
    noEquipment: template.noEquipment,
    largeGroup: template.largeGroup,
    changeCue: undefined,
    moreExplore: undefined,
    moreTransfer: undefined,
  }[action];
  return {
    label: action,
    ...(genericInstruction ? { instructionSuffix: genericInstruction } : {}),
    ...(action === "noEquipment" ? { equipmentOverride: [] } : {}),
    ...(action === "moreTransfer" ? { transferConnection: template.transferConnection } : {}),
  };
};

const modifierAdjustmentFor = (template: TaskTemplate, action: AdjustmentAction) =>
  constraintModifiers.find(
    (modifier) =>
      modifier.action === action &&
      modifier.modes.includes(template.mode) &&
      modifier.directions.includes(template.direction),
  )?.adjustment;

const adjustmentFor = (template: TaskTemplate, action: AdjustmentAction): TaskAdjustment => ({
  ...fallbackAdjustment(template, action),
  ...modifierAdjustmentFor(template, action),
  ...template.adjustments?.[action],
});

/** Applies only pre-authored static changes. It never generates new task text. */
export const adjustTask = (
  template: TaskTemplate,
  actions: AdjustmentAction[] = [],
  availableEquipment?: EquipmentId[],
): RenderedTaskCard => {
  let effectiveSetup = template.setup;
  const effectiveInstructions = [...template.instructions];
  let effectiveParticipantCue = template.participantCue;
  const effectiveSuccessCriteria = [...template.successCriteria];
  let effectivePrescription = { ...template.prescription };
  const available: EquipmentId[] | undefined = availableEquipment?.filter((item) => item !== "none");
  let effectiveEquipment: EquipmentId[] = available
    ? unique([
      ...template.requiredEquipment,
      ...template.optionalEquipment.filter((item) => available.includes(item)),
    ])
    : unique([...template.requiredEquipment, ...template.optionalEquipment]);
  let effectiveTransferConnection = template.transferConnection;
  let variabilityLevel = template.variabilityLevel;
  let presentationOrder = template.presentationOrder;
  const activeAdjustments: string[] = [];

  for (const action of unique(actions)) {
    const adjustment = adjustmentFor(template, action);
    activeAdjustments.push(adjustment.label);
    if (adjustment.setupPrefix) effectiveSetup = `${adjustment.setupPrefix}${effectiveSetup}`;
    if (adjustment.instructionSuffix) effectiveInstructions.push(adjustment.instructionSuffix);
    if (adjustment.participantCue) effectiveParticipantCue = adjustment.participantCue;
    if (adjustment.successCriteriaSuffix) effectiveSuccessCriteria.push(adjustment.successCriteriaSuffix);
    if (adjustment.prescriptionPatch) {
      effectivePrescription = { ...effectivePrescription, ...adjustment.prescriptionPatch };
    }
    if (adjustment.equipmentOverride) effectiveEquipment = adjustment.equipmentOverride;
    if (adjustment.variabilityLevel) variabilityLevel = adjustment.variabilityLevel;
    if (adjustment.presentationOrder) presentationOrder = adjustment.presentationOrder;
    if (adjustment.transferConnection) effectiveTransferConnection = adjustment.transferConnection;
  }

  if (effectiveEquipment.length === 0) effectiveEquipment = ["none"];

  return {
    ...template,
    variabilityLevel,
    presentationOrder,
    activeAdjustments,
    effectiveSetup,
    effectiveInstructions,
    effectiveParticipantCue,
    effectiveSuccessCriteria,
    effectivePrescription,
    effectiveEquipment,
    effectiveTransferConnection,
  };
};
