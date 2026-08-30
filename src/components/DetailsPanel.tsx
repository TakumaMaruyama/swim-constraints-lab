import {
  cueOptions,
  currentStates,
  environmentConstraints,
  feedbackOptions,
  implementationConditions,
  individualConstraints,
  phaseSpecificConditions,
  playFormats,
  presentationOptions,
  taskConstraints,
  variabilityOptions,
} from "../data/options";
import type {
  CompetitivePhase,
  CueStyle,
  FeedbackStyle,
  MatchDetails,
  Mode,
  PresentationOrder,
  VariabilityLevel,
} from "../types";
import { MultiChoiceChips, SingleChoiceChips } from "./ChoiceChips";

interface DetailsPanelProps {
  mode: Mode;
  phaseOrDomain?: string;
  value: MatchDetails;
  onChange: (value: MatchDetails) => void;
}

type ArrayKey =
  | "currentStates"
  | "individualConstraints"
  | "taskConstraints"
  | "environmentConstraints"
  | "implementationConditions"
  | "specificConditions";

export function DetailsPanel({ mode, phaseOrDomain, value, onChange }: DetailsPanelProps) {
  const toggle = (key: ArrayKey, item: string) => {
    const values = value[key];
    onChange({
      ...value,
      [key]: values.includes(item) ? values.filter((entry) => entry !== item) : [...values, item],
    });
  };

  const specificOptions = mode === "competitive" && phaseOrDomain
    ? phaseSpecificConditions[phaseOrDomain as CompetitivePhase] ?? []
    : playFormats;

  return (
    <details className="details-panel">
      <summary>
        <span>詳細条件を設定する</span>
        <small>任意・あとから変更できます</small>
      </summary>
      <div className="details-panel__body">
        <MultiChoiceChips
          legend="現在の状態"
          options={currentStates.map((label) => ({ value: label, label }))}
          selected={value.currentStates}
          onToggle={(item) => toggle("currentStates", item)}
          compact
        />
        <MultiChoiceChips
          legend="Individual constraints"
          options={individualConstraints.map((label) => ({ value: label, label }))}
          selected={value.individualConstraints}
          onToggle={(item) => toggle("individualConstraints", item)}
          compact
        />
        <MultiChoiceChips
          legend="Task constraints"
          options={taskConstraints.map((label) => ({ value: label, label }))}
          selected={value.taskConstraints}
          onToggle={(item) => toggle("taskConstraints", item)}
          compact
        />
        <MultiChoiceChips
          legend="Environment constraints"
          options={environmentConstraints.map((label) => ({ value: label, label }))}
          selected={value.environmentConstraints}
          onToggle={(item) => toggle("environmentConstraints", item)}
          compact
        />
        <MultiChoiceChips
          legend="実施条件"
          options={implementationConditions.map((label) => ({ value: label, label }))}
          selected={value.implementationConditions}
          onToggle={(item) => toggle("implementationConditions", item)}
          compact
        />
        <MultiChoiceChips
          legend={mode === "competitive" ? "局面の詳細" : "遊び・課題形式"}
          options={specificOptions.map((label) => ({ value: label, label }))}
          selected={value.specificConditions}
          onToggle={(item) => toggle("specificConditions", item)}
          compact
        />
        <SingleChoiceChips
          legend="変動量"
          options={variabilityOptions}
          selected={value.variabilityLevel}
          onChange={(item) => onChange({ ...value, variabilityLevel: item as VariabilityLevel })}
        />
        <SingleChoiceChips
          legend="条件の提示順"
          options={presentationOptions}
          selected={value.presentationOrder}
          onChange={(item) => onChange({ ...value, presentationOrder: item as PresentationOrder })}
        />
        <SingleChoiceChips
          legend="声かけ形式"
          options={cueOptions}
          selected={value.cueStyle}
          onChange={(item) => onChange({ ...value, cueStyle: item as CueStyle })}
        />
        <SingleChoiceChips
          legend="フィードバック形式"
          options={feedbackOptions}
          selected={value.feedbackStyle}
          onChange={(item) => onChange({ ...value, feedbackStyle: item as FeedbackStyle })}
        />
      </div>
    </details>
  );
}
