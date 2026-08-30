import type {
  CardDirection,
  CompetitivePhase,
  ConstraintCategory,
  CueStyle,
  EquipmentId,
  FeedbackStyle,
  GoalId,
  PresentationOrder,
  TaskTemplate,
  TargetLevel,
  VariabilityLevel,
} from "../types";
import { equipmentFunctionLabels } from "./options";

type TaskSpec = {
  id: string;
  phase: CompetitivePhase;
  direction: CardDirection;
  title: string;
  summary: string;
  observedTag: string;
  goal: GoalId;
  level: TargetLevel;
  primaryConstraint: ConstraintCategory;
  primaryConstraintLabel: string;
  requiredEquipment: EquipmentId[];
  optionalEquipment: EquipmentId[];
  fixedConditions: string[];
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
};

type BaselineOverride = Pick<TaskSpec, "setup" | "instructions">;

const noEquipmentBaselines: Record<string, BaselineOverride> = {
  "comp-start-establish-01": {
    setup: "プール底の既存ラインを距離の目安にし、腰掛け姿勢から始める",
    instructions: ["合図で前方へ入り、最初の既存ラインまで進む", "2本目は腕の形を変えて同じ距離を目指す"],
  },
  "comp-start-explore-02": {
    setup: "プール底の既存ラインを見ながら、浅めと深めの入水を比べられる区間を作る",
    instructions: ["1本目は浅め、2本目は深めの入水を本人が選ぶ", "既存ラインまで最も前へ進んだ方法を残す"],
  },
  "comp-turn-establish-01": {
    setup: "壁までおよそ3ストロークになる開始位置を本人の通常の泳ぎから決める",
    instructions: ["決めた開始位置から3ストロークで壁へ入る", "接触後は壁を押して浮上する"],
  },
  "comp-underwater-establish-02": {
    setup: "壁から本人が8mと見積もる地点までを観察区間にし、フィンなしで行う",
    instructions: ["壁を押した姿勢を保ち、見積もった地点までキックする", "2本目は本人が腕の位置を選ぶ"],
  },
  "comp-underwater-explore-02": {
    setup: "浅い軌道と深い軌道を本人がイメージし、同じ水中区間で比べる",
    instructions: ["本人が浅い軌道か深い軌道を選び、10mを目安に進む", "2回目は違う軌道を試して差を言葉にする"],
  },
  "comp-breakout-establish-01": {
    setup: "本人が浮上する地点を一つ決め、そこから第一ストロークまでを観察する",
    instructions: ["決めた地点付近で浮上し、間を空けず第一ストロークを入れる", "4本とも同じ順序で行う"],
  },
  "comp-finish-establish-01": {
    setup: "壁前およそ2mを本人の通常の泳ぎから見積もり、そこからを観察区間にする",
    instructions: ["見積もった地点から速度を落とさず壁へ触れる", "触れるまで最後の呼吸を入れない"],
  },
};

const equipmentFunctionsFor = (equipment: EquipmentId[]) => {
  const ids = equipment.filter((item, index) => item !== "none" && equipment.indexOf(item) === index);
  return ids.length > 0 ? ids.map((item) => equipmentFunctionLabels[item]) : [equipmentFunctionLabels.none];
};

