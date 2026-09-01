import type {
  CardDirection,
  ConstraintCategory,
  EquipmentId,
  GoalId,
  LearnToSwimLevel,
  PracticePrescription,
  TaskTemplate,
  VariabilityLevel,
  PresentationOrder,
  CueStyle,
  FeedbackStyle,
} from "../types";
import { equipmentFunctionLabels } from "./options";

type LearnTaskSpec = {
  id: string; level: LearnToSwimLevel; direction: CardDirection; title: string;
  summary: string; domain: string; goal: GoalId; observed: string;
  constraint: ConstraintCategory; constraintLabel: string; equipment?: EquipmentId[];
  optional?: EquipmentId[]; setup: string; instructions: string[]; cue: string;
  success: string[]; observation: string; easier: string; harder: string;
  noEquipment: string; largeGroup: string; transfer: string; variability: VariabilityLevel;
  order: PresentationOrder; cueStyle: CueStyle; feedback: FeedbackStyle;
};

const prescriptions: Record<string, PracticePrescription> = {
  "learn-beg-establish-water": { activity: "胸まで入り、指導者の手へ向いて戻る", oneRep: "入口から指導者の手まで1回", repetitions: "3回", recovery: "毎回30秒" },
  "learn-beg-establish-face": { activity: "口を水につけて泡を出す", oneRep: "泡を1つ出す", repetitions: "5回", recovery: "毎回20秒" },
  "learn-beg-establish-breathe": { activity: "しゃがんで泡を出し、立って息を吸う", oneRep: "下向き・上向きの手サインを4回", repetitions: "3セット", recovery: "セット間30秒" },
  "learn-beg-establish-float": { activity: "背浮きからうつ伏せ浮きへ切り替える", oneRep: "背浮き3呼吸＋うつ伏せ3秒", repetitions: "3回", recovery: "毎回30秒" },
  "learn-beg-explore-balance": { activity: "腕の位置を変え、うつ伏せで浮く", oneRep: "顔を水につけて1姿勢3秒を3種類", repetitions: "2セット", recovery: "セット間30秒" },
  "learn-beg-explore-turn": { activity: "左右の手サインへ半回転する", oneRep: "その場で半回転して指導者の手を指す", repetitions: "左右各2回", recovery: "毎回30秒" },
  "learn-beg-explore-kick": { activity: "2種類のバタ足を比べる", oneRep: "バタ足で5m", repetitions: "各方法2回", recovery: "毎回30秒" },
  "learn-beg-explore-noodle": { activity: "しゃがむ深さと泡の長さを比べるボビング", oneRep: "しゃがむ・泡を出す・立つを1回", repetitions: "2通り各3回", recovery: "方法の間20秒" },
  "learn-beg-transfer-breathe": { activity: "泡を吐きながら壁へ進む", oneRep: "壁まで5m", repetitions: "3回", recovery: "毎回30秒" },
  "learn-beg-transfer-back": { activity: "背浮きから立って壁へ行く", oneRep: "背浮き2呼吸から壁まで2m", repetitions: "3回", recovery: "毎回30秒" },
  "learn-beg-transfer-direction": { activity: "手の合図の方向へ進む", oneRep: "手サインの方向へ3m", repetitions: "3回", recovery: "毎回30秒" },
  "learn-beg-transfer-choices": { activity: "選んだ方法で進む", oneRep: "選んだ距離1・3・5mを1回", repetitions: "2通り各1回", recovery: "毎回30秒" },
  "learn-int-establish-freestyle": { activity: "バタ足を続ける横向き呼吸クロール", oneRep: "バタ足を止めずにクロールで5m", repetitions: "4回", recovery: "毎回30秒" },
  "learn-int-establish-back": { activity: "天井の目印を見て背泳ぎする", oneRep: "背泳ぎで10m", repetitions: "3回", recovery: "毎回45秒" },
  "learn-int-establish-breast": { activity: "平泳ぎ・バタフライの腕脚タイミングをつなぐ", oneRep: "選んだ泳法で5m・2周期以上", repetitions: "各泳法2回", recovery: "毎回45秒" },
  "learn-int-establish-continuous": { activity: "壁を蹴り、姿勢を伸ばして30mへつなぐ", oneRep: "壁蹴り＋15m通過＋合計30m", repetitions: "2回", recovery: "毎回60秒" },
  "learn-int-explore-breathside": { activity: "左右の呼吸を30mクロールで比べる", oneRep: "15mごとに呼吸側を変えて30m", repetitions: "2通り各1回", recovery: "方法の間45秒" },
  "learn-int-explore-stroke": { activity: "3つのテンポで10mバタ足を比べる", oneRep: "各テンポでバタ足10m", repetitions: "3テンポ各1回＋選んだテンポ1回", recovery: "テンポの間30秒" },
  "learn-int-explore-turn": { activity: "壁を蹴る向きと浮上地点を比べる", oneRep: "壁蹴りから5mまで", repetitions: "2通り各2回", recovery: "毎回30秒" },
  "learn-int-explore-switch": { activity: "手サインで泳法を切り替える", oneRep: "5m区間を3つ", repetitions: "2セット", recovery: "セット間60秒" },
  "learn-int-transfer-30m": { activity: "呼吸場所を決めてクロールする", oneRep: "クロールで30m", repetitions: "2回", recovery: "毎回60秒" },
  "learn-int-transfer-wall": { activity: "クロールまたは背泳ぎで壁を蹴って再出発する", oneRep: "壁まで5m＋壁蹴り後5m", repetitions: "3回", recovery: "毎回45秒" },
  "learn-int-transfer-breath": { activity: "隣の泳者との距離を見て呼吸する", oneRep: "距離を保って10m", repetitions: "3回", recovery: "毎回45秒" },
  "learn-int-transfer-stroke": { activity: "選んだ泳法で30mをつなぐ", oneRep: "選んだ泳法で30m", repetitions: "2回", recovery: "毎回60秒" },
  "learn-adv-establish-medley": { activity: "4泳法を順番に切り替える", oneRep: "各泳法15m、合計60m", repetitions: "2回", recovery: "毎回90秒" },
  "learn-adv-establish-back": { activity: "フラッグを見て壁に触れる", oneRep: "壁から5mを背泳ぎ", repetitions: "4回", recovery: "毎回45秒" },
  "learn-adv-establish-underwater": { activity: "水中姿勢を保って浮上する", oneRep: "壁から5mまたは8mまで", repetitions: "各距離2回", recovery: "毎回60秒" },
  "learn-adv-establish-breastturn": { activity: "平泳ぎの両手タッチから反転する", oneRep: "壁まで5m＋反対方向へ5m", repetitions: "3回", recovery: "毎回60秒" },
  "learn-adv-explore-tempo": { activity: "壁へ近づく最後の5mでテンポを比べる", oneRep: "壁まで5mを各テンポで", repetitions: "3テンポ各1回", recovery: "テンポの間60秒" },
  "learn-adv-explore-medley": { activity: "泳法切替の準備方法を比べる", oneRep: "切替1回を含む15m", repetitions: "2方法各2回", recovery: "毎回60秒" },
  "learn-adv-explore-route": { activity: "壁蹴りの向きと浮上地点を比べる", oneRep: "壁蹴りから5mまたは8mまで", repetitions: "2通り各2回", recovery: "毎回60秒" },
  "learn-adv-explore-fatigue": { activity: "疲れた後の泳ぎ方を選び直す", oneRep: "10m区間を3つ", repetitions: "1セット", recovery: "区間ごと30秒" },
  "learn-adv-transfer-60m": { activity: "4泳法を60mでつなぐ", oneRep: "各泳法15m、合計60m", repetitions: "2回", recovery: "毎回90秒" },
  "learn-adv-transfer-race": { activity: "隣の泳者を見ながら泳ぐ", oneRep: "クロールで25m", repetitions: "3回", recovery: "毎回60秒" },
  "learn-adv-transfer-finish": { activity: "最後の呼吸後に壁へ触れる", oneRep: "最後の5mを含む25m", repetitions: "3回", recovery: "毎回60秒" },
  "learn-adv-transfer-switch": { activity: "壁で2回泳法を切り替えて30mつなぐ", oneRep: "条件変更2回を含む30m", repetitions: "2回", recovery: "毎回90秒" },
};

