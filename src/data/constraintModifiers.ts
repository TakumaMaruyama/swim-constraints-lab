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
      label: "距離・回数を減らしました",
      instructionSuffix: "距離または回数を半分ほどにし、変えるものを1つだけにする。",
      successCriteriaSuffix: "短くした練習で、ねらった動きが2回続けてできる。",
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
      label: "条件を1つ難しくしました",
      instructionSuffix: "ねらいは変えず、速さ・距離・合図のタイミングのうち1つだけ難しくする。",
      successCriteriaSuffix: "難しくした後も、ねらった動きができる。",
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
      label: "用具なしに変更しました",
      setupPrefix: "用具を外し、壁・底のライン・水面を目印にする。",
      instructionSuffix: "用具の代わりに、壁・水・体の感じを手がかりにして同じ動きを目指す。",
      equipmentOverride: [],
    },
  },
  {
    id: "large-group-lanes",
    action: "largeGroup",
    modes: [...allModes],
    directions: [...allDirections],
    adjustment: {
      label: "大人数用に変更しました",
      setupPrefix: "同じ練習を2〜4レーンまたは小グループに分け、スタート位置をずらす。",
      instructionSuffix: "説明は共通の一言にする。待つ人は、直前の人の動きを1つ見る。",
    },
  },
  {
    id: "change-cue-question",
    action: "changeCue",
    modes: [...allModes],
    directions: [...allDirections],
    adjustment: {
      label: "声かけを質問に変えました",
      participantCue: "今の1回で、一番やりやすかったのはどこ？",
    },
  },
  {
    id: "increase-exploration",
    action: "moreExplore",
    modes: [...allModes],
    directions: [...allDirections],
    adjustment: {
      label: "2つのやり方を比べる形に変えました",
      instructionSuffix: "ねらいは変えず、本人が変えることを1つ選び、2つのやり方を比べる。",
      successCriteriaSuffix: "2つのやり方の違いを、本人が言葉または動きで示せる。",
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
      label: "実際の場面に近い条件を1つ加えました",
      instructionSuffix: "最後の1回は、壁・合図・息継ぎ・隣の選手との間隔のうち1つを加える。",
      successCriteriaSuffix: "加えた条件があっても、ねらった動きが1回以上できる。",
      variabilityLevel: "medium",
      presentationOrder: "natural",
    },
  },
];
