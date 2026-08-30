import {
  cueOptions,
  currentStates,
  detailOptionLabels,
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

const asOptions = (values: string[]) => values.map((value) => ({
  value,
  label: detailOptionLabels[value] ?? value,
}));

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
        <span>必要なら、もう少し細かく選ぶ</span>
        <small>選ばなくても進めます</small>
      </summary>
      <div className="details-panel__body">
        <MultiChoiceChips
          legend="どのくらいできているか"
          options={asOptions(currentStates)}
          selected={value.currentStates}
          onToggle={(item) => toggle("currentStates", item)}
          compact
        />
        <MultiChoiceChips
          legend="選手・子どもの状態"
          options={asOptions(individualConstraints)}
          selected={value.individualConstraints}
          onToggle={(item) => toggle("individualConstraints", item)}
          compact
        />
        <MultiChoiceChips
          legend="練習のやり方"
          options={asOptions(taskConstraints)}
          selected={value.taskConstraints}
          onToggle={(item) => toggle("taskConstraints", item)}
          compact
        />
        <MultiChoiceChips
          legend="プールや周りの状況"
          options={asOptions(environmentConstraints)}
          selected={value.environmentConstraints}
          onToggle={(item) => toggle("environmentConstraints", item)}
          compact
        />
        <MultiChoiceChips
          legend="人数・時間"
          options={asOptions(implementationConditions)}
          selected={value.implementationConditions}
          onToggle={(item) => toggle("implementationConditions", item)}
          compact
        />
        <MultiChoiceChips
          legend={mode === "competitive" ? "この場面のどこを詳しく見ますか？" : "どんな遊び方で行いますか？"}
          options={asOptions(specificOptions)}
          selected={value.specificConditions}
          onToggle={(item) => toggle("specificConditions", item)}
          compact
        />
        <SingleChoiceChips
          legend="同じ練習で何通り試しますか？"
          options={variabilityOptions}
          selected={value.variabilityLevel}
          onChange={(item) => onChange({ ...value, variabilityLevel: item as VariabilityLevel })}
        />
        <SingleChoiceChips
          legend="やり方をいつ伝えますか？"
          options={presentationOptions}
          selected={value.presentationOrder}
          onChange={(item) => onChange({ ...value, presentationOrder: item as PresentationOrder })}
        />
        <SingleChoiceChips
          legend="どんな声をかけるか"
          options={cueOptions}
          selected={value.cueStyle}
          onChange={(item) => onChange({ ...value, cueStyle: item as CueStyle })}
        />
        <SingleChoiceChips
          legend="試した後にどう伝えるか"
          options={feedbackOptions}
          selected={value.feedbackStyle}
          onChange={(item) => onChange({ ...value, feedbackStyle: item as FeedbackStyle })}
        />
      </div>
    </details>
  );
}
