import type {
  CompetitiveLevel,
  CompetitivePhase,
  CueStyle,
  EquipmentId,
  FeedbackStyle,
  GoalId,
  LearnToSwimLevel,
  Mode,
  PresentationOrder,
  SelectOption,
  VariabilityLevel,
} from "../types";

export const modes: SelectOption<Mode>[] = [
  { value: "competitive", label: "競泳版", description: "競泳選手と競泳コーチ向け" },
  { value: "learnToSwim", label: "習い事水泳版", description: "子どもと水泳指導者向け" },
];

export const goals: SelectOption<GoalId>[] = [
  { value: "firstSuccess", label: "初めて成立させる" },
  { value: "stabilize", label: "成功を安定させる" },
  { value: "explore", label: "別の方法を探索する" },
  { value: "adapt", label: "条件変化へ適応する" },
  { value: "transfer", label: "実戦・実場面へつなげる" },
  { value: "discover", label: "本人に情報を発見させる" },
  { value: "maintainSpeed", label: "速度を維持する" },
  { value: "accuracy", label: "正確性を高める" },
  { value: "connect", label: "動作間を途切れずつなぐ" },
  { value: "confidence", label: "自信や安心感を高める" },
];

export const competitivePhases: SelectOption<CompetitivePhase>[] = [
  { value: "start", label: "スタート" },
  { value: "turn", label: "ターン" },
  { value: "underwater", label: "水中動作" },
  { value: "breakout", label: "ブレイクアウト" },
  { value: "swimming", label: "泳動作" },
  { value: "finish", label: "フィニッシュ" },
];

export const learnDomains = [
  "水慣れ", "顔つけ", "水中呼気", "ボビング", "浮力", "バランス", "うつ伏せ浮き", "背浮き",
  "うつ伏せと仰向けの切替", "回転", "方向づけ", "ストリームライン", "壁蹴り", "バタ足",
  "任意の方法で進む", "呼吸しながら進む", "クロール", "背泳ぎ", "平泳ぎ", "バタフライ",
  "壁への接近", "ターン", "泳法切替", "連続泳", "30mクロール", "60m個人メドレー",
].map((label) => ({ value: label, label }));

const learnDomainFamilies: string[][] = [
  [
    "水慣れ", "顔つけ", "水中呼気", "ボビング", "浮力", "バランス", "うつ伏せ浮き",
    "背浮き", "うつ伏せと仰向けの切替", "回転", "方向づけ",
  ],
  [
    "ストリームライン", "壁蹴り", "バタ足", "任意の方法で進む", "呼吸しながら進む",
    "クロール", "背泳ぎ", "平泳ぎ", "バタフライ", "連続泳", "30mクロール",
  ],
  [
    "壁への接近", "ターン", "泳法切替", "60m個人メドレー", "連続泳", "ストリームライン", "壁蹴り",
  ],
];

/** A template explicitly supports its primary skill and closely related skills in the same static family. */
export const compatibleLearnDomains = (primaryDomain: string): string[] => {
  const related = learnDomainFamilies
    .filter((family) => family.includes(primaryDomain))
    .flat();
  return [...new Set([primaryDomain, ...related])];
};

export const competitiveLevels: SelectOption<CompetitiveLevel>[] = [
  { value: "intro", label: "導入", description: "局面の成果を初めて成立させる段階" },
  { value: "develop", label: "発展", description: "複数条件で安定・探索する段階" },
  { value: "race", label: "レース実践", description: "速度・疲労・相手情報へ接続する段階" },
];

export const learnLevels: SelectOption<LearnToSwimLevel>[] = [
  { value: "beginner", label: "初級", description: "補助具なしで5m程度進み、自分で呼吸することを目指す" },
  { value: "intermediate", label: "中級", description: "足をつかず、呼吸しながら30mクロールを目指す" },
  { value: "advanced", label: "上級", description: "四泳法・ターン・泳法切替で60m個人メドレーを目指す" },
];

export const competitiveObservedTags = [
  "合図後の初動が遅い", "入水時に形が崩れる", "入水が深すぎる", "入水が浅すぎる",
  "プッシュオフ後に減速する", "水中キックが途中で変わる", "浮上が早すぎる", "浮上が遅すぎる",
  "浮上時に一度止まる", "第一ストロークへつながらない", "第一呼吸で速度が落ちる",
  "壁前で小さな調整が増える", "ターンで進入速度を失う", "壁を押す方向が毎回変わる",
  "ターン後に深くなりすぎる", "速度を上げるとストロークが短くなる",
  "疲れるとストローク数が急増する", "テンポを変えると崩れる", "呼吸側を変えると崩れる",
  "隣に選手がいるとリズムが変わる", "フィニッシュで流す", "フィニッシュで壁に詰まる",
  "一つの方法でしか成功しない", "フレッシュ時はできるが疲労時に崩れる",
];