// 直接書き換えても文法が崩れない用語だけを、平易な表現にする。
const coachText = (text: string): string => text
  .replaceAll("ゲートの向こうへ滑る", "フープに触れず、入水後も進もう")
  .replaceAll("疲労を主制約として速度を保つ", "50m泳いだ後も、スタートから15mまで止まらず進む")
  .replaceAll("疲れていても最初の一手だけ明確に", "疲れていても、合図でしっかり動き出そう")
  .replaceAll("泳法が変わっても壁接触から押し出しをつなげる", "クロール・背泳ぎのどちらでも、壁に触れて同じ方向へ蹴り出す")
  .replaceAll("泳法とターン形式の切替を課題にする", "クロール・背泳ぎで、ターン後に同じ方向へ進む")
  .replaceAll("壁の前後を一つの移動にする", "壁に触れたら向きを変え、止まらず蹴り出そう")
  .replaceAll("泳法変更後も接触が乱れない", "泳ぎ方を変えても、止まらず壁に触れる")
  .replaceAll("押し出し後の減速を小さくする", "壁を蹴った後もスピードを落とさない")
  .replaceAll("個人メドレーの泳法切替に応用する", "個人メドレーで泳ぎ方を切り替える時にも使う")
  .replaceAll("疲労と距離判断を同時に残す", "疲れた後も、壁まであと何かきか判断する")
  .replaceAll("抵抗を増やさず最初の水中区間をつなぐ", "腕を伸ばした姿勢を崩さず8mまで進む")
  .replaceAll("身体のまとまりと速度感を制約にする", "腕を伸ばした姿勢で8mまで進む")
  .replaceAll("水を押さずに前へ通る", "腕を伸ばした姿勢を崩さず8m進もう")
  .replaceAll("8mまで速度感が続く", "8mまで大きく減速しない")
  .replaceAll("足先から作る波を選ぶ", "どのキックの大きさが進みやすい？")
  .replaceAll("2条件を比較する", "フィンあり・なしを試す")
  .replaceAll("選択理由を速度と感覚で述べる", "進みやすかった方と、その理由を言える")
  .replaceAll("浅い軌道と深い軌道で浮上までの速度を比べる", "浅い・深いコースで、浮上までの進み方を比べる")
  .replaceAll("水深と浮上位置を探索する", "浅い・深いコースと浮上位置を比べる")
  .replaceAll("浅深2軌道を経験する", "浅い・深いコースを試す")
  .replaceAll("波・乱流と隣泳者を主制約にする", "隣の選手が作る波の中で行う")
  .replaceAll("軌道調整の選択肢を一つ以上使う", "深さかキック数を1つ変えられる")
  .replaceAll("浮上地点と第一ストロークを固定する", "浮上する場所と1かき目を始める場所を決める")
  .replaceAll("水面に出たら次の一手", "浮上したら、すぐに1かき目を入れよう")
  .replaceAll("最終キックと腕の協調を整える", "最後のキック後、すぐに1かき目を入れる")
  .replaceAll("第一呼吸のストローク位置を選ぶ", "2かき目・4かき目のどちらで息継ぎするか選ぶ")
  .replaceAll("呼吸後の速度低下を本人が比較する", "息継ぎ後も進みやすい方を選べる")
  .replaceAll("浮上角度と水中マーカーを比較する", "2つの浮上角度を比べる")
  .replaceAll("2軌道で浮上できる", "2つの角度で浮上できる")
  .replaceAll("第一ストロークの停止差を説明できる", "浮上後に止まりにくい方を説明できる")
  .replaceAll("隣泳者と他者距離を制約にする", "隣の選手との距離を変える")
  .replaceAll("隣の位置に過剰反応しない", "隣の選手を見ても、浮上位置を変えすぎない")
  .replaceAll("音の間に水を後ろへ送る", "音に合わせて腕を回そう")
  .replaceAll("本人が速度感を報告できる", "本人が進む速さの違いを言える")
  .replaceAll("数ではなく壁までの前進を見る", "かき数を変えた時の速さを比べよう")
  .replaceAll("用具と腕脚の使用条件を比較する", "用具あり・なしで腕と脚の動きを比べる")
  .replaceAll("速度・強度とペース順序を制約にする", "25mごとに泳ぐ速さを変える")
  .replaceAll("速さが変わっても水をつなぐ", "速さが変わっても、腕と脚の動きを止めない")
  .replaceAll("隣泳者と波を環境制約にする", "隣の選手が作る波の中で泳ぐ")
  .replaceAll("環境変化後も50mを完了する", "波の強さが変わっても50m泳ぎ切る")
  .replaceAll("調整した要素と結果を説明できる", "変えたことと、泳ぎやすさを説明できる")
  .replaceAll("終了地点と停止可否を固定する", "壁まで止まらず泳ぐ")
  .replaceAll("壁を通り過ぎるつもりで触る", "壁の手前で流さず、そのままタッチしよう")
  .replaceAll("壁前でグライドしない", "壁の前で流さない")
  .replaceAll("壁情報と終了地点を手がかりにする", "壁から3mの目印を使い、両手でタッチする")
  .replaceAll("壁の面を両手で迎える", "両手を同時に壁へ伸ばそう")
  .replaceAll("2条件のタッチを経験する", "息継ぎあり・なしでタッチする")
  .replaceAll("壁に届く最短の道を探す", "どちらのタッチが止まりにくい？")
  .replaceAll("相手ではなく壁の面へ速度を運ぶ", "隣の選手を見ず、壁まで速さを落とさず泳ごう")
  .replaceAll("フィンありで小さな振幅、なしで自分の振幅を試す", "フィンありでは小さく、フィンなしでは本人が選んだ大きさでキックする")
  .replaceAll("最終キックから腕へ連続する", "最後のキック後、間を空けずに1かき目を入れられる")
  .replaceAll("レースペースのブレイクアウトへ接続する", "レースの速さでも、水中から浮上後すぐに泳ぎ始める")
  .replaceAll("第一ストロークへ連続する", "浮上後、間を空けず1かき目を入れる")
  .replaceAll("混戦時のブレイクアウト判断に転移する", "隣の選手が近いレースでも、自分の浮上位置を選ぶ")
  .replaceAll("レース用具を使わない泳動作の選択へ転移する", "用具を外した後も、腕と脚がつながる泳ぎ方を選ぶ")
  .replaceAll("実戦の隣接選手・波への適応に転移する", "隣の選手や波があるレースでも、息継ぎする側や腕のリズムを選ぶ")
  .replaceAll("レーンごとにA/B条件を分ける", "息継ぎあり・なしをレーンごとに分ける")
  .replaceAll("レース終盤の呼吸判断へ転移する", "レース終盤でも、最後に息継ぎする位置を選ぶ")
  .replaceAll("競技終盤のフィニッシュ判断に転移する", "レース終盤でも、最後の息継ぎとタッチ方法を選ぶ")
  .replaceAll("実際のレースの隣接情報を残した判断へつなげる", "実際のレースでも、隣の選手ではなく自分の合図で動く")
  .replaceAll("レース用フィンの感覚を通常の水中動作へ転移する", "フィンを外した後も、選んだキックの大きさで水中を進む")
  .replaceAll("混雑したレースの水中区間へ転移する", "隣の選手や波があるレースでも、水中の深さかキック数を選ぶ")
  .replaceAll("相手や距離が変わるターン後の浮上選択に接続する", "相手や壁までの距離が変わっても、浮上する場所を選ぶ")
  .replaceAll("スタート後の泳動作開始に転用する", "スタート後、浮上してすぐに泳ぎ始める")
  .replaceAll("壁からのけのびと一かきで接続する", "壁を蹴って浮上し、間を空けず1かき目を入れる")
  .replaceAll("実戦のスタート後15mに接続する", "実際のレースでも、スタート後15mまで止まらず泳ぐ")
  .replaceAll("レース中の速度変化への調整に接続する", "レース中に速さが変わっても、かき数を調整する")
  .replaceAll("レース中盤のペース変化へ接続する", "レース中盤で速さを変える時にも使う")
  .replaceAll("平泳ぎ・バタフライのタッチへ接続する", "平泳ぎ・バタフライで両手タッチする")
  .replaceAll("壁歩きから背面姿勢への接続で行う", "壁まで歩き、壁に触れてから背泳ぎ姿勢へ変える")
  .replaceAll("テンポを5%上げて同じ接続を試す", "テンポを5%上げても、最後のキック後すぐ1かき目を入れる")
  .replaceAll("25m後にどの情報を使ったか答える", "25m後に、音・水面・自分の感覚のどれを使ったか答える")
  .replaceAll("壁に触れた後、使った情報を答える", "壁に触れた後、使った目印を答える")
  .replaceAll("壁へ向かう情報を一つ選ぶ", "壁までの距離か最後の息継ぎから、使う目印を1つ選ぶ")
  .replaceAll("実戦のスタート後に周囲情報を取り込む呼吸へつなげる", "実際のレースでも、周りを見て息継ぎする場所を選ぶ")
  .replaceAll("相手や壁の情報に応じた呼吸選択へつなげる", "隣の選手や壁の位置に合わせて、息継ぎする側を選ぶ")
  .replaceAll("短くなった一手も壁への情報にする", "疲れて1かきが短くなっても、壁までの距離を見よう")
  .replaceAll("速さの中でも次の情報を見る", "速くても、浮上後の息継ぎ位置を見よう")
  .replaceAll("速度感と水面の情報から方法を選ぶ", "進む速さと水面の様子を見て、息継ぎする場所を選ぶ")
  .replaceAll("隣泳者との位置関係を情報にして速度を保つ", "隣の選手がいても、自分の速さを保つ")
  .replaceAll("隣泳者の位置を情報にして浮上と泳動作を調整する", "隣の選手がいても、自分の浮上位置と泳ぎ出すタイミングを選ぶ")
  .replaceAll("5mラインへ静かな入水", "スタートから5mまで止まらず進む")
  .replaceAll("合図から5mまでの初動と入水を一つの流れにする", "合図から5mまでの動きを止めずにつなげる")
  .replaceAll("5mの先へ体を運ぶ", "合図で動き、5mラインまで進もう")
  .replaceAll("距離と開始姿勢を絞る", "5mまで・腰掛け姿勢から始める")
  .replaceAll("入水角度のゲート通過", "フープに触れずに入水する")
  .replaceAll("低いゲートを通る結果から入水角度を調整する", "フープに触れないよう、入水の角度を調整する")
  .replaceAll("重心を変えるスタート比較", "構える位置を変えてスタートを比べる")
  .replaceAll("荷重位置の違いが初速にどう表れるか本人が探す", "構える位置を前・中央に変え、10mまでの進み方を比べる")
  .replaceAll("浅い入水と深い入水の10m対比", "浅い入水と深い入水を10mまで比べる")
  .replaceAll("入水深度を変えて浮上までのつながりを探索する", "浅め・深めの入水を試し、10mまで進みやすい方を選ぶ")
  .replaceAll("深度と浮上地点を比較する", "浅い・深い入水で、浮上する場所を比べる")
  .replaceAll("10mまでの減速感を比較できる", "10mまでスピードが落ちにくい方を選べる")
  .replaceAll("レースペースの入水軌道選択へ結びつける", "レースの速さでも、浅め・深めの入水を自分で選ぶ")
  .replaceAll("隣泳者ありの初動レース", "隣に選手がいる状態で15mスタート")
  .replaceAll("隣の動きと合図を情報にしてスタート後15mを泳ぐ", "隣に選手がいても、自分の合図でスタートして15m泳ぐ")
  .replaceAll("隣泳者と合図の不確実性を残す", "隣に選手がいる状態で、合図の間隔を変える")
  .replaceAll("15mまで入水の流れが続く", "入水後も止まらず15mまで進む")
  .replaceAll("疲労後のスタート再現", "50m泳いだ後にスタートする")
  .replaceAll("隣の選手情報を加える", "隣の選手の動きも加える")
  .replaceAll("疲労した状態で合図から15mを進む", "疲れた状態で合図から15mを進む")
  .replaceAll("レース終盤の再スタート練習ではなく、疲労下の局面接続に転用する", "疲れた状態でも、スタートから15mまでの動きをつなげる")
  .replaceAll("壁前3ストロークの道しるべ", "壁前3ストロークでターン")
  .replaceAll("回転後の壁押し方向", "ターン後、底のラインへ向かって壁を蹴る")
  .replaceAll("ターン後のコース復帰情報へつなぐ", "ターン後に底のラインへ戻る判断につなげる")
  .replaceAll("最後の呼吸を選ぶターン", "ターン前に息継ぎする・しないを比べる")
  .replaceAll("回転の半径を変えるターン", "小さく回る・大きく回るターン")
  .replaceAll("小さな回転と大きな回転の違いを本人が発見する", "小さく回る方法と大きく回る方法を比べる")
  .replaceAll("回転半径と浮上位置を比較する", "小さく回る・大きく回る方法と浮上位置を比べる")
  .replaceAll("回転を小さくした試行と、余裕を持つ試行を交互に行う", "小さく回る方法と、大きく回る方法を交互に行う")
  .replaceAll("異なる半径を試せる", "小さく回る方法と大きく回る方法を試せる")
  .replaceAll("次の水面を先に選ぶ", "どちらの回り方が、目標の位置で浮上しやすい？")
  .replaceAll("異なる泳法からのターン接続", "クロール・背泳ぎから同じ方向へ壁を蹴る")
  .replaceAll("疲労下の壁接触タイミング", "75m泳いだ後にターンする")
  .replaceAll("5キックのライン滑走", "壁を蹴り、同じ深さで5回キックする")
  .replaceAll("プッシュオフ速度を残す姿勢", "壁を蹴った姿勢で8m進む")
  .replaceAll("フィンの有無と振幅を比べ、前へ進む感覚を探す", "フィンあり・なしでキックの大きさを変え、進み方を比べる")
  .replaceAll("フィン条件と振幅を比較する", "フィンあり・なしとキックの大きさを変える")
  .replaceAll("フィンなしで速度と振幅を同時に変える", "フィンなしで速さとキックの大きさを同時に変える")
  .replaceAll("深さを変える水中軌道", "浅い・深い水中コースを比べる")
  .replaceAll("隣泳者の波がある条件で水中軌道を適応させる", "隣の選手が作る波の中で、深さかキック数を選ぶ")
  .replaceAll("第一ストロークを置く地点", "浮上後すぐに1かき目を入れる")
  .replaceAll("浮上地点から第一ストロークまでの停止をなくす", "浮上したら止まらず、すぐに1かき目を入れる")
  .replaceAll("最終キックから腕脚協調へ", "最後のキックから1かき目へ")
  .replaceAll("水中最終キックを第一ストロークのリズムに合わせる", "水中の最後のキックから、間を空けず1かき目を入れる")
  .replaceAll("最後のキックが次の腕を呼ぶ", "最後のキックの後、すぐに腕を動かそう")
  .replaceAll("水面へ抜ける道を選ぶ", "どちらの角度が、止まらず泳ぎ出しやすい？")
  .replaceAll("第一呼吸の場所を探す", "浮上後、2かき目・4かき目の息継ぎを比べる")
  .replaceAll("浮上後の呼吸位置を変え、速度を保ちやすい場所を探索する", "浮上後の2かき目・4かき目で息継ぎし、進みやすい方を選ぶ")
  .replaceAll("浮上角度とキック継続の比較", "2つの角度で浮上し、止まりにくい方を選ぶ")
  .replaceAll("レースペースのブレイクアウト", "レースの速さで水中から泳ぎ出す")
  .replaceAll("レースペース後に泳動作へ移る", "レースの速さでも、浮上後すぐに泳ぎ始める")
  .replaceAll("疲労セット", "疲れるセット")
  .replaceAll("隣泳者の水面へ抜ける", "隣に選手がいる状態で浮上する")
  .replaceAll("自分のレーンの水面を読む", "自分の浮上位置とタイミングに集中しよう")
  .replaceAll("速度を保ちながらストローク数の許容幅を経験する", "ストローク数を1回ずつ変え、速さの違いを比べる")
  .replaceAll("ストローク数と速度の関係を個別化する", "本人に合うストローク数を探す")
  .replaceAll("疲労後も許容幅を維持する", "疲れた後もストローク数を1回ずつ変えて比べる")
  .replaceAll("用具が変える腕脚の協調", "用具あり・なしで腕と脚の動きを比べる")
  .replaceAll("パドルとプルブイの条件で協調の違いを発見する", "パドル・プルブイ・用具なしで腕と脚の動きを比べる")
  .replaceAll("ペース変化を含む100m", "泳ぐ速さを25mごとに変える100m")
  .replaceAll("速度の切替後も泳法の協調を保つ", "泳ぐ速さを変えても腕と脚の動きをつなげる")
  .replaceAll("最後の呼吸をしない距離の探索", "最後に息継ぎする位置を比べる")
  .replaceAll("最後の情報を壁に残す", "最後は壁を見て、そのままタッチしよう")
  .replaceAll("疲労した最後の5m", "疲れた後の最後の5m")
  .replaceAll("最後の5mにも前進の情報がある", "疲れていても、壁まで泳ぎ切ろう")
  .replaceAll("両手タッチの壁情報", "壁に詰まらず両手でタッチする")
  .replaceAll("波と隣泳者の25m選択", "波の強さに合わせて呼吸側を選ぶ50m")
  .replaceAll("相手位置を使うフィニッシュ", "隣の選手がいても壁まで泳ぎ切る")
  .replaceAll("相互観察する", "互いに確認する")
  .replaceAll("フィンありだけで安定化する", "フィンありだけを繰り返す")
  .replaceAll("本数を固定して安定化する", "ストローク数を決めて繰り返す")
  .replaceAll("スタート・ターン後の水中姿勢へ統合する", "スタート・ターン後の水中姿勢につなげる")
  .replaceAll("壁情報", "壁の見え方・距離")
  .replaceAll("相手情報", "隣の選手の位置")
  .replaceAll("周囲情報", "周りの様子")
  .replaceAll("隣接情報", "隣の選手の動き")
  .replaceAll("第一ストローク", "浮上後の1かき目")
  .replaceAll("第一呼吸", "浮上後の最初の息継ぎ")
  .replaceAll("最終キック", "浮上前の最後のキック")
  .replaceAll("キック振幅", "キックの大きさ")
  .replaceAll("振幅", "キックの大きさ")
  .replaceAll("腕脚の協調", "腕と脚のリズム")
  .replaceAll("腕脚協調", "腕と脚のリズム")
  .replaceAll("腕の協調", "左右の腕のつながり")
  .replaceAll("泳動作", "泳ぎ")
  .replaceAll("水中動作", "水中の動き")
  .replaceAll("入水深度", "入水の深さ")
  .replaceAll("荷重位置", "構えた時の重心")
  .replaceAll("初速", "最初の速さ")
  .replaceAll("進入速度", "壁へ近づく速さ")
  .replaceAll("深度", "深さ")
  .replaceAll("観察区間", "確認する区間")
  .replaceAll("観察する", "見る")
  .replaceAll("隣泳者", "隣の選手")
  .replaceAll("初動", "動き出し")
  .replaceAll("プッシュオフ後", "壁を蹴った後")
  .replaceAll("プッシュオフ", "壁を蹴る動き")
  .replaceAll("制約", "条件")
  .replaceAll("探索する", "比べて試す")
  .replaceAll("探索", "比較")
  .replaceAll("フレッシュ時", "疲れていない時")
  .replaceAll("疲労状態", "疲れている状態")
  .replaceAll("疲労下", "疲れている時")
  .replaceAll("疲労時", "疲れている時")
  .replaceAll("疲労後", "疲れた後")
  .replaceAll("疲労度", "疲れ具合")
  .replaceAll("疲労", "疲れ")
  .replaceAll("試行間", "1回ごとに")
  .replaceAll("試行", "1回")
  .replaceAll("A/B", "2つの方法")
  .replaceAll("適応させる", "合わせる")
  .replaceAll("適応する", "対応する")
  .replaceAll("適応", "対応")
  .replaceAll("成立", "できる")
  .replaceAll("実場面", "実際の場面")
  .replaceAll("レースペース", "レースの速さ");

