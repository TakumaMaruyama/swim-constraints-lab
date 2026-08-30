export type Mode = "competitive" | "learnToSwim";

export type CardDirection = "establish" | "explore" | "transfer";

export type ConstraintCategory = "individual" | "task" | "environment";

export type EvidenceCategory =
  | "swimmingIntervention"
  | "swimmingResearch"
  | "motorLearning"
  | "officialFramework"
  | "coachPractice";

export type ContentReviewStatus = "draft" | "reviewed";

export type CompetitivePhase =
  | "start"
  | "turn"
  | "underwater"
  | "breakout"
  | "swimming"
  | "finish";

export type CompetitiveLevel = "intro" | "develop" | "race";
export type LearnToSwimLevel = "beginner" | "intermediate" | "advanced";
export type TargetLevel = CompetitiveLevel | LearnToSwimLevel;

export type GoalId =
  | "firstSuccess"
  | "stabilize"
  | "explore"
  | "adapt"
  | "transfer"
  | "discover"
  | "maintainSpeed"
  | "accuracy"
  | "connect"
  | "confidence";

export type EquipmentId =
  | "none"
  | "wall"
  | "kickboard"
  | "noodle"
  | "mat"
  | "hoop"
  | "marker"
  | "floatingObject"
  | "sinkingObject"
  | "fins"
  | "paddles"
  | "pullBuoy"
  | "snorkel"
  | "resistance"
  | "tempo";

export type VariabilityLevel = "constant" | "narrow" | "medium" | "wide";

export type PresentationOrder =
  | "block"
  | "alternate"
  | "series"
  | "random"
  | "preAnnounced"
  | "lastSecond"
  | "during"
  | "participantChoice"
  | "natural";

export type CueStyle =
  | "none"
  | "outcome"
  | "externalNear"
  | "externalFar"
  | "bodySensation"
  | "analogy"
  | "question"
  | "comparison"
  | "demonstration";

export type FeedbackStyle =
  | "resultOnly"
  | "oneObservation"
  | "selfEvaluationFirst"
  | "questionOnly"
  | "demonstration"
  | "showGoodTrial"
  | "summary"
  | "outOfRangeOnly"
  | "onRequest"
  | "none";

export type AdjustmentAction =
  | "easier"
  | "harder"
  | "noEquipment"
  | "largeGroup"
  | "changeCue"
  | "moreExplore"
  | "moreTransfer";

export interface TaskAdjustment {
  label: string;
  setupPrefix?: string;
  instructionSuffix?: string;
  participantCue?: string;
  successCriteriaSuffix?: string;
  suggestedDose?: string;
  variabilityLevel?: VariabilityLevel;
  presentationOrder?: PresentationOrder;
  equipmentOverride?: EquipmentId[];
  transferConnection?: string;
}

export interface TaskTemplate {
  id: string;
  mode: Mode;
  direction: CardDirection;
  title: string;
  summary: string;
  phases: CompetitivePhase[];
  domains: string[];
  goals: GoalId[];
  observedTags: string[];
  levels: TargetLevel[];
  primaryConstraint: ConstraintCategory;
  primaryConstraintLabel: string;
  fixedConditions: string[];
  requiredEquipment: EquipmentId[];
  optionalEquipment: EquipmentId[];
  equipmentFunctions: string[];
  environmentTags: string[];
  setup: string;
  instructions: string[];
  participantCue: string;
  informationToUse: string[];
  permittedSolutions: string[];
  participantChoices: string[];
  successCriteria: string[];
  coachObservation: string;
  suggestedDose: string;
  variabilityLevel: VariabilityLevel;
  presentationOrder: PresentationOrder;
  cueStyle: CueStyle;
  feedbackStyle: FeedbackStyle;
  easier: string;
  harder: string;
  noEquipment: string;
  largeGroup: string;
  transferConnection: string;
  evidenceIds: string[];
  evidenceNote: string;
  reviewStatus: ContentReviewStatus;
  adjustments?: Partial<Record<AdjustmentAction, TaskAdjustment>>;
}

export interface EvidenceSource {
  id: string;
  category: EvidenceCategory;
  title: string;
  authorsOrOrganisation: string;
  year?: number;
  url: string;
  supports: string[];
  doesNotProve: string[];
  verifiedAt: string;
}

export interface MatchDetails {
  currentStates: string[];
  individualConstraints: string[];
  taskConstraints: string[];
  environmentConstraints: string[];
  implementationConditions: string[];
  specificConditions: string[];
  variabilityLevel?: VariabilityLevel;
  presentationOrder?: PresentationOrder;
  cueStyle?: CueStyle;
  feedbackStyle?: FeedbackStyle;
}

export interface MatchInput {
  mode: Mode;
  goal: GoalId;
  phaseOrDomain: string;
  observedTag: string;
  level: TargetLevel;
  equipment: EquipmentId[];
  details: MatchDetails;
}

export type RelaxationStep =
  | "cuePreference"
  | "feedback"
  | "variabilityPreference"
  | "equipmentPreference"
  | "detailPreferences";

export interface MatchTrace {
  templateId: string;
  score: number;
  matched: string[];
}

export interface MatchResult {
  cards: TaskTemplate[];
  relaxationSteps: RelaxationStep[];
  alternativeCount: number;
  selectedAlternative: number;
  trace: MatchTrace[];
}

export interface RenderedTaskCard extends TaskTemplate {
  activeAdjustments: string[];
  effectiveSetup: string;
  effectiveInstructions: string[];
  effectiveParticipantCue: string;
  effectiveSuccessCriteria: string[];
  effectiveSuggestedDose: string;
  effectiveEquipment: EquipmentId[];
  effectiveTransferConnection: string;
}

export interface ConstraintModifier {
  id: string;
  action: AdjustmentAction;
  modes: Mode[];
  directions: CardDirection[];
  adjustment: TaskAdjustment;
}

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}