export const learnObservedTags = [
  "水に入ることを嫌がる", "顔をつけたがらない", "顔をすぐ上げる", "水中で息を吐けない",
  "呼吸すると止まる", "息継ぎ後に立つ", "足をすぐ底につく", "身体に力が入る",
  "浮くときに動き続ける", "仰向けを嫌がる", "うつ伏せから仰向けになれない",
  "方向を変えられない", "壁から離れられない", "補助具に依存する", "キックだけでは進まない",
  "腕を使うとキックが止まる", "呼吸すると姿勢が変わる", "一つの泳ぎ方に固定している",
  "15mは泳げるが30mで止まる", "壁で完全に止まる", "泳法切替に時間がかかる",
  "疲れると動きが小さくなる", "説明が増えると動けなくなる", "順番待ちで集中が切れる",
];

export const equipmentOptions: SelectOption<EquipmentId>[] = [
  { value: "none", label: "なし" }, { value: "wall", label: "壁" },
  { value: "kickboard", label: "ビート板" }, { value: "noodle", label: "ヌードル" },
  { value: "mat", label: "マット" }, { value: "hoop", label: "フープ" },
  { value: "marker", label: "色マーカー" }, { value: "floatingObject", label: "浮く物" },
  { value: "sinkingObject", label: "沈む物" }, { value: "fins", label: "フィン" },
  { value: "paddles", label: "パドル" }, { value: "pullBuoy", label: "プルブイ" },
  { value: "snorkel", label: "シュノーケル" }, { value: "resistance", label: "抵抗具" },
  { value: "tempo", label: "テンポ音" },
];

export const currentStates = [
  "まだ成立しない", "特定条件なら成立する", "成功と失敗が混在する", "安定している",
  "一つの方法に固定している", "条件が変わると崩れる", "速度を上げると崩れる", "疲れると崩れる",
  "情報が増えると迷う", "急ぐと崩れる", "不安や怖さがある",
];

export const individualConstraints = [
  "経験段階", "自信", "水への安心度", "疲労", "体調", "痛み・違和感", "身長・体格", "リーチ",
  "浮きやすさ・沈みやすさ", "可動性", "筋力・パワー", "得意側", "呼吸側",
  "現在使える解決方法の数", "理解できる情報量", "視覚・聴覚等のアクセシビリティ",
  "ゴーグルの有無", "補助の必要性",
];

export const taskConstraints = [
  "距離", "実施時間", "反復回数", "速度・強度", "目標ゾーン", "開始姿勢", "終了地点", "経路",
  "進行方向", "使用泳法", "任意の泳ぎ方", "使用できる腕・脚", "呼吸側", "呼吸頻度",
  "呼吸できる場所", "ストローク数", "キック数", "テンポ", "動作順序", "休息時間", "使用用具",
  "ルール", "得点方法", "停止可否", "選べる解決方法の数", "選手・子どもが選べる項目",
];

export const environmentConstraints = [
  "プール長", "水深", "使用コース数", "レーン幅", "壁", "底のライン", "レーンロープ", "フラッグ",
  "水上・水中マーカー", "視認性", "光", "音", "スタート合図", "周囲の騒音", "隣の泳者",
  "他者との距離", "水面の穏やかさ", "波・乱流", "個人・ペア・集団", "協力・競争",
];

export const implementationConditions = [
  "参加人数", "指導者数", "実施可能時間", "個人", "ペア", "小グループ", "全体",
  "能力が近い集団", "能力差がある集団", "待ち時間を減らしたい", "説明時間を減らしたい",
];

export const variabilityOptions: SelectOption<VariabilityLevel>[] = [
  { value: "constant", label: "一定", description: "同じ条件で安定化する" },
  { value: "narrow", label: "狭い", description: "1要素を小幅に変える" },
  { value: "medium", label: "中程度", description: "2〜3条件を比較する" },
  { value: "wide", label: "広い", description: "複数条件を組み合わせる" },
];

export const presentationOptions: SelectOption<PresentationOrder>[] = [
  { value: "block", label: "ブロック" }, { value: "alternate", label: "A/B交互" },
  { value: "series", label: "A/B/C系列" }, { value: "random", label: "ランダム" },
  { value: "preAnnounced", label: "事前指定" }, { value: "lastSecond", label: "直前指定" },
  { value: "during", label: "実行中指定" }, { value: "participantChoice", label: "本人選択" },
  { value: "natural", label: "相手や環境に応じて自然に変化" },
];