const suggestedDoseByPhase: Record<CompetitivePhase, string> = {
  start: "5〜15mを4回。1回ごとに30秒休む。",
  turn: "壁の前後5〜10mを4回。1回ごとに30秒休む。",
  underwater: "水中5〜15mを4回。1回ごとに30秒休む。",
  breakout: "浮上から25mまでを4回。1回ごとに30秒休む。",
  swimming: "25mを4本。1本ごとに30秒休む。",
  finish: "壁前5〜10mを4回。1回ごとに30秒休む。",
};

const makeTask = (s: TaskSpec): TaskTemplate => {
  const baseline = noEquipmentBaselines[s.id];
  const requiredEquipment = baseline ? [] : s.requiredEquipment.filter((equipment) => equipment !== "none");
  const optionalEquipment = baseline ? [] : s.optionalEquipment.filter((equipment) => equipment !== "none");

  return {
    id: s.id, mode: "competitive", direction: s.direction, title: coachText(s.title),
    summary: coachText(s.summary), phases: [s.phase], domains: [s.phase], goals: [s.goal],
    observedTags: [s.observedTag], levels: [s.level], primaryConstraint: s.primaryConstraint,
    primaryConstraintLabel: coachText(s.primaryConstraintLabel), fixedConditions: s.fixedConditions.map(coachText),
    requiredEquipment, optionalEquipment,
    equipmentFunctions: equipmentFunctionsFor([...requiredEquipment, ...optionalEquipment]),
    environmentTags: s.environmentTags, setup: coachText(baseline?.setup ?? s.setup),
    instructions: (baseline?.instructions ?? s.instructions).map(coachText),
    participantCue: coachText(s.participantCue), informationToUse: s.informationToUse.map(coachText),
    permittedSolutions: s.permittedSolutions.map(coachText), participantChoices: s.participantChoices.map(coachText),
    successCriteria: s.successCriteria.map(coachText), coachObservation: coachText(s.coachObservation),
    suggestedDose: suggestedDoseByPhase[s.phase], variabilityLevel: s.variabilityLevel,
    presentationOrder: s.presentationOrder, cueStyle: s.cueStyle, feedbackStyle: s.feedbackStyle,
    easier: coachText(s.easier), harder: coachText(s.harder), noEquipment: coachText(s.noEquipment),
    largeGroup: coachText(s.largeGroup), transferConnection: coachText(s.transferConnection),
    evidenceIds: s.evidenceIds, evidenceNote: "監修前の案です。参考資料は練習の考え方を支えるもので、この練習の効果を保証するものではありません。",
    reviewStatus: "draft",
  };
};

