import type { ConstraintModifier } from "../types";

const allDirections = ["establish", "explore", "transfer"] as const;
const allModes = ["competitive", "learnToSwim"] as const;

export const constraintModifiers: ConstraintModifier[] = [
  {
    id: "easier-shorten-and-simplify",
    action: "easier",
    modes: [...allModes],
    directions: [...allDirections],
    adjustment: {
      label: "易しく調整",
      instructionSuffix: "距離または反復を半分程度にし、変える条件を1つだけにして試す。",
      successCriteriaSuffix: "短くした条件で、狙った結果が続けて2回起きる。",
      suggestedDose: "短い距離または2〜3回を1セット",
      variabilityLevel: "constant",
      presentationOrder: "block",
    },
  },
  {
    id: "harder-add-information",
    action: "harder",
    modes: [...allModes],
    directions: [...allDirections],
    adjustment: {
      label: "難しく調整",
      instructionSuffix: "成果は変えず、速度・距離・合図の時点のうち1つを難しくする。",
      successCriteriaSuffix: "条件が変わっても、利用する情報と狙った結果が保たれる。",
      variabilityLevel: "medium",
      presentationOrder: "alternate",
    },
  },
  {
    id: "remove-equipment",
    action: "noEquipment",
    modes: [...allModes],
    directions: [...allDirections],
    adjustment: {
      label: "用具なし",
      setupPrefix: "用具を外し、壁・ライン・水面など元からある情報で目標を示す。",
      instructionSuffix: "用具が与えていた情報を、壁・水・身体の変化から探して同じ成果を目指す。",
      equipmentOverride: [],
    },
  },
  {
    id: "large-group-lanes",
    action: "largeGroup",
    modes: [...allModes],
    directions: [...allDirections],
    adjustment: {
      label: "大人数向け",
      setupPrefix: "同じ課題を2〜4レーンまたは小グループへ複製し、開始位置をずらす。",
      instructionSuffix: "説明は共通の一言だけにし、待つ人は直前の試行で起きた結果を1つ観察する。",
    },
  },
  {
    id: "change-cue-question",
    action: "changeCue",
    modes: [...allModes],
    directions: [...allDirections],
    adjustment: {
      label: "声かけを問いへ変更",
      participantCue: "今の試行では、どの情報が一番役に立った？",
    },
  },
  {
    id: "increase-exploration",
    action: "moreExplore",
    modes: [...allModes],
    directions: [...allDirections],
    adjustment: {
      label: "探索を追加",
      instructionSuffix: "同じ成果を保ったまま、本人が変える条件を1つ選び、A/Bで違いを比べる。",
      successCriteriaSuffix: "A/Bの違いを本人が1つ言葉または動きで示せる。",
      variabilityLevel: "medium",
      presentationOrder: "participantChoice",
    },
  },
  {
    id: "restore-representative-information",
    action: "moreTransfer",
    modes: [...allModes],
    directions: [...allDirections],
    adjustment: {
      label: "実場面へ接続",
      instructionSuffix: "最後の試行では、壁・合図・呼吸・他者との間隔など実場面の情報を1つ戻す。",
      successCriteriaSuffix: "戻した情報を使いながら、狙った結果が1回以上起きる。",
      variabilityLevel: "medium",
      presentationOrder: "natural",
    },
  },
];