export const cueOptions: SelectOption<CueStyle>[] = [
  { value: "none", label: "声かけなし" }, { value: "outcome", label: "結果" },
  { value: "externalNear", label: "外的・近位" }, { value: "externalFar", label: "外的・遠位" },
  { value: "bodySensation", label: "身体感覚" }, { value: "analogy", label: "比喩" },
  { value: "question", label: "問い" }, { value: "comparison", label: "比較" },
  { value: "demonstration", label: "実演" },
];

export const feedbackOptions: SelectOption<FeedbackStyle>[] = [
  { value: "resultOnly", label: "結果だけ伝える" }, { value: "oneObservation", label: "観察事実を1つ伝える" },
  { value: "selfEvaluationFirst", label: "本人の自己評価を先に聞く" }, { value: "questionOnly", label: "質問だけ行う" },
  { value: "demonstration", label: "実演する" }, { value: "showGoodTrial", label: "良かった試行を示す" },
  { value: "summary", label: "数回分をまとめて伝える" }, { value: "outOfRangeOnly", label: "設定範囲を外れたときだけ伝える" },
  { value: "onRequest", label: "本人が求めたときに伝える" }, { value: "none", label: "フィードバックなしで再試行する" },
];

export const phaseSpecificConditions: Record<CompetitivePhase, string[]> = {
  start: ["合図の種類", "合図の予測可能性", "構え", "荷重位置", "初動", "入水地点", "入水角度", "入水深度", "第一キック", "3m・5m・10m・15m地点", "反応", "空中局面", "入水から水中動作への接続"],
  turn: ["泳法", "ターン形式", "進入速度", "壁との距離", "最後の呼吸", "最後のストローク", "回転", "壁接触", "接触時間", "足の位置", "押す方向", "プッシュオフ", "水中動作", "浮上", "ターン前後の速度の連続性"],
  underwater: ["腹・背・横", "深さ", "軌道", "キック頻度", "キック振幅", "キック回数", "水中距離", "身体の向き", "左右差", "プッシュオフ速度", "浮上位置", "疲労", "抵抗具", "フィン"],
  breakout: ["浮上地点", "最終キック", "第一ストローク", "第一呼吸", "水中から水上への速度の連続性", "浮上角度", "ストローク開始位置", "キック継続", "泳法別の接続", "フレッシュ時", "レースペース時", "疲労時"],
  swimming: ["クロール", "背泳ぎ", "平泳ぎ", "バタフライ", "速度", "テンポ", "ストローク数", "ストローク長", "腕の協調", "腕脚の協調", "呼吸側", "呼吸頻度", "身体の向き", "左右差", "加速・減速", "疲労", "用具", "隣の泳者", "ペース変化"],
  finish: ["壁情報", "最後の呼吸", "最後のストローク", "ストロークの伸縮", "速度を保ったタッチ", "片手・両手タッチ", "壁までの距離判断", "フィニッシュ前のテンポ", "相手との位置関係", "疲労時の判断"],
};

export const playFormats = [
  "物語", "ミッション", "宝探し", "色を選ぶ", "島から島へ移動する", "物を運ぶ", "物を集める",
  "障害物を通る", "目標物へ進む", "合図で方向を変える", "A/Bを比べる", "まねをする",
  "子どもがルールを選ぶ", "距離を選ぶ", "用具を選ぶ", "順番を選ぶ", "難易度を選ぶ",
  "ペアで協力する", "グループで共通目標を達成する", "別の方法を見つける",
];

export const equipmentLabels = Object.fromEntries(equipmentOptions.map(({ value, label }) => [value, label])) as Record<EquipmentId, string>;
export const equipmentFunctionLabels: Record<EquipmentId, string> = {
  none: "身体と水から得る情報だけで試す",
  wall: "支持面と到達地点を明確にする",
  kickboard: "上体の支持と浮力を増やす",
  noodle: "浮力と支持の位置を変える",
  mat: "支持面の広さや安定性を変える",
  hoop: "通る経路と目標ゾーンを示す",
  marker: "距離・方向・切替地点を見える化する",
  floatingObject: "水面上の目標や遊びの対象を作る",
  sinkingObject: "水中の深さや到達目標を示す",
  fins: "推進力と足先の水圧情報を増やす",
  paddles: "手にかかる水圧と抵抗を増やす",
  pullBuoy: "下肢の浮力を増やして条件を分ける",
  snorkel: "呼吸場所を固定して姿勢情報を残す",
  resistance: "進行方向と反対の抵抗を加える",
  tempo: "動作のリズムを外部音で示す",
};
export const goalLabels = Object.fromEntries(goals.map(({ value, label }) => [value, label])) as Record<GoalId, string>;