const common = (id: string, phase: CompetitivePhase, direction: CardDirection, title: string, summary: string, observedTag: string, goal: GoalId, level: TargetLevel, primaryConstraint: ConstraintCategory, primaryConstraintLabel: string, setup: string, instructions: string[], participantCue: string, successCriteria: string[], coachObservation: string, easier: string, harder: string, noEquipment: string, largeGroup: string, transferConnection: string, requiredEquipment: EquipmentId[] = ["none"], optionalEquipment: EquipmentId[] = ["marker"], variabilityLevel: VariabilityLevel = "narrow", presentationOrder: PresentationOrder = "block", cueStyle: CueStyle = "outcome", feedbackStyle: FeedbackStyle = "oneObservation"): TaskSpec => ({
  id, phase, direction, title, summary, observedTag, goal, level, primaryConstraint, primaryConstraintLabel,
  requiredEquipment, optionalEquipment, fixedConditions: ["上手な形を教え込まず、ねらった動きができたかを見る"],
  environmentTags: ["プール長", "水上・水中マーカー", "個人・ペア・集団"], setup, instructions,
  participantCue, informationToUse: ["壁・マーカーとの距離", "自分が選んだ方法と結果"],
  permittedSolutions: ["テンポや深さを自分で調整する", "複数の動作方法を試す"],
  participantChoices: ["試す順番", "動作の強さ"], successCriteria, coachObservation, suggestedDose: "局面ごとの距離を4回",
  variabilityLevel, presentationOrder, cueStyle, feedbackStyle, easier, harder, noEquipment, largeGroup, transferConnection,
  evidenceIds: ["seifert-2014", "sheaff-book"],
});