// 技能名を選んだ結果が同じにならないよう、各課題が対応する技能を明示する。
// 1つの段階の全課題へ自動で関連付けることはしない。
const explicitDomains: Record<string, string[]> = {
  "learn-beg-establish-water": ["水慣れ", "方向づけ"],
  "learn-beg-establish-face": ["水慣れ", "顔つけ"],
  "learn-beg-establish-breathe": ["顔つけ", "水中呼気", "ボビング"],
  "learn-beg-establish-float": ["浮力", "バランス", "うつ伏せ浮き", "背浮き", "うつ伏せと仰向けの切替", "回転"],
  "learn-beg-explore-balance": ["水慣れ", "顔つけ", "浮力", "バランス", "うつ伏せ浮き", "背浮き"],
  "learn-beg-explore-turn": ["うつ伏せと仰向けの切替", "回転", "方向づけ"],
  "learn-beg-explore-kick": ["バタ足"],
  "learn-beg-explore-noodle": ["水中呼気", "ボビング"],
  "learn-beg-transfer-breathe": ["顔つけ", "水中呼気", "ボビング"],
  "learn-beg-transfer-back": ["浮力", "バランス", "うつ伏せ浮き", "背浮き", "うつ伏せと仰向けの切替", "回転"],
  "learn-beg-transfer-direction": ["水慣れ", "回転", "方向づけ"],
  "learn-beg-transfer-choices": ["水慣れ", "うつ伏せ浮き", "方向づけ"],

  "learn-int-establish-freestyle": ["バタ足", "呼吸しながら進む", "クロール"],
  "learn-int-establish-back": ["背泳ぎ"],
  "learn-int-establish-breast": ["平泳ぎ", "バタフライ"],
  "learn-int-establish-continuous": ["ストリームライン", "壁蹴り", "任意の方法で進む", "連続泳", "30mクロール"],
  "learn-int-explore-breathside": ["呼吸しながら進む", "クロール", "連続泳", "30mクロール"],
  "learn-int-explore-stroke": ["バタ足"],
  "learn-int-explore-turn": ["ストリームライン", "壁蹴り"],
  "learn-int-explore-switch": ["任意の方法で進む", "背泳ぎ", "平泳ぎ", "バタフライ", "泳法切替"],
  "learn-int-transfer-30m": ["クロール", "連続泳", "30mクロール"],
  "learn-int-transfer-wall": ["ストリームライン", "壁蹴り", "バタ足", "背泳ぎ", "ターン"],
  "learn-int-transfer-breath": ["呼吸しながら進む"],
  "learn-int-transfer-stroke": ["任意の方法で進む", "平泳ぎ", "バタフライ", "連続泳"],

  "learn-adv-establish-medley": ["クロール", "背泳ぎ", "平泳ぎ", "バタフライ", "泳法切替", "連続泳", "60m個人メドレー"],
  "learn-adv-establish-back": ["背泳ぎ", "壁への接近"],
  "learn-adv-establish-underwater": ["ストリームライン", "壁蹴り"],
  "learn-adv-establish-breastturn": ["平泳ぎ", "ターン"],
  "learn-adv-explore-tempo": ["クロール", "壁への接近", "連続泳"],
  "learn-adv-explore-medley": ["背泳ぎ", "平泳ぎ", "バタフライ", "ターン", "泳法切替", "60m個人メドレー"],
  "learn-adv-explore-route": ["ストリームライン", "壁蹴り", "壁への接近"],
  "learn-adv-explore-fatigue": ["連続泳"],
  "learn-adv-transfer-60m": ["背泳ぎ", "平泳ぎ", "バタフライ", "泳法切替", "60m個人メドレー"],
  "learn-adv-transfer-race": ["クロール", "連続泳"],
  "learn-adv-transfer-finish": ["壁への接近", "ターン"],
  "learn-adv-transfer-switch": ["ストリームライン", "壁蹴り", "ターン", "泳法切替"],
};

const equipmentFunctionsFor = (equipment: EquipmentId[]) => {
  const ids = equipment.filter((item, index) => item !== "none" && equipment.indexOf(item) === index);
  return ids.length > 0 ? ids.map((item) => equipmentFunctionLabels[item]) : [equipmentFunctionLabels.none];
};

// すべての習い事水泳課題は、用具がないレッスンでもそのまま始められる。
// 用具は選べる補助であり、コアの手順は壁・底ライン・指導者の手で成立させる。
const noEquipmentCore = (text: string) => text
  .replaceAll("水中マーカー", "底のラインの目印")
  .replaceAll("色マーカー", "底のライン")
  .replaceAll("マーカー", "底のラインの目印")
  .replaceAll("浮く物", "指導者の手")
  .replaceAll("ヌードル", "指導者の手")
  .replaceAll("ビート板", "両腕")
  .replaceAll("テンポ音", "指導者の手拍子");

const common = (s: LearnTaskSpec): TaskTemplate => {
  const prescription = prescriptions[s.id];
  // レッスンの課題は用具なしでも候補にできるよう、用具をすべて補助扱いにする。
  const requiredEquipment: EquipmentId[] = [];
  const optionalEquipment = [...(s.equipment ?? []), ...(s.optional ?? [])]
    .filter((equipment) => equipment !== "none")
    .filter((equipment, index, all) => all.indexOf(equipment) === index);

  return {
    id: s.id, mode: "learnToSwim", direction: s.direction, title: s.title, summary: s.summary,
    phases: [], domains: explicitDomains[s.id] ?? [s.domain], goals: [s.goal], observedTags: [s.observed], levels: [s.level],
    primaryConstraint: s.constraint, primaryConstraintLabel: s.constraintLabel,
    fixedConditions: ["指導者が安全を確認できる水深で実施", "成功したら本人の言葉を聞く"],
    requiredEquipment, optionalEquipment,
    equipmentFunctions: equipmentFunctionsFor([...requiredEquipment, ...optionalEquipment]),
    environmentTags: ["水面の穏やかさ", "個人・ペア・集団"],
    setup: noEquipmentCore(s.setup),
    instructions: s.instructions.map(noEquipmentCore),
    participantCue: s.cue, informationToUse: ["水面の目印", "自分の息・浮き方・進んだ距離"],
    permittedSolutions: ["本人が選んだ無理のない動き", "一度立ってから再開する"],
    participantChoices: ["始める距離", "行う順番"], successCriteria: s.success,
    coachObservation: s.observation,
    prescription,
    variabilityLevel: s.variability, presentationOrder: s.order, cueStyle: s.cueStyle, feedbackStyle: s.feedback,
    easier: s.easier, harder: s.harder, noEquipment: s.noEquipment, largeGroup: s.largeGroup,
    transferConnection: s.transfer, evidenceIds: ["minkels-2025", "tsfu-2026"],
    evidenceNote: "監修前の案です。参考資料は練習の考え方を支えるもので、この練習の効果を保証するものではありません。",
    reviewStatus: "draft",
  };
};