const specs: TaskSpec[] = [
  common("comp-start-establish-01", "start", "establish", "5mラインへ静かな入水", "合図から5mまでの初動と入水を一つの流れにする", "合図後の初動が遅い", "firstSuccess", "intro", "task", "距離と開始姿勢を絞る", "5mと10mにマーカーを置き、腰掛け姿勢から始める", ["合図で前方へ飛び、5mラインまで進む", "2本目は腕の形を変えて同じ距離を目指す"], "5mの先へ体を運ぶ", ["合図から動き出せる", "5mラインまで止まらず到達する"], "合図から足が離れるまでの時間と入水地点を見る", "台を使わず壁際のしゃがみ姿勢にする", "10mまで距離を伸ばし合図の間隔を変える", "壁を蹴って5mを滑る課題へ置き換える", "2列で交互に行い待ち時間を短くする", "レース前のスタート合図から最初の5mへつなげる", ["wall"]),
  common("comp-start-establish-02", "start", "establish", "入水角度のゲート通過", "低いゲートを通る結果から入水角度を調整する", "入水時に形が崩れる", "accuracy", "develop", "environment", "入水ゲートの高さを制約にする", "水中5mにフープを縦置きし、スタート台から入る", ["フープに触れない軌道で入水する", "毎回同じ合図で3本試す"], "ゲートの向こうへ滑る", ["ゲートを通過する", "入水後に速度を保つ"], "入水地点とゲート接触の有無を記録する", "フープを外し水面の線だけを目標にする", "フープを遠ざけて入水深度の選択を増やす", "水面マーカーを目標にする", "フープを2つ並べてレーンを分担する", "競技会の入水後5mの軌道を想定する", ["hoop"]),
  common("comp-start-explore-01", "start", "explore", "重心を変えるスタート比較", "荷重位置の違いが初速にどう表れるか本人が探す", "入水が深すぎる", "explore", "develop", "individual", "荷重位置を本人の選択にする", "台上に前寄り・中央寄りの2色マーカーを置く", ["色を1つ選んで構える", "合図後10mまで進み、2色の感覚を比べる"], "どの足裏から押すと前へ出る？", ["2種類の構えを試せる", "本人が違いを一言で説明できる"], "選択した色、入水深度、10mの速度感を聞く", "選択肢を1色だけにする", "構えを直前に指定し隣の選手情報を加える", "プールサイドで重心移動だけを試す", "各レーンに別の色を割り当てる", "レースの構えを自分で選ぶ判断へつなげる", ["marker"], ["wall"], "medium", "alternate", "question", "selfEvaluationFirst"),
  common("comp-start-explore-02", "start", "explore", "浅い入水と深い入水の10m対比", "入水深度を変えて浮上までのつながりを探索する", "入水が浅すぎる", "discover", "race", "task", "深度と浮上地点を比較する", "5m・10mの水中ラインを見える状態にする", ["1本目は浅め、2本目は深めの入水を本人が選ぶ", "10mで最も前へ進んだ方法を残す"], "水中のどこを通ると10mが近い？", ["2つの深度を試す", "10mまでの減速感を比較できる"], "入水深度と10m到達時の速度を観察する", "深度の差を小さくする", "深度に加えキック回数も変える", "壁からのけのびで深度比較を行う", "A/Bをレーンごとに分ける", "レースペースの入水軌道選択へ結びつける", ["marker"], ["fins"], "medium", "alternate", "bodySensation", "questionOnly"),
  common("comp-start-transfer-01", "start", "transfer", "隣泳者ありの初動レース", "隣の動きと合図を情報にしてスタート後15mを泳ぐ", "隣に選手がいるとリズムが変わる", "transfer", "race", "environment", "隣泳者と合図の不確実性を残す", "2レーンを使い、合図の間隔を一定にして並んで構える", ["隣泳者と同時にスタートする", "15mラインで速度を保った側の方法を振り返る"], "隣ではなく15mラインへ向かう", ["隣の動きがあっても自分の合図で動く", "15mまで入水の流れが続く"], "合図から初動、隣との距離、15m通過を見る", "片側だけで単独スタートする", "合図を直前提示し15m後に加速を求める", "壁蹴りから隣泳者との並走へ置き換える", "4人1組で2ペアを連続スタートする", "実際のレースの隣接情報を残した判断へつなげる"),
  common("comp-start-transfer-02", "start", "transfer", "疲労後のスタート再現", "泳いだ直後にもスタートの結果を保つ", "フレッシュ時はできるが疲労時に崩れる", "maintainSpeed", "race", "individual", "疲労を主制約として速度を保つ", "50m泳の直後に15秒だけ整えてスタート位置へ戻る", ["疲労した状態で合図から15mを進む", "フレッシュ時の記録ではなく15mの流れを比べる"], "疲れていても最初の一手だけ明確に", ["疲労後も入水から水中動作が続く", "15mで急な停止がない"], "準備時間、初動、15mまでの減速を観察する", "泳ぐ距離を25mに短くする", "50mを2本続けて同じ結果を求める", "陸上で構えから一歩の反応を確認する", "サーキットの各組で疲労後に実施する", "レース終盤の再スタート練習ではなく、疲労下の局面接続に転用する", ["none"], ["tempo"], "narrow", "preAnnounced", "outcome", "outOfRangeOnly"),

  common("comp-turn-establish-01", "turn", "establish", "壁前3ストロークの道しるべ", "壁との距離をそろえ、最後の3ストロークを安定させる", "壁前で小さな調整が増える", "stabilize", "intro", "task", "最後のストローク数を固定する", "壁の5mと2mにマーカーを置く", ["5mマーカーから呼吸を止め、3ストロークで壁へ入る", "接触後は壁を押して浮上する"], "壁を見ずに3つ数える", ["調整ストロークが増えない", "毎回同じ足位置で壁に触れる"], "5mからのストローク数と足の位置を見る", "5mを3mに縮める", "進入速度をレースペースに上げる", "壁際の歩行で3歩の距離感を確認する", "2レーンで同時に壁前だけを回す", "レース終盤の壁前判断の基準づくりにする", ["marker"]),
  common("comp-turn-establish-02", "turn", "establish", "回転後の壁押し方向", "壁を押した先のラインを手がかりに方向をそろえる", "壁を押す方向が毎回変わる", "accuracy", "develop", "environment", "底のラインと壁の向きを手がかりにする", "壁から3mの底ラインを確認し、同じ向きで立つ", ["回転して壁に触れ、底ライン上へ押し出す", "3本ごとに足位置を少し変えて結果を比べる"], "ラインの上を通る", ["押し出し後にラインから大きく外れない", "3本の方向差を本人が説明できる"], "壁接触時の足位置と押し出し軌道を観察する", "回転なしの壁蹴りにする", "泳法を変えて同じ方向制約を適用する", "立位からの壁押しで方向だけ試す", "壁ごとに観察者を置き連続実施する", "ターン後のコース復帰情報へつなぐ", ["wall"]),
  common("comp-turn-explore-01", "turn", "explore", "最後の呼吸を選ぶターン", "最後の呼吸の有無と進入速度の組み合わせを探す", "最後の呼吸", "explore", "develop", "individual", "呼吸側とタイミングの選択を開く", "5mマーカーから壁までをA/B区間として設定する", ["Aは最後に呼吸し、Bは呼吸せずにターンする", "各方法を2回試して本人が続けたい方を選ぶ"], "壁へ向かう情報を一つ選ぶ", ["2つの呼吸条件を経験する", "選んだ方法で壁接触が途切れない"], "最後の呼吸位置、進入速度、接触時間を比べる", "呼吸条件を本人に一つだけ選ばせる", "呼吸側と進入速度を同時に変える", "陸上で最後の一息のタイミングを再現する", "A/Bを隣レーンで分担する", "レース中の壁情報に応じた呼吸判断へつなげる", ["none"], ["marker"], "medium", "alternate", "question", "selfEvaluationFirst"),
  common("comp-turn-explore-02", "turn", "explore", "回転の半径を変えるターン", "小さな回転と大きな回転の違いを本人が発見する", "ターン後に深くなりすぎる", "discover", "race", "task", "回転半径と浮上位置を比較する", "壁から5mの区間に浮上目標を2本用意する", ["回転を小さくした試行と、余裕を持つ試行を交互に行う", "浮上目標に近い方法の感覚を言葉にする"], "次の水面を先に選ぶ", ["異なる半径を試せる", "浮上位置と深さの関係を説明できる"], "回転後の深さ、軌道、浮上目標までの距離を見る", "浮上目標を一つにする", "疲労後に同じ比較を行う", "マット上の寝返りで半径の違いを体験する", "2人1組で浮上目標を交代して示す", "相手や距離が変わるターン後の浮上選択に接続する", ["marker"], ["fins"], "medium", "alternate", "bodySensation", "questionOnly"),
  common("comp-turn-transfer-01", "turn", "transfer", "異なる泳法からのターン接続", "泳法が変わっても壁接触から押し出しをつなげる", "ターン前後の速度の連続性", "connect", "race", "task", "泳法とターン形式の切替を課題にする", "25mをクロール・背泳ぎで交互に行うコースを作る", ["指定された泳法で壁へ入り、同じ方向へ押し出す", "次の25mで泳法を切り替える"], "壁の前後を一つの移動にする", ["泳法変更後も接触が乱れない", "押し出し後の減速を小さくする"], "泳法ごとの進入速度とターン後3mを観察する", "泳法を一つに固定する", "3泳法を直前指定で切り替える", "壁歩きから背面姿勢への接続で行う", "4人グループで泳法を順番に担当する", "個人メドレーの泳法切替に応用する"),
  common("comp-turn-transfer-02", "turn", "transfer", "疲労下の壁接触タイミング", "セット終盤の疲労でも壁までの判断を保つ", "疲れるとストロークが短くなる", "transfer", "race", "individual", "疲労と距離判断を同時に残す", "75mを泳いだ直後に壁前5mのターンだけを行う", ["最後の5mを自分のストローク数で入り、ターンする", "フレッシュ時の数値と違っても壁接触の流れを評価する"], "短くなった一手も壁への情報にする", ["壁前で止まらない", "疲労後も押し出し方向を選べる"], "ストローク長、壁までの調整、押し出し方向を見る", "25m後に実施して疲労を下げる", "100m後に同じ壁前課題を行う", "陸上の歩数で疲労後の距離判断を確認する", "各レーンで泳距離をずらして順番待ちを減らす", "レース終盤のターン判断へつなげる", ["none"], ["tempo"], "narrow", "preAnnounced", "comparison", "summary"),

  common("comp-underwater-establish-01", "underwater", "establish", "5キックのライン滑走", "プッシュオフ後の5キックを一定の深さで行う", "水中キックが途中で変わる", "stabilize", "intro", "task", "キック回数と水中距離を固定する", "壁から5mと10mに水中ラインを置く", ["壁を押し、5キック後にライン上で浮上する", "4本とも同じ回数を数える"], "5回のリズムを水中で保つ", ["5キックを完了する", "浮上位置の差を小さくする"], "キック回数、振幅、浮上位置を見る", "3キック・5mに短縮する", "7キック・10mで同じ深さを保つ", "壁からのけのびだけでラインを通る", "水中と水上の観察者を分担する", "レースの水中区間を再現する基準にする", ["wall"]),
  common("comp-underwater-establish-02", "underwater", "establish", "プッシュオフ速度を残す姿勢", "抵抗を増やさず最初の水中区間をつなぐ", "プッシュオフ後に減速する", "maintainSpeed", "develop", "individual", "身体のまとまりと速度感を制約にする", "壁から8mの水中目標を設置し、フィンなしで行う", ["壁を押した姿勢を保ち、目標までキックする", "2本目は本人が腕の位置を選ぶ"], "水を押さずに前へ通る", ["押し出し直後の形が崩れない", "8mまで速度感が続く"], "入水直後の姿勢と8mまでの減速を観察する", "距離を5mに短縮する", "抵抗具を一時的に使い速度差を比べる", "立位からのけのびで姿勢を確認する", "ペアで壁を交互に使う", "スタート・ターン後の水中姿勢へ統合する", ["wall"], ["marker"]),
  common("comp-underwater-explore-01", "underwater", "explore", "フィンでキック振幅を探索", "フィンの有無と振幅を比べ、前へ進む感覚を探す", "水中キックが途中で変わる", "explore", "develop", "task", "フィン条件と振幅を比較する", "10m区間をフィンあり・なしで交互に設定する", ["フィンありで小さな振幅、なしで自分の振幅を試す", "10m通過後に一番楽な方法を選ぶ"], "足先から作る波を選ぶ", ["2条件を比較する", "選択理由を速度と感覚で述べる"], "フィン条件、キック振幅、10m通過を記録する", "フィンありだけで安定化する", "フィンなしで速度と振幅を同時に変える", "水中立位で足首の動きだけ試す", "用具レーンと裸足レーンを交代する", "レース用フィンの感覚を通常の水中動作へ転移する", ["fins"], ["none"], "medium", "alternate", "bodySensation", "selfEvaluationFirst"),
  common("comp-underwater-explore-02", "underwater", "explore", "深さを変える水中軌道", "浅い軌道と深い軌道で浮上までの速度を比べる", "浮上が早すぎる", "discover", "race", "environment", "水深と浮上位置を探索する", "5mごとに浅・深の目標ラインを用意する", ["本人が目標ラインを選び、10mまで進む", "2回目は違うラインを試して差を言語化する"], "次の水面へ出る場所を選ぶ", ["浅深2軌道を経験する", "浮上地点と速度の違いを説明する"], "深さ、軌道、浮上地点の関係を見る", "浅いラインだけで行う", "疲労状態で軌道選択を行う", "水上の線を歩いて経路選択を確認する", "目標ラインを各レーンで変える", "レースの水深や波に応じた浮上判断へつなげる", ["marker"], ["fins"], "wide", "participantChoice", "question", "questionOnly"),
  common("comp-underwater-transfer-01", "underwater", "transfer", "ターン後の浮上地点を選ぶ", "ターン後に水中距離を選びながら速度をつなぐ", "浮上が遅すぎる", "transfer", "race", "environment", "浮上地点と次の泳動作を結びつける", "壁から7m・10mに浮上目標を置く", ["ターン後に目標を一つ選び、その地点で泳ぎ始める", "25mの残りを一定のテンポで進む"], "次の一かきが楽になる場所へ出る", ["選んだ地点で第一ストロークへ移れる", "水中区間で急な停止がない"], "浮上地点、第一ストローク、テンポの連続性を見る", "目標を7mだけにする", "目標を直前指定し泳法も変える", "壁からのけのびと一かきで接続する", "目標地点を係で示し順番を短縮する", "実戦の壁後の泳動作へつなぐ", ["marker"]),
  common("comp-underwater-transfer-02", "underwater", "transfer", "波のあるレーンの水中区間", "隣泳者の波がある条件で水中軌道を適応させる", "条件が変わると崩れる", "adapt", "race", "environment", "波・乱流と隣泳者を主制約にする", "隣レーンを時間差で泳がせ、10m区間を設定する", ["波を感じたまま水中の深さかキック数を選ぶ", "浮上後に選んだ理由を短く伝える"], "揺れの中でもラインを探す", ["波があっても10mまで進む", "軌道調整の選択肢を一つ以上使う"], "波のタイミング、左右差、浮上位置を観察する", "隣泳者を止めて穏やかな水面にする", "隣泳者を増やし深さ選択を直前指定する", "水上歩行の揺れに合わせた姿勢調整で導入する", "2組が交互に波を作る", "混雑したレースの水中区間へ転移する", ["none"], ["fins"], "medium", "natural", "externalFar", "summary"),

  common("comp-breakout-establish-01", "breakout", "establish", "第一ストロークを置く地点", "浮上地点から第一ストロークまでの停止をなくす", "第一ストロークへつながらない", "connect", "intro", "task", "浮上地点と第一ストロークを固定する", "7mラインを浮上目標にする", ["ライン付近で浮上し、間を空けずに第一ストロークを入れる", "4本とも同じ順序で行う"], "水面に出たら次の一手", ["浮上後に停止しない", "第一ストロークが目標方向を向く"], "浮上の高さ、第一ストロークの開始位置、停止を観察する", "5mラインまでに短縮する", "レースペースで浮上地点を選ぶ", "壁けのびから水面の一かきへ移す", "1人がライン、1人が停止を観察する", "スタート後の泳動作開始に転用する", ["marker"]),
  common("comp-breakout-establish-02", "breakout", "establish", "最終キックから腕脚協調へ", "水中最終キックを第一ストロークのリズムに合わせる", "最終キック", "stabilize", "develop", "individual", "最終キックと腕の協調を整える", "8m地点に浮上目標を置き、テンポ音を一定にする", ["最終キックの後に第一ストロークを開始する", "テンポ音を聞きながら25mを泳ぐ"], "最後のキックが次の腕を呼ぶ", ["最終キックから腕へ連続する", "25mのテンポが急に変わらない"], "最終キック、腕開始、25mテンポの順序を見る", "テンポ音なしで行う", "テンポを5%上げて同じ接続を試す", "水中足拍子から腕の動きへつなぐ", "音をレーンごとに鳴らす", "レースペースのブレイクアウトへ接続する", ["tempo"], ["marker"], "narrow", "block", "externalNear", "oneObservation"),
  common("comp-breakout-explore-01", "breakout", "explore", "第一呼吸の場所を探す", "浮上後の呼吸位置を変え、速度を保ちやすい場所を探索する", "第一呼吸で速度が落ちる", "explore", "develop", "task", "第一呼吸のストローク位置を選ぶ", "浮上から5ストロークを観察区間にする", ["2ストローク目と4ストローク目で第一呼吸を試す", "速度感と水面の情報から方法を選ぶ"], "呼吸しても前へ進む場所はどこ？", ["2つの呼吸位置を試す", "呼吸後の速度低下を本人が比較する"], "呼吸位置、頭の動き、5ストロークの進みを観察する", "呼吸位置を一つに指定する", "泳法と呼吸側を交互に変える", "立位で呼吸と腕の順序を分けて練習する", "A/Bの呼吸位置をレーン別にする", "実戦のスタート後に周囲情報を取り込む呼吸へつなげる", ["none"], ["tempo"], "medium", "alternate", "question", "selfEvaluationFirst"),
  common("comp-breakout-explore-02", "breakout", "explore", "浮上角度とキック継続の比較", "浮上角度を二つ試し、第一ストロークのつながりを見つける", "浮上時に一度止まる", "discover", "race", "environment", "浮上角度と水中マーカーを比較する", "5mと8mに浮上ゲートを置く", ["浅い角度と立ち上がる角度を一度ずつ試す", "停止の少ない角度を次の25mで使う"], "水面へ抜ける道を選ぶ", ["2軌道で浮上できる", "第一ストロークの停止差を説明できる"], "浮上角度、キック継続、第一ストロークの間隔を見る", "ゲートを一つにする", "疲労後に角度を直前指定する", "水上の斜めラインを歩いて軌道を確認する", "ゲートを係が持ち順番を早める", "レースの水深・波に適応する浮上へつなぐ", ["hoop"], ["marker"], "medium", "alternate", "demonstration", "showGoodTrial"),
  common("comp-breakout-transfer-01", "breakout", "transfer", "レースペースのブレイクアウト", "速度を上げた水中区間から第一呼吸までつなげる", "レースペース時", "maintainSpeed", "race", "task", "レースペースと第一呼吸を組み合わせる", "15m区間を合図でレースペースにし、25mまで泳ぐ", ["15mまでの水中動作後、選んだ地点で第一呼吸をする", "次の25mは同じテンポを保つ"], "速さの中でも次の情報を見る", ["レースペース後に泳動作へ移る", "第一呼吸で大きく減速しない"], "15m速度、浮上、第一呼吸後のテンポを見る", "速度を中程度に落とす", "疲労セットの直後に同じ区間を実施する", "歩行から呼吸を伴う一かきへ段階づける", "合図係と観察係を分ける", "実戦のスタート後15mに接続する", ["none"], ["tempo"], "narrow", "preAnnounced", "outcome", "outOfRangeOnly"),
  common("comp-breakout-transfer-02", "breakout", "transfer", "隣泳者の水面へ抜ける", "隣泳者の位置を情報にして浮上と泳動作を調整する", "隣に選手がいるとリズムが変わる", "adapt", "race", "environment", "隣泳者と他者距離を制約にする", "2レーンで片方が5m先行して泳ぐ", ["隣泳者の位置を見ずに音と水面感覚で浮上する", "25m後にどの情報を使ったか答える"], "自分のレーンの水面を読む", ["隣の位置に過剰反応しない", "第一ストロークへ連続する"], "隣泳者の位置、浮上地点、テンポ変化を見る", "単独レーンで行う", "隣泳者を近づけ、浮上地点を直前指定する", "水上の人の動きに合わせた歩行から始める", "4人で先行順を交代する", "混戦時のブレイクアウト判断に転移する", ["none"], ["marker"], "medium", "natural", "externalFar", "summary"),

  common("comp-swimming-establish-01", "swimming", "establish", "テンポ音に合わせた25m", "一定テンポの中でストロークを安定させる", "テンポを変えると崩れる", "stabilize", "intro", "task", "テンポと距離を固定する", "25mにテンポ音を流し、壁まで同じ条件にする", ["音に合わせて25m泳ぐ", "4本目だけ本人が音を少し変えて違いを確認する"], "音の間に水を後ろへ送る", ["25mでテンポが大きく乱れない", "本人が速度感を報告できる"], "ストローク数、音とのずれ、25m通過を見る", "音を使わず短い距離にする", "テンポを段階的に上げる", "手拍子に置き換える", "レーンごとに音源を分担する", "レーステンポ維持の手がかりを作る", ["tempo"]),
  common("comp-swimming-establish-02", "swimming", "establish", "ストローク数の幅を保つ25m", "速度を保ちながらストローク数の許容幅を経験する", "速度を上げるとストロークが短くなる", "maintainSpeed", "develop", "individual", "ストローク数と速度の関係を個別化する", "25mの両端にストローク数を書かないマーカーだけ置く", ["1本目は自然な数、2本目は1回少なく、3本目は1回多く試す", "それぞれの速度感を比べる"], "数ではなく壁までの前進を見る", ["複数の数で25mを完了する", "速度とストローク数の関係を言える"], "ストローク数、通過時間、身体の向きを見る", "本数を固定して安定化する", "疲労後も許容幅を維持する", "腕を使わないけのびで前進感覚を確認する", "同じ数の役割を分担して観察する", "レース中の速度変化への調整に接続する", ["none"], ["marker"], "medium", "series", "comparison", "summary"),
  common("comp-swimming-explore-01", "swimming", "explore", "呼吸側を変えるクロール", "左右の呼吸側を変えたときの速度と姿勢を探索する", "呼吸側を変えると崩れる", "explore", "develop", "individual", "呼吸側の選択を開く", "25mを片側呼吸、反対側呼吸、3ストロークごとで分ける", ["3種類を順番に試し、最も安定する方法を本人が選ぶ", "選択した方法で追加の25mを泳ぐ"], "呼吸のたびに進行方向を失わない", ["3つの呼吸条件を経験する", "選んだ側で25mの姿勢が続く"], "呼吸側、身体の向き、速度変化を見る", "得意側だけで行う", "疲労状態で呼吸側を直前指定する", "水中歩行で左右の息継ぎだけ確認する", "3レーンに条件を割り当てる", "相手や壁の情報に応じた呼吸選択へつなげる", ["none"], ["tempo"], "wide", "series", "question", "selfEvaluationFirst"),
  common("comp-swimming-explore-02", "swimming", "explore", "用具が変える腕脚の協調", "パドルとプルブイの条件で協調の違いを発見する", "腕の協調", "discover", "race", "task", "用具と腕脚の使用条件を比較する", "50mを用具なし・プルブイ・小パドルで分ける", ["各条件25mずつ泳ぎ、腕脚のつながりを比べる", "水を捉えやすい条件を本人が選ぶ"], "水を押す場所が変わるか探す", ["3条件で泳げる", "用具が感覚に与える違いを説明する"], "腕の協調、キックの継続、速度を観察する", "用具なしとプルブイだけにする", "条件ごとにテンポも変える", "腕だけのスカーリングに置き換える", "条件ごとに担当を決めて同時進行する", "レース用具を使わない泳動作の選択へ転移する", ["paddles", "pullBuoy"], ["snorkel"], "medium", "series", "bodySensation", "selfEvaluationFirst"),
  common("comp-swimming-transfer-01", "swimming", "transfer", "ペース変化を含む100m", "速度の切替後も泳法の協調を保つ", "ペース変化", "adapt", "race", "task", "速度・強度とペース順序を制約にする", "100mを25mごとにイージー・レース・イージー・レースにする", ["各区間の速度を自分で調整し、ストロークのつながりを保つ", "終了後に崩れた区間を特定する"], "速さが変わっても水をつなぐ", ["4区間を止まらず泳ぐ", "ペース変化後にストロークが極端に短くならない"], "区間ごとの速度、ストローク長、疲労の変化を見る", "50mで区間を2つにする", "直前に区間順を変える", "陸上の歩速変化と腕振りでイメージする", "4人で各区間のタイム係を置く", "レース中盤のペース変化へ接続する", ["none"], ["tempo"], "medium", "preAnnounced", "outcome", "summary"),
  common("comp-swimming-transfer-02", "swimming", "transfer", "波と隣泳者の25m選択", "変化する環境で泳法・呼吸・テンポを選ぶ", "条件が変わると崩れる", "adapt", "race", "environment", "隣泳者と波を環境制約にする", "隣レーンを交互に泳がせ、25mごとに波の条件を変える", ["波の強さに応じて呼吸側かテンポを一つ選ぶ", "選んだ条件で50mを泳ぐ"], "水面の変化から一つだけ調整する", ["環境変化後も50mを完了する", "調整した要素と結果を説明できる"], "波の発生時、選択した調整、速度を観察する", "穏やかな水面で単独実施する", "隣泳者を増やし選択時間を短くする", "水上の波を手で作り歩行中に方向を変える", "ペアごとに波を作る役と泳ぐ役を交代する", "実戦の隣接選手・波への適応に転移する", ["none"], ["tempo"], "wide", "natural", "externalFar", "onRequest"),
  common("comp-finish-establish-01", "finish", "establish", "壁まで速度を保つタッチ", "最後の一かきから壁への速度を安定させる", "フィニッシュで流す", "firstSuccess", "intro", "task", "終了地点と停止可否を固定する", "壁の2mに色マーカーを置く", ["マーカーから速度を落とさず壁へ触れる", "触れるまで最後の呼吸を入れない"], "壁を通り過ぎるつもりで触る", ["壁前でグライドしない", "速度を保ったタッチになる"], "2mからのストロークと壁接触の速度を見る", "1mから短く行う", "25mレースペースで最後の2mを試す", "床の線まで歩いて止まらない感覚を作る", "壁ごとに観察者を配置する", "競技会のタッチ直前へつなげる", ["marker"]),
  common("comp-finish-establish-02", "finish", "establish", "両手タッチの壁情報", "壁の見え方と最後のストロークを合わせる", "フィニッシュで壁に詰まる", "accuracy", "develop", "environment", "壁情報と終了地点を手がかりにする", "壁から3mに水中マーカーを置く", ["マーカーで最後の呼吸を終え、両手で壁に触れる", "触れた後の姿勢を保つ"], "壁の面を両手で迎える", ["壁前で詰まらない", "両手が同時に壁へ届く"], "最後の呼吸、ストローク長、両手接触を観察する", "歩行から両手タッチを確認する", "疲労後に同じ3m進入を行う", "陸上の壁面へ両手を伸ばす", "2人で接触タイミングを相互観察する", "平泳ぎ・バタフライのタッチへ接続する", ["marker"]),
  common("comp-finish-explore-01", "finish", "explore", "最後の呼吸をしない距離の探索", "最後の呼吸位置を変え、タッチまでの速度を探す", "最後の呼吸", "explore", "develop", "task", "最後の呼吸とストローク数を比較する", "壁前5mに入り、1回呼吸・呼吸なしの条件を作る", ["A/Bを交互に試してタッチまでの感覚を比べる", "本人が採用する条件を選ぶ"], "最後の情報を壁に残す", ["2条件のタッチを経験する", "選んだ条件で壁前の流れが続く"], "呼吸位置、壁までの距離、接触速度を見る", "呼吸条件を一つにする", "相手との位置関係を加えて直前選択する", "壁歩きで最後の一息を選ぶ", "レーンごとにA/B条件を分ける", "レース終盤の呼吸判断へ転移する", ["none"], ["marker"], "medium", "alternate", "question", "selfEvaluationFirst"),
  common("comp-finish-explore-02", "finish", "explore", "片手・両手タッチの選択", "泳法と壁情報に応じたタッチ方法を本人が試す", "片手・両手タッチ", "discover", "race", "individual", "選べる解決方法の数を増やす", "クロール区間と平泳ぎ区間を25mずつ用意する", ["各泳法で片手・両手の方法を安全に試す", "壁情報と速度から次の採用方法を決める"], "壁に届く最短の道を探す", ["2つの方法を経験する", "泳法ごとの選択理由を述べられる"], "泳法、最後のストローク、壁情報、接触を観察する", "片手タッチだけにする", "泳法を直前指定し相手位置も加える", "壁面に手を置く動作で比較する", "泳法別の担当レーンで同時進行する", "個人メドレーの泳法別タッチへつなげる", ["marker"], ["wall"], "medium", "alternate", "question", "questionOnly"),
  common("comp-finish-transfer-01", "finish", "transfer", "疲労した最後の5m", "セット終盤でも壁情報からタッチを選ぶ", "フレッシュ時はできるが疲労時に崩れる", "transfer", "race", "individual", "疲労と壁までの距離判断を組み合わせる", "75mを泳いだ直後に壁前5mへ入り、休まずタッチする", ["疲労状態で最後の呼吸とストロークを自分で選ぶ", "タッチ後に判断材料を振り返る"], "最後の5mにも前進の情報がある", ["疲労後も壁前で流れない", "タッチ方法を自分で選択できる"], "疲労度、最後の呼吸、壁までの調整を観察する", "50m後に距離を短くする", "100m後に同じ判断を行う", "陸上で疲労後の壁への歩数を確認する", "各レーンで泳距離をずらす", "競技終盤のフィニッシュ判断に転移する", ["none"], ["tempo"], "narrow", "preAnnounced", "bodySensation", "summary"),
  common("comp-finish-transfer-02", "finish", "transfer", "相手位置を使うフィニッシュ", "隣泳者との位置関係を情報にして速度を保つ", "相手との位置関係", "transfer", "race", "environment", "隣泳者と終了地点を制約にする", "隣レーンを半身差で並走させ、壁前10mを観察区間にする", ["相手の位置を一度だけ確認し、最後の呼吸とタッチを選ぶ", "壁に触れた後、使った情報を答える"], "相手ではなく壁の面へ速度を運ぶ", ["相手がいてもタッチ前に流れない", "壁情報と相手情報の使い分けを説明する"], "相手との距離、最後の呼吸、タッチ時の速度を見る", "単独で壁前10mを行う", "相手の位置を直前に変え、タッチ方法も選ばせる", "歩行で相手との距離変化を体験する", "2ペアを交互にスタートさせる", "競技会の接戦で壁へ入る判断へつなげる", ["none"], ["marker"], "medium", "natural", "externalFar", "onRequest"),
];

export const competitiveTasks: TaskTemplate[] = specs.map(makeTask);