const specs: LearnTaskSpec[] = [
  // 初級: 成立
  { id:"learn-beg-establish-water", level:"beginner", direction:"establish", title:"胸まで入り、目標へ向く練習", summary:"水面に手を置き、合図を決めて胸まで入り、指導者の手へ身体を向ける。", domain:"水慣れ", goal:"confidence", observed:"水に入ることを嫌がる", constraint:"individual", constraintLabel:"水への安心度", setup:"浅い場所に立ち、入口から手の届く位置に指導者が手を示す。", instructions:["指導者の手に触れるだけの距離から始める。","本人が決めた合図で一歩ずつ入り、手の方向へ身体を向けて触れたら戻る。"], cue:"自分で決めた合図で胸まで入り、手の方向へ向いてみよう。", success:["自分で合図を決めて胸まで入り、示された手の方向へ身体を向けて触れられる。"], observation:"足を止める位置、身体を向け直す速さ、表情が緩む瞬間を観察する。", easier:"指導者の手を入口に置き、手を握って進める。", harder:"手を半歩遠ざけ、入る歩数と向く順番を本人に選ばせる。", noEquipment:"水面の泡や指導者の手を目標にする。", largeGroup:"入口を複数作り、順番に向く場所を選ぶ。", transfer:"初回の入水時に、自分で合図を出し、壁や指導者の方向へ向く。", variability:"narrow", order:"participantChoice", cueStyle:"question", feedback:"selfEvaluationFirst" },
  { id:"learn-beg-establish-face", level:"beginner", direction:"establish", title:"口を水につけて泡を出す", summary:"顔の一部から水に慣れ、口から泡を一つ出す。", domain:"顔つけ", goal:"firstSuccess", observed:"顔をつけたがらない", constraint:"individual", constraintLabel:"水への安心度", setup:"壁際で頬・あご・口の順に濡らせる場所を作る。", instructions:["本人が濡らす場所を一つ選ぶ。","水面に口を近づけ、泡を一つ出したら顔を上げる。"], cue:"口を水につけて、泡を一つ出してみよう。", success:["自分で選んだ場所を水に触れさせ、口から泡を一つ出せる。"], observation:"顔を近づける速さと、泡の後に慌てず戻れるかを観察する。", easier:"あごまでに限定し、指導者が水面を手で支える。", harder:"泡を三つ連続で出してから顔を上げる。", noEquipment:"手のひらに張った水を目標にする。", largeGroup:"各自の泡の数を指で示し、待ち時間も練習にする。", transfer:"シャワーや洗顔で自分から息を吐く。", variability:"constant", order:"block", cueStyle:"analogy", feedback:"oneObservation" },
  { id:"learn-beg-establish-breathe", level:"beginner", direction:"establish", title:"手の合図でボビング呼気", summary:"しゃがんで泡を出し、立って息を吸う動きを指導者の手の合図に合わせる。", domain:"水中呼気", goal:"stabilize", observed:"水中で息を吐けない", constraint:"task", constraintLabel:"呼吸できる場所", equipment:["marker"], setup:"胸までの水深で、指導者の手が見える足のつく場所にする。", instructions:["下向きの手サインでしゃがみ、水中で泡を出す。","上向きの手サインで立って息を吸い、浅くしゃがむ方法と深くしゃがむ方法を一度ずつ行う。"], cue:"下向きの手でしゃがんで泡を出し、上向きの手で立って息を吸おう。", success:["手サインで泡を吐き、落ち着いて立ち上がって息を吸える。"], observation:"しゃがむ前に息を止めて固まる時間を観察する。", easier:"二つの手サインをゆっくり交互にし、しゃがむ深さを浅くする。", harder:"下向きの手を二回続け、泡を長くしてから立つ。", noEquipment:"指導者の手サインで行う。", largeGroup:"各レーンに合図役を置き、交代で手サインを出す。", transfer:"壁まで進む前に、しゃがんで泡を出して呼吸を整える。", variability:"narrow", order:"preAnnounced", cueStyle:"externalNear", feedback:"resultOnly" },
  { id:"learn-beg-establish-float", level:"beginner", direction:"establish", title:"背浮きからうつ伏せ浮きへ切り替える", summary:"背浮きと、うつ伏せ浮きをゆっくり切り替えて三呼吸ぶん浮く。", domain:"背浮き", goal:"confidence", observed:"仰向けを嫌がる", constraint:"individual", constraintLabel:"水への安心度", equipment:["noodle"], setup:"指導者が背中へ手を添えられる水深で始める。補助具があれば支えとして使える。", instructions:["天井を見て背浮きで三回呼吸する。","身体を横にしてからうつ伏せへ返り、顔を水につけて三秒浮く。"], cue:"背中を支えてもらい、横を通ってうつ伏せにもなってみよう。", success:["背浮きで三呼吸し、横を通ってうつ伏せ浮きへ落ち着いて切り替えられる。"], observation:"首や肩に力が入る瞬間と、返るときの息を観察する。", easier:"指導者の手を肩と腰の二か所に添え、背浮きだけから始める。", harder:"支えを軽くし、うつ伏せ浮きを五秒に伸ばす。", noEquipment:"指導者の手を肩甲骨に添える。", largeGroup:"ペアが数を読み、交代で安全を見守る。", transfer:"水中で不安になったとき、背浮きと立つ動きを自分で選ぶ。", variability:"constant", order:"block", cueStyle:"analogy", feedback:"selfEvaluationFirst" },
  // 初級: 探索
  { id:"learn-beg-explore-balance", level:"beginner", direction:"explore", title:"腕の位置を変えるうつ伏せ浮き", summary:"顔を水につけ、腕の位置を変えていちばん静かなうつ伏せ浮きを探す。", domain:"バランス", goal:"discover", observed:"浮くときに動き続ける", constraint:"task", constraintLabel:"開始姿勢", equipment:["none"], setup:"足が底につく場所で、腕を前・横・体側の三姿勢にする。", instructions:["顔を水につけ、各姿勢で三秒だけうつ伏せに浮く。","泡を出しながら、水面の揺れが少なかった腕の位置を本人が選ぶ。"], cue:"腕を前・横・体側のどの位置にすると、顔をつけても揺れにくい？", success:["三姿勢を行い、自分で選んだ姿勢で顔を水につけて三秒保てる。"], observation:"姿勢変更時に息を止めるかを観察する。", easier:"二姿勢から選び、顔を水につける時間を短くする。", harder:"腕の位置を四種類へ増やし、静かな姿勢を言葉で選ぶ。", noEquipment:"手の形を変えて行う。", largeGroup:"同時に姿勢を変え、水面の揺れが少なかった腕の位置を拍手で共有する。", transfer:"浮き始めに自分で静かな姿勢を選ぶ。", variability:"medium", order:"participantChoice", cueStyle:"question", feedback:"questionOnly" },
  { id:"learn-beg-explore-turn", level:"beginner", direction:"explore", title:"左右の手サインへ半回転", summary:"その場で半回転し、左右で指導者が示す手の方向へ身体を向ける。", domain:"回転", goal:"explore", observed:"方向を変えられない", constraint:"task", constraintLabel:"身体を向ける順番", equipment:["floatingObject"], setup:"指導者が左右に手を示せる場所で、立位または浮き姿勢から始める。", instructions:["好きな方向へ顔・肩・腰の順に半回転する。","向いた先の指導者の手を指し、次は反対側でも行う。"], cue:"左右の手サインへ向くとき、頭・肩・腰のどこから回す？", success:["左右どちらにもその場で半回転し、選んだ方向の指導者の手を指せる。"], observation:"頭だけで回ろうとせず身体全体が連動するかを観察する。", easier:"指導者を近づけ、立位で半回転する。", harder:"手サインを直前に変え、回る向きを本人に選ばせる。", noEquipment:"指導者の手を目標にする。", largeGroup:"左右の手サインを交互に示し、同時に回転する。", transfer:"壁に近づいたとき、空いた方向へ身体を向け直す。", variability:"medium", order:"alternate", cueStyle:"externalFar", feedback:"showGoodTrial" },
  { id:"learn-beg-explore-kick", level:"beginner", direction:"explore", title:"二種類のバタ足を比べる", summary:"足の動かし方を変え、泡を残して短く進む。", domain:"バタ足", goal:"discover", observed:"キックだけでは進まない", constraint:"task", constraintLabel:"使用できる腕・脚", equipment:["kickboard", "marker"], setup:"ビート板の先に色マーカーを5m間隔で置く。", instructions:["膝を曲げる小さなキックと、足首をゆるめるキックを行う。","泡と進んだマーカーを見て、進んだ方法を選ぶ。"], cue:"どちらの足の動かし方が前へ進みやすい？", success:["二つのキックを行い、選んだ方法で5m進める。"], observation:"腕で板を押し下げて姿勢を補っていないかを見る。", easier:"2m先のマーカーにする。", harder:"5mを二回続け、選んだキックを保つ。", noEquipment:"腕を前に伸ばして水面の泡を目印にする。", largeGroup:"各自の練習場所を作り、同時に一つずつ行う。", transfer:"壁から離れる最初の5mで足の方法を選ぶ。", variability:"medium", order:"alternate", cueStyle:"externalFar", feedback:"selfEvaluationFirst" },
  { id:"learn-beg-explore-noodle", level:"beginner", direction:"explore", title:"しゃがむ深さを比べるボビング", summary:"浅くしゃがむ方法と深くしゃがむ方法で、泡を出して立ち上がるやりやすさを比べる。", domain:"ボビング", goal:"explore", observed:"水中で息を吐けない", constraint:"task", constraintLabel:"しゃがむ深さ", equipment:["marker"], setup:"胸までの水深に、浅くしゃがむ位置と深くしゃがむ位置の目印を置く。", instructions:["浅くしゃがんで泡を出し、立って息を吸う。","深くしゃがむ方法も行い、泡を出しやすかった深さを本人が選ぶ。"], cue:"浅くしゃがむ時と深くしゃがむ時、どちらが泡を出しやすい？", success:["二つの深さでボビングを行い、選んだ深さで泡を出して立ち上がれる。"], observation:"しゃがむ前後に息を止めず、落ち着いて立てるかを見る。", easier:"浅い位置だけにし、指導者と同時に行う。", harder:"泡を三つ続けてから立つ方法も比べる。", noEquipment:"底の線や指導者の手の高さを深さの目印にする。", largeGroup:"浅い位置と深い位置に分かれ、順番を変えて比べる。", transfer:"泳ぎ始める前に、ボビングで水中の呼吸を整える。", variability:"wide", order:"participantChoice", cueStyle:"question", feedback:"onRequest" },
  // 初級: 実場面
  { id:"learn-beg-transfer-breathe", level:"beginner", direction:"transfer", title:"泡を吐きながら壁まで5m", summary:"5mの移動中に、壁の前で息を整える。", domain:"呼吸しながら進む", goal:"connect", observed:"呼吸すると止まる", constraint:"task", constraintLabel:"呼吸できる場所", equipment:["wall", "marker"], setup:"壁から5mの底ラインを開始目印にし、途中で立てる場所を確保する。", instructions:["底ラインの位置から壁へ、しゃがんで泡を出しながら進む。","必要なら一度立って息を吸い、壁に触れたら合図を出す。"], cue:"水中で息を吐きながら、壁まで5m進もう。", success:["5mを進み、呼吸のために立っても再開して壁に触れられる。"], observation:"息継ぎ後の最初の一歩が止まらないかを見る。", easier:"距離を3mにし、途中の停止地点を増やす。", harder:"停止地点を一つにして5mを連続する。", noEquipment:"底のラインを壁までの目印にする。", largeGroup:"複数の壁目標を用意し、子どもが空いた目標を選ぶ。", transfer:"実際のレッスン入退水で壁まで落ち着いて移動する。", variability:"narrow", order:"preAnnounced", cueStyle:"externalFar", feedback:"resultOnly" },
  { id:"learn-beg-transfer-back", level:"beginner", direction:"transfer", title:"背浮きとうつ伏せ浮きから立って壁へ", summary:"背浮きとうつ伏せ浮きを選んで行い、立って壁へ向かう一連の流れを行う。", domain:"うつ伏せと仰向けの切替", goal:"confidence", observed:"うつ伏せから仰向けになれない", constraint:"task", constraintLabel:"終了地点", equipment:["wall"], setup:"壁から2mで、背浮きまたはうつ伏せ浮きを始められる水深にする。", instructions:["背浮きまたはうつ伏せ浮きで二呼吸ぶん浮き、横を通って立つ。","壁を見つけたら歩いて触れ、次は反対の浮き方で行う。"], cue:"背浮きとうつ伏せ浮き、どちらからでも落ち着いて立って壁へ行こう。", success:["背浮きとうつ伏せ浮きの両方から自分で立ち、壁に触れるまで落ち着いて移動できる。"], observation:"返るときや立つときに慌てて手足をばたつかせないかを見る。", easier:"壁を1mに近づけ、指導者の手を目標にする。", harder:"開始位置を3mにし、立つ前に一呼吸増やす。", noEquipment:"壁だけを目標にする。", largeGroup:"壁沿いに開始場所を等間隔で作る。", transfer:"水中で不安を感じたとき、背浮きまたはうつ伏せ浮きから立って壁へ戻る。", variability:"constant", order:"block", cueStyle:"analogy", feedback:"selfEvaluationFirst" },
  { id:"learn-beg-transfer-direction", level:"beginner", direction:"transfer", title:"手の合図で向きを変える", summary:"指導者が示した方向へ身体を半回転させ、短く進む。", domain:"方向づけ", goal:"adapt", observed:"方向を変えられない", constraint:"environment", constraintLabel:"指導者の手サイン", equipment:["floatingObject", "marker"], setup:"左右と正面に指導者が立てる場所を確保し、中央から立位で始める。", instructions:["指導者の手の方向を見つけ、顔・肩・腰の順に身体を向け直す。","示された方向へ3m進み、指導者の手に触れたら次の合図を待つ。"], cue:"指導者の手を見て、身体ごと向きを変えて進もう。", success:["二方向以上の手サインに応じ、身体を向け直して指導者の手に触れられる。"], observation:"合図を見てから身体を向け直すまでの迷いを観察する。", easier:"方向を一つに固定し、指導者を近づける。", harder:"合図を直前に出し、三方向を続ける。", noEquipment:"指導者の手の方向を目標にする。", largeGroup:"方向ごとに係を置き、全員が空いた場所を選ぶ。", transfer:"遊泳中に人や壁を避ける方向を自分で選ぶ。", variability:"medium", order:"lastSecond", cueStyle:"externalFar", feedback:"oneObservation" },
  { id:"learn-beg-transfer-choices", level:"beginner", direction:"transfer", title:"距離と進み方を選ぶ5m練習", summary:"泳ぎ方と距離を選び、5mを選んだ方法で進む。", domain:"任意の方法で進む", goal:"confidence", observed:"一つの泳ぎ方に固定している", constraint:"task", constraintLabel:"選手・子どもが選べる項目", equipment:["marker"], setup:"1m・3m・5mのマーカーと、壁・板なしの開始場所を用意する。", instructions:["距離と進み方を本人が選ぶ。","選んだ方法で進み、終わったら別の方法を一つ行う。"], cue:"選んだ距離を、どの進み方なら最後まで行けそう？", success:["自分で選んだ距離を選んだ方法で完了し、別の方法も一度試せる。"], observation:"選択後に開始できるまでの時間と安心度を見る。", easier:"距離を1mまたは3mだけにする。", harder:"5mを二つの方法で連続する。", noEquipment:"マーカーを底のラインに置き換える。", largeGroup:"距離ごとの列を作り、空いた列を本人が選ぶ。", transfer:"レッスンの課題で、適した進み方を自分から提案する。", variability:"wide", order:"participantChoice", cueStyle:"question", feedback:"onRequest" },
  // 中級: 成立
  { id:"learn-int-establish-freestyle", level:"intermediate", direction:"establish", title:"バタ足を続ける横向き呼吸クロール", summary:"バタ足を止めず、腕を前へ伸ばして顔を横に向け、5mを進む。", domain:"クロール", goal:"firstSuccess", observed:"呼吸すると姿勢が変わる", constraint:"task", constraintLabel:"呼吸側", equipment:["marker"], setup:"底ラインで5mを見積もり、片側で顔を出せる幅を空ける。", instructions:["片腕を前に残して反対側へ顔を向け、バタ足を始める。","5mを目安に、呼吸後もバタ足のリズムを止めずに続ける。"], cue:"顔を横に向けて息を吸い、バタ足を止めずに進もう。", success:["5mを進み、顔を横に向けて一度呼吸した後もバタ足を続けられる。"], observation:"呼吸時に前腕が下がり、バタ足と身体が止まらないかを見る。", easier:"呼吸側を固定し、距離を3mにする。", harder:"左右どちらでも一度ずつ呼吸し、バタ足のリズムを保つ。", noEquipment:"底のラインを5mの目安にする。", largeGroup:"片側呼吸の列と反対側呼吸の列を作る。", transfer:"通常のクロールで、呼吸中もバタ足を続けて壁までつなげる。", variability:"narrow", order:"block", cueStyle:"externalNear", feedback:"oneObservation" },
  { id:"learn-int-establish-back", level:"intermediate", direction:"establish", title:"天井を見て10m背泳ぎ", summary:"底のラインを見ず、天井の線を手がかりに10m進む。", domain:"背泳ぎ", goal:"stabilize", observed:"疲れると動きが小さくなる", constraint:"environment", constraintLabel:"視認性", equipment:["marker"], setup:"10m地点に色マーカーを置き、背泳ぎの進行方向に障害物がないことを確認する。", instructions:["天井の線を見つけて背泳ぎを始める。","色マーカーまで腕の大きさを保って進む。"], cue:"天井の目印を見ながら、腕の大きさを保って進もう。", success:["天井の線を手がかりに、10mを止まらず進める。"], observation:"疲れたときに腕の入水位置が左右へずれないかを見る。", easier:"5mに短縮し、指導者が横を歩く。", harder:"天井の別の線へ途中で目標を変える。", noEquipment:"レーンロープを目標として使う。", largeGroup:"隣の泳者と間隔を空け、同じ線を順番に使う。", transfer:"背泳ぎで壁のフラッグを見つけて速度を落とさず近づく。", variability:"constant", order:"block", cueStyle:"externalFar", feedback:"outOfRangeOnly" },
  { id:"learn-int-establish-breast", level:"intermediate", direction:"establish", title:"平泳ぎ・バタフライの腕脚タイミング", summary:"平泳ぎまたはバタフライを選び、腕と脚がそろう順番を一つの流れにする。", domain:"平泳ぎ", goal:"connect", observed:"腕を使うとキックが止まる", constraint:"task", constraintLabel:"動作順序", equipment:["marker"], setup:"底のライン上に3mと5mの目印を置き、立って説明できる場所にする。", instructions:["平泳ぎは腕を引いてから脚を蹴り、伸びる。バタフライは腕を前へ戻す動きに合わせて二回キックする。","選んだ泳法で二周期行い、腕と脚が止まらずつながるか確かめる。"], cue:"平泳ぎかバタフライを選び、腕と脚がつながる順番で動こう。", success:["選んだ泳法で二周期以上、腕と脚の動きを止めずに5m進める。"], observation:"平泳ぎは腕を戻す前に脚を蹴っていないか、バタフライは腕だけで進もうとしていないかを観察する。", easier:"壁を持って、選んだ泳法の腕と脚の動きを分けて確かめる。", harder:"もう一方の泳法も行い、タイミングの違いを言葉で比べる。", noEquipment:"底のラインをマーカーにする。", largeGroup:"平泳ぎ組とバタフライ組に分かれ、腕と脚の順番を交代で観察する。", transfer:"平泳ぎまたはバタフライで壁までの最後二周期を同じ順序にする。", variability:"narrow", order:"series", cueStyle:"analogy", feedback:"showGoodTrial" },
  { id:"learn-int-establish-continuous", level:"intermediate", direction:"establish", title:"壁を蹴って30mへ連続泳", summary:"壁を蹴って姿勢を伸ばし、選んだ泳ぎ方で立たずに30mへつなぐ。", domain:"連続泳", goal:"stabilize", observed:"15mは泳げるが30mで止まる", constraint:"task", constraintLabel:"距離", equipment:["marker"], setup:"15mと30mに色マーカーを置き、壁を蹴ってから途中で立たずに泳げる水深にする。", instructions:["壁を蹴り、腕を耳の横へ伸ばしてから選んだ泳ぎ方で始める。","15mで呼吸と姿勢を確認し、そのまま30mまでペースを小さく保つ。"], cue:"壁を蹴って姿勢を長くしたら、選んだ泳ぎ方で30mまで進もう。", success:["壁を蹴った後に姿勢を伸ばし、途中で立たず30mまで連続して進める。"], observation:"壁を蹴った直後に頭が上がるか、15m通過後にストロークが急に小さくならないかを見る。", easier:"20m地点を終点にし、泳ぎ方を一つに固定する。", harder:"30m後半で呼吸側または泳ぎ方を一度選び直す。", noEquipment:"底のラインで15mと30mを示す。", largeGroup:"15m発車と30m発車の列を交互にする。", transfer:"レッスンの連続泳で、壁を蹴った姿勢と自分のペースを使う。", variability:"constant", order:"preAnnounced", cueStyle:"externalFar", feedback:"summary" },
  // 中級: 探索
  { id:"learn-int-explore-breathside", level:"intermediate", direction:"explore", title:"左右の呼吸を30mクロールで比べる", summary:"15mごとに呼吸側を変えて30mクロールを行い、続けやすさを比べる。", domain:"呼吸しながら進む", goal:"discover", observed:"呼吸すると止まる", constraint:"individual", constraintLabel:"呼吸側", equipment:["marker"], setup:"底ラインで15mと30mを見積もり、右呼吸と左呼吸を同じ順番で行えるようにする。", instructions:["最初の15mは右側、次の15mは左側で呼吸して30mを進む。","次は順番を入れ替え、頭の上がりと続けやすさを本人が比べる。"], cue:"右・左のどちらから始めると、30mを続けやすい？", success:["二つの順番で30mを行い、選んだ呼吸側で姿勢を保ち続けられる。"], observation:"呼吸側を変えたときの頭の上がりとバタ足の停止を見る。", easier:"15mずつに分け、片側ずつ比べる。", harder:"左右を交互にし、呼吸側を本人が直前に選ぶ。", noEquipment:"底のラインを15mと30mの目安にする。", largeGroup:"右呼吸・左呼吸の順を交代で行い、待つ間に相手を観察する。", transfer:"混雑や疲れに合わせ、呼吸側を自分で選ぶ。", variability:"medium", order:"alternate", cueStyle:"question", feedback:"selfEvaluationFirst" },
  { id:"learn-int-explore-stroke", level:"intermediate", direction:"explore", title:"三つのテンポで10mバタ足を比べる", summary:"バタ足のテンポを変えて、10mの進みやすさを比べる。", domain:"バタ足", goal:"explore", observed:"キックだけでは進まない", constraint:"task", constraintLabel:"バタ足のテンポ", equipment:["tempo", "marker"], setup:"指導者の手拍子をゆっくり・中・速めの三種類にし、底ラインで10mを見積もる。", instructions:["腕を前に伸ばし、手拍子に合わせてバタ足で10m進む。","三つのテンポを行った後、進みやすかったテンポでもう一度バタ足を行う。"], cue:"バタ足のテンポを変えると、どれが前へ進みやすい？", success:["三テンポと選んだテンポを行い、自分に合うバタ足で10mを進める。"], observation:"テンポ変更で膝が大きく曲がるか、足首が固まるかを見る。", easier:"ゆっくりと中の二種類に絞る。", harder:"本人が途中でテンポを選び直す。", noEquipment:"指導者の手拍子と底のラインを使う。", largeGroup:"各レーンを別テンポにし、交代して比較する。", transfer:"壁から離れる最初の10mで、進みやすいバタ足のテンポを選ぶ。", variability:"wide", order:"series", cueStyle:"externalNear", feedback:"selfEvaluationFirst" },
  { id:"learn-int-explore-turn", level:"intermediate", direction:"explore", title:"壁蹴りの向きと浮上地点を比べる", summary:"壁をまっすぐ蹴る方法と斜めに蹴る方法で、進む向きと浮上しやすい地点を比べる。", domain:"壁蹴り", goal:"discover", observed:"壁を蹴っても進まない", constraint:"task", constraintLabel:"壁を蹴る向き", equipment:["wall", "marker"], setup:"壁から5mの中央と左右にマーカーを置き、安全な水深を確認する。", instructions:["壁をまっすぐ蹴り、腕を耳の横へ伸ばして中央の目印へ進む。","次は足の向きを少し変えて蹴り、どの目印へ浮上しやすいか比べる。"], cue:"壁をどちらへ蹴ると、狙った目印に浮上しやすい？", success:["二つの蹴る向きを行い、狙った目印に近づきやすい向きを説明できる。"], observation:"足を置く位置、蹴った直後の身体の向き、浮上地点を見る。", easier:"まっすぐ蹴る方法だけを行い、5mの中央目印を大きくする。", harder:"蹴る向きを本人が選び、二本目で修正する。", noEquipment:"底のラインと指導者の手で進行方向を示す。", largeGroup:"中央・左・右の目印ごとに列を分けて一巡する。", transfer:"壁を蹴った後、空いたコースの中央へ姿勢を向けて再出発する。", variability:"medium", order:"series", cueStyle:"question", feedback:"oneObservation" },
  { id:"learn-int-explore-switch", level:"intermediate", direction:"explore", title:"手サインで泳法を切り替える", summary:"指導者の手サインで泳法を切り替え、次の区間を選ぶ。", domain:"泳法切替", goal:"adapt", observed:"泳法切替に時間がかかる", constraint:"task", constraintLabel:"使用泳法", equipment:["marker"], setup:"5mごとの底ラインを区切りにし、指導者が手サインで次の泳法を伝えられるようにする。", instructions:["指導者の手サインを見たら、指定された次の泳法へ切り替える。","切り替えやすかった泳法の順番を一つ選び、もう一度行う。"], cue:"手サインが出たら、指定された泳法に変えよう。", success:["二回以上、手サインから次の泳法へ止まらず切り替えられる。"], observation:"切替前に完全停止するか、手サインを見た後の視線がどこへ向くかを見る。", easier:"二泳法・10mだけにする。", harder:"手サインを直前に出し、三泳法を続ける。", noEquipment:"壁、底のライン、指導者の手サインで行う。", largeGroup:"合図役を置き、泳者は十分な間隔を空けて順番に進む。", transfer:"メドレーや遊びのルール変更に合わせて泳法を変える。", variability:"wide", order:"lastSecond", cueStyle:"externalFar", feedback:"showGoodTrial" },
  // 中級: 実場面
  { id:"learn-int-transfer-30m", level:"intermediate", direction:"transfer", title:"呼吸場所を決めて30mクロール", summary:"呼吸場所と休み方を決め、30mを泳ぎ切る。", domain:"30mクロール", goal:"transfer", observed:"15mは泳げるが30mで止まる", constraint:"task", constraintLabel:"休息時間", equipment:["marker"], setup:"15m・30mの目印と、必要時に立てる安全地点を用意する。", instructions:["最初に呼吸する場所と速度を本人が決める。","30mまで進み、立った場合は一呼吸で再開する。"], cue:"30mの途中で、どこで呼吸すると続けやすい？", success:["決めた呼吸場所を使い、30mを立たずに、または一度の短い立位で完了する。"], observation:"後半に呼吸間隔とストローク長がどう変わるかを見る。", easier:"20mに短縮し、呼吸地点を二つ示す。", harder:"最後の10mだけ速度を少し上げる。", noEquipment:"底のラインで距離を数える。", largeGroup:"15m折返し組と30m直行組を交互に動かす。", transfer:"通常の30m評価や自由泳で自分のペースを使う。", variability:"narrow", order:"preAnnounced", cueStyle:"question", feedback:"summary" },
  { id:"learn-int-transfer-wall", level:"intermediate", direction:"transfer", title:"クロール・背泳ぎでバタ足を続けて壁を蹴る", summary:"クロールまたは背泳ぎで壁へ行き、壁を蹴った後もバタ足を続けて再出発する。", domain:"ターン", goal:"connect", observed:"壁で完全に止まる", constraint:"task", constraintLabel:"動作順序", equipment:["wall", "marker"], setup:"壁から5mの底ラインを開始目印にし、タッチ後に安全な方向へ出られる場所にする。", instructions:["クロールまたは背泳ぎでバタ足を続けながら壁まで5m進み、壁に触れて足を置く。","壁を蹴って姿勢を伸ばし、バタ足を止めずに同じ泳法で反対方向へ5m進む。"], cue:"クロールまたは背泳ぎで壁に触れたら、バタ足を止めずに姿勢を伸ばして壁を蹴り直そう。", success:["クロールまたは背泳ぎで、バタ足を続けながら壁に触れる・足を置く・壁を蹴る・5m進むをつなげられる。"], observation:"タッチ後に方向を失う時間、足を置く位置、壁を蹴った直後にバタ足が止まらないかを見る。", easier:"壁で立って方向と足の位置を確認してから再開する。", harder:"タッチ後の立位をなくし、クロールと背泳ぎの両方でバタ足を続ける。", noEquipment:"壁と底のラインを開始・折返しの目印にする。", largeGroup:"クロール組と背泳ぎ組でスタートをずらし、壁付近の間隔を守る。", transfer:"レッスンの往復泳で、クロールまたは背泳ぎのバタ足を続けながら壁を使って流れを切らさない。", variability:"constant", order:"block", cueStyle:"analogy", feedback:"oneObservation" },
  { id:"learn-int-transfer-breath", level:"intermediate", direction:"transfer", title:"隣の泳者に合わせた呼吸", summary:"隣の泳者を意識しながら、呼吸側と間隔を調整する。", domain:"呼吸しながら進む", goal:"adapt", observed:"呼吸すると姿勢が変わる", constraint:"environment", constraintLabel:"隣の泳者", equipment:["marker"], setup:"同じ方向に泳ぐペアを2m以上離し、片側に目印を置く。", instructions:["隣との距離を見て呼吸側を選ぶ。","10mを進み、選択理由を泳後に一言で話す。"], cue:"隣の泳者との距離を見て、呼吸する側を選ぼう。", success:["隣との距離を保ち、選んだ側で10mを一度も立たずに進める。"], observation:"隣を気にした瞬間に頭が上がるかを見る。", easier:"隣を置かず、呼吸側だけを選ぶ。", harder:"途中で隣の位置を変え、側を切り替える。", noEquipment:"レーンラインを間隔の基準にする。", largeGroup:"レーンを一方通行にし、間隔を保って連続する。", transfer:"混雑したレッスンでも周囲を見て安全に呼吸する。", variability:"medium", order:"natural", cueStyle:"question", feedback:"onRequest" },
  { id:"learn-int-transfer-stroke", level:"intermediate", direction:"transfer", title:"選んだ泳法で30mをつなぐ", summary:"クロール・背泳ぎ・平泳ぎ・バタフライから選び、途中で立たずに30mをつなぐ。", domain:"連続泳", goal:"maintainSpeed", observed:"疲れると動きが小さくなる", constraint:"individual", constraintLabel:"距離", equipment:["marker"], setup:"底ラインで15mと30mを見積もり、途中で立たずに泳げる水深にする。", instructions:["本人が泳法を一つ選び、15mを過ぎても同じ泳法で進む。","30mまでつなぎ、次は別の泳法を選んでもう一度行う。"], cue:"30mをつなげそうな泳法を選び、途中で立たずに進もう。", success:["選んだ泳法で30mをつなぎ、別の泳法でも一度試せる。"], observation:"15m以降に姿勢・呼吸・キックがどう変わるかを見る。", easier:"20mに短縮し、泳法を一つに固定する。", harder:"30mを二本行い、二本目で泳法を変える。", noEquipment:"底のラインで15mと30mを示す。", largeGroup:"泳法ごとにスタートをずらし、30mまでの間隔を守る。", transfer:"長い距離や進級テストで、自分に合う泳法を選んで続ける。", variability:"medium", order:"preAnnounced", cueStyle:"bodySensation", feedback:"summary" },
  // 上級: 成立
  { id:"learn-adv-establish-medley", level:"advanced", direction:"establish", title:"四泳法を60mで切り替える", summary:"四泳法を15mずつ、切替地点で止まらず進む。", domain:"60m個人メドレー", goal:"connect", observed:"泳法切替に時間がかかる", constraint:"task", constraintLabel:"動作順序", equipment:["marker"], setup:"各泳法の切替地点を15m・30m・45m・60mに示す。", instructions:["指定された泳法で15mずつ進む。","色の地点で次の泳法へ切り替え、最後まで続ける。"], cue:"切替地点で次の泳法の姿勢に変え、止まらず続けよう。", success:["四泳法を切替地点で止まらずつなぎ、60mを完了する。"], observation:"切替の直前に視線と速度がどう変わるかを見る。", easier:"各泳法を10mにし、切替前に合図する。", harder:"切替合図を直前にし、60mを二本目も行う。", noEquipment:"底のラインと壁を地点の目安にする。", largeGroup:"泳法ごとにスタートをずらし、同時に各区間を使う。", transfer:"実際の個人メドレーで泳法切替を流れにする。", variability:"narrow", order:"preAnnounced", cueStyle:"externalFar", feedback:"summary" },
  { id:"learn-adv-establish-back", level:"advanced", direction:"establish", title:"フラッグ後の壁タッチ", summary:"背泳ぎでフラッグを見て、速度を保ったタッチを作る。", domain:"背泳ぎ", goal:"accuracy", observed:"壁で完全に止まる", constraint:"environment", constraintLabel:"フラッグ", equipment:["wall", "marker"], setup:"壁から5mにフラッグ、壁にタッチ目標を置く。", instructions:["フラッグを見つけたら最後の呼吸を終える。","腕のリズムを保ち、壁に手を触れる。"], cue:"フラッグを見たら、壁までのストローク数を数えよう。", success:["フラッグ後に減速せず、壁へ一度の連続動作で触れられる。"], observation:"フラッグ確認後のストローク数と頭の動きを記録する。", easier:"壁までの距離を短くし、フラッグを大きく示す。", harder:"進入速度を変え、同じ判断を行う。", noEquipment:"壁からの距離を底のラインで示す。", largeGroup:"一方向の背泳ぎレーンにしてフラッグ区間を共有する。", transfer:"レースやタイム計測のフィニッシュで壁情報を使う。", variability:"medium", order:"series", cueStyle:"externalNear", feedback:"resultOnly" },
  { id:"learn-adv-establish-underwater", level:"advanced", direction:"establish", title:"水中姿勢を保って浮上", summary:"壁蹴り後に姿勢を保ち、決めた地点で浮上する。", domain:"ストリームライン", goal:"stabilize", observed:"顔をすぐ上げる", constraint:"task", constraintLabel:"水中距離", equipment:["wall", "marker"], setup:"壁から5mと8mに水中マーカーを置き、安全に浮上できる深さを確認する。", instructions:["壁を蹴り、腕を伸ばした姿勢で進む。","5mまたは8mの選んだ地点で最初の泳ぎを始める。"], cue:"水中姿勢を保ち、選んだ地点で浮上しよう。", success:["選んだ地点まで姿勢を崩さず進み、最初のストロークへつなげる。"], observation:"浮上前のキック数と身体の向きを見る。", easier:"5mだけにし、指導者が地点を示す。", harder:"地点を本人が直前に選び、二本で比較する。", noEquipment:"底のラインで距離を見積もる。", largeGroup:"5m組と8m組を交互にスタートする。", transfer:"スタートやターン後に速度を保って浮上する。", variability:"narrow", order:"participantChoice", cueStyle:"externalFar", feedback:"oneObservation" },
  { id:"learn-adv-establish-breastturn", level:"advanced", direction:"establish", title:"平泳ぎの両手タッチから反転", summary:"両手タッチから身体を整え、反対方向へ出る。", domain:"ターン", goal:"accuracy", observed:"壁で完全に止まる", constraint:"task", constraintLabel:"ターン形式", equipment:["wall", "marker"], setup:"壁前5mに進入ライン、壁後5mに出口ラインを置く。", instructions:["平泳ぎで両手を同時に壁へ触れる。","壁を見て足を置き、身体を反転して出口へ進む。"], cue:"両手で壁に触れたら、身体を反転して反対方向へ進もう。", success:["両手タッチから反転・蹴り出し・5m進行を止まらず行える。"], observation:"タッチ時の両手の同時性と、足の置き場所を見る。", easier:"タッチ後に立って足の位置を確認する。", harder:"進入速度を上げ、出口ラインまで連続する。", noEquipment:"底のラインを出口の目印にする。", largeGroup:"壁の左右を使い、タッチ方向を交互にする。", transfer:"平泳ぎのターンで規則を守りながら流れを保つ。", variability:"constant", order:"block", cueStyle:"demonstration", feedback:"showGoodTrial" },
  // 上級: 探索
  { id:"learn-adv-explore-tempo", level:"advanced", direction:"explore", title:"壁へ近づく最後の5mでテンポを比べる", summary:"クロールで壁へ近づく最後の5mを三つのテンポで泳ぎ、姿勢を保ちやすい方法を比べる。", domain:"クロール", goal:"maintainSpeed", observed:"疲れると動きが小さくなる", constraint:"task", constraintLabel:"テンポ", equipment:["tempo", "marker"], setup:"壁から5mの底ラインを開始目印にし、一定・速め・本人選択の三条件を指導者の手拍子で示す。", instructions:["壁から5mの位置から、各テンポで壁までクロールする。","頭の上がりとタッチ前の腕の大きさを比べ、保ちやすいテンポを選ぶ。"], cue:"最後の5mで、壁まで姿勢を保ちやすいテンポはどれ？", success:["三条件を比較し、壁へ近づく最後の5mで姿勢を保ちやすいテンポを選べる。"], observation:"テンポごとのストローク数、頭の上がり、タッチ前の姿勢を見る。", easier:"一定と本人選択の二条件にする。", harder:"50mの後半で同じ比較をする。", noEquipment:"指導者の手拍子と底のラインを使う。", largeGroup:"レーンごとにテンポを割り当てて交代する。", transfer:"レースや記録測定で、壁へ近づく最後の区間のテンポを自分で調整する。", variability:"wide", order:"series", cueStyle:"bodySensation", feedback:"selfEvaluationFirst" },
  { id:"learn-adv-explore-medley", level:"advanced", direction:"explore", title:"泳法切替の準備時点を比べる", summary:"個人メドレーの切替前後で準備の方法を二通り比べる。", domain:"泳法切替", goal:"explore", observed:"泳法切替に時間がかかる", constraint:"task", constraintLabel:"動作順序", equipment:["marker"], setup:"切替5m手前に予告マーカー、切替地点に色マーカーを置く。", instructions:["早めに準備する方法と、地点で一気に変える方法を行う。","切替後の速度を本人が比べる。"], cue:"次の泳法の準備を早める方法と地点で変える方法を比べよう。", success:["二つの準備方法を行い、切替後5mの速度が保ちやすい方法を説明できる。"], observation:"準備開始地点と、切替後の最初の二動作を見る。", easier:"一つの切替だけで二条件を比べる。", harder:"三つの切替で方法を使い分ける。", noEquipment:"底のラインを予告地点にする。", largeGroup:"切替ごとに担当を置き、泳者は条件を選ぶ。", transfer:"60m個人メドレーで切替準備を自分で調整する。", variability:"medium", order:"alternate", cueStyle:"question", feedback:"summary" },
  { id:"learn-adv-explore-route", level:"advanced", direction:"explore", title:"壁蹴りの軌道と浮上地点を比べる", summary:"壁をまっすぐ蹴る方法と斜めに蹴る方法で、狙った浮上地点へ出やすい軌道を比べる。", domain:"壁蹴り", goal:"adapt", observed:"壁を蹴っても進まない", constraint:"environment", constraintLabel:"壁を蹴る向き", equipment:["wall", "marker"], setup:"壁から5mと8mの底ラインを目安にし、中央と左右へ安全に浮上できる範囲を確認する。", instructions:["壁をまっすぐ蹴り、腕を耳の横へ伸ばして5m付近で浮上する。","次は足の向きを少し変えて蹴り、同じ距離で浮上地点と姿勢を比べる。"], cue:"壁をどちらへ蹴ると、狙った場所へ姿勢を保って出やすい？", success:["二つの蹴る向きを行い、狙った浮上地点に近づきやすい軌道を説明できる。"], observation:"壁を蹴る足の向き、身体の軸、浮上直前の姿勢を見る。", easier:"まっすぐ蹴る方法だけを行い、5mで浮上する。", harder:"蹴る向きを本人が選び、二本目で修正する。", noEquipment:"底のラインと指導者の手で浮上地点を示す。", largeGroup:"中央・左・右の目安ごとに列を分けて一巡する。", transfer:"スタートやターンの後、空いたコースの中央へ姿勢を向けて再出発する。", variability:"wide", order:"natural", cueStyle:"question", feedback:"selfEvaluationFirst" },
  { id:"learn-adv-explore-fatigue", level:"advanced", direction:"explore", title:"疲れた後の泳ぎ方を選び直す", summary:"疲れていない時と疲れた後で、呼吸・テンポ・距離の組合せを選び直す。", domain:"連続泳", goal:"adapt", observed:"疲れると動きが小さくなる", constraint:"individual", constraintLabel:"疲れ", equipment:["marker"], setup:"10m区間を三つ作り、各区間後に立って感想を言える。", instructions:["一つ目は余裕ある方法、二つ目はテンポを変える方法で泳ぐ。","三つ目は本人が最も続けやすい組合せを選ぶ。"], cue:"疲れた後に、呼吸・テンポ・距離のどれを変える？", success:["疲れた後に方法を一つ選び直し、三つ目の10mを姿勢を保って進める。"], observation:"疲れた後の呼吸頻度と、選択が開始までに要する時間を見る。", easier:"区間を二つにし、変える要素を一つにする。", harder:"50m後半で二要素を同時に変える。", noEquipment:"底のラインで区間を示す。", largeGroup:"区間ごとにスタートをずらし、感想を言う時間を確保する。", transfer:"長距離・大会時に疲れのサインから泳ぎ方を調整する。", variability:"wide", order:"participantChoice", cueStyle:"bodySensation", feedback:"selfEvaluationFirst" },
  // 上級: 実場面
  { id:"learn-adv-transfer-60m", level:"advanced", direction:"transfer", title:"四泳法で60m個人メドレー", summary:"四泳法と三つの切替を、止まらず60mへつなぐ。", domain:"60m個人メドレー", goal:"transfer", observed:"泳法切替に時間がかかる", constraint:"task", constraintLabel:"距離", equipment:["marker"], setup:"15mごとの泳法マーカーと、各切替の安全確認地点を用意する。", instructions:["開始前に各切替の合図を本人が決める。","60mを泳ぎ、切替後も最初の二動作を続ける。"], cue:"各切替で次の泳法に変え、止まらず60mを泳ごう。", success:["四泳法を規定の順で切り替え、途中で立たず60mを完了できる。"], observation:"各切替の停止時間と、最後の15mの姿勢を記録する。", easier:"各区間を10mにして40mで行う。", harder:"合図を直前にし、二本目で切替準備を変える。", noEquipment:"底のラインを15m地点の目安にする。", largeGroup:"各泳法のスタートをずらし、一方向で60mを運用する。", transfer:"進級テストや記録会の個人メドレーで自分の準備を使う。", variability:"narrow", order:"preAnnounced", cueStyle:"externalFar", feedback:"summary" },
  { id:"learn-adv-transfer-race", level:"advanced", direction:"transfer", title:"隣の泳者とレース判断", summary:"隣の位置を手がかりに、速度と呼吸を調整して25mを泳ぐ。", domain:"クロール", goal:"adapt", observed:"疲れると動きが小さくなる", constraint:"environment", constraintLabel:"隣の泳者", equipment:["marker"], setup:"隣レーンに速度の異なる泳者を置き、25mの終点を示す。", instructions:["開始前に自分の呼吸側と速度を決める。","隣の位置が変わっても、25mの方法を保つか一度調整する。"], cue:"隣の位置を見ても、自分の呼吸と姿勢を保とう。", success:["隣の位置が変化しても、呼吸と姿勢を一度も崩さず25mを完了する。"], observation:"隣を確認した直後のストロークと呼吸側を見る。", easier:"隣の泳者を置かず、目印だけで行う。", harder:"隣の速度を途中で変え、調整理由を言う。", noEquipment:"レーンラインを隣との境界として使う。", largeGroup:"複数レーンを一方向にし、間隔を一定に保つ。", transfer:"記録会や集団練習で周囲を見ながら自分の泳ぎを選ぶ。", variability:"medium", order:"natural", cueStyle:"question", feedback:"onRequest" },
  { id:"learn-adv-transfer-finish", level:"advanced", direction:"transfer", title:"最後の呼吸後に壁へタッチ", summary:"最後の呼吸を選び、速度を保ったまま壁へタッチする。", domain:"壁への接近", goal:"accuracy", observed:"壁で完全に止まる", constraint:"task", constraintLabel:"最後の呼吸", equipment:["wall", "marker"], setup:"壁から5mにマーカー、タッチ位置を明示し、25mの泳ぎの終点にする。", instructions:["マーカー前で最後の呼吸を終える位置を選ぶ。","頭を上げず、腕のリズムを保って壁に触れる。"], cue:"最後の呼吸を終えたら、頭を上げずに壁へ触れよう。", success:["選んだ位置で最後の呼吸を終え、速度を落とさず壁に触れられる。"], observation:"マーカー後のストローク数、頭の上がり、タッチ時の速度を見る。", easier:"壁から3mで行い、終点を大きく表示する。", harder:"疲れた後の50mの最後5mで行う。", noEquipment:"底のラインで最後5mを見積もる。", largeGroup:"25mごとにスタートをずらし、壁際の安全間隔を守る。", transfer:"記録会のフィニッシュで最後の呼吸とタッチ判断を使う。", variability:"narrow", order:"preAnnounced", cueStyle:"externalFar", feedback:"resultOnly" },
  { id:"learn-adv-transfer-switch", level:"advanced", direction:"transfer", title:"壁で2回泳法を切り替えて30mつなぐ", summary:"10mずつの三区間で、壁で一度、途中で一度泳法を切り替え、30mをつなぐ。", domain:"泳法切替", goal:"transfer", observed:"泳法切替に時間がかかる", constraint:"environment", constraintLabel:"合図のタイミング", equipment:["wall", "marker"], setup:"壁から10mの底ラインを開始目印にし、指導者の手サインで次の泳法を二回伝えられるようにする。", instructions:["最初の10mを選んだ泳法で壁まで進み、タッチして足を置く。","1回目の手サインの泳法へ切り替えて壁を蹴り、10m進む。2回目の手サインで泳法を変え、さらに10m進んで合計30mにする。"], cue:"壁で一度、途中で一度、手サインの泳法へ切り替えて30mをつなごう。", success:["30mの中で二回の泳法変更に対応し、壁でのタッチ・足を置く・壁蹴り・次の泳法の開始を止まらずつなげられる。"], observation:"二回の手サインを見てからの選択、タッチ後の足の位置、壁を蹴った直後の姿勢を見る。", easier:"泳法の変更を一回にし、先に次の泳法を伝える。", harder:"1回目の手サインを壁の直前に出し、二本目で変更順を変える。", noEquipment:"壁、底のライン、指導者の手サインを使う。", largeGroup:"泳法ごとにスタートをずらし、壁付近の間隔を守る。", transfer:"実際の練習で、壁で泳法や方向が変わっても落ち着いて再出発する。", variability:"wide", order:"lastSecond", cueStyle:"question", feedback:"selfEvaluationFirst" },
];

export const learnToSwimTasks: TaskTemplate[] = specs.map(common);
