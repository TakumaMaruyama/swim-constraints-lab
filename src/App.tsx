import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  FlaskConical,
  Gauge,
  RotateCcw,
  Shuffle,
  Users,
  Waves,
  Wrench,
} from "lucide-react";
import { DetailsPanel } from "./components/DetailsPanel";
import { LessonBuilder } from "./components/LessonBuilder";
import { MultiChoiceChips, SingleChoiceChips } from "./components/ChoiceChips";
import { ReferencesView } from "./components/ReferencesView";
import { TaskCard } from "./components/TaskCard";
import { evidenceSources } from "./data/evidenceSources";
import { getAvailableObservedTagOptions, getAvailablePhaseOrDomainOptions } from "./data/formOptions";
import {
  competitiveLevels,
  competitivePhases,
  equipmentOptions,
  goals,
  learnDomains,
  learnLevels,
  modes,
} from "./data/options";
import { adjustTask, matchTasks } from "./engine";
import type {
  AdjustmentAction,
  EquipmentId,
  GoalId,
  MatchDetails,
  MatchInput,
  Mode,
  RelaxationStep,
  TargetLevel,
} from "./types";

type View = "mode" | "form" | "results" | "references" | "lesson";

interface FormState {
  mode?: Mode;
  goal?: GoalId;
  phaseOrDomain?: string;
  observedTag?: string;
  level?: TargetLevel;
  equipment: EquipmentId[];
  details: MatchDetails;
}

const emptyDetails: MatchDetails = {
  currentStates: [],
  individualConstraints: [],
  taskConstraints: [],
  environmentConstraints: [],
  implementationConditions: [],
  specificConditions: [],
};

const initialForm: FormState = {
  equipment: ["none"],
  details: emptyDetails,
};

const actionButtons: Array<{ action: AdjustmentAction; label: string; icon: typeof Gauge }> = [
  { action: "easier", label: "距離・回数を減らす", icon: Gauge },
  { action: "harder", label: "速さ・距離・合図のどれかを難しくする", icon: Gauge },
  { action: "noEquipment", label: "用具なしにする", icon: Wrench },
  { action: "largeGroup", label: "大人数で行う", icon: Users },
  { action: "changeCue", label: "声かけを変える", icon: Waves },
  { action: "moreExplore", label: "2つのやり方を比べる", icon: FlaskConical },
  { action: "moreTransfer", label: "壁・合図・周りの人を1つ加える", icon: ChevronRight },
];

const relaxationLabels: Record<RelaxationStep, string> = {
  cuePreference: "声のかけ方",
  feedback: "試した後の伝え方",
  variabilityPreference: "条件の変え方・伝える順番",
  equipmentPreference: "あれば使いたい用具",
  detailPreferences: "追加で選んだこと",
};

function modeLabel(mode?: Mode) {
  return modes.find(({ value }) => value === mode)?.label ?? "未選択";
}

function phaseLabel(mode: Mode | undefined, value?: string) {
  if (!value) return "未選択";
  const options = mode === "competitive" ? competitivePhases : learnDomains;
  return options.find((option) => option.value === value)?.label ?? value;
}

function levelLabel(mode: Mode | undefined, value?: string) {
  if (!value) return "未選択";
  const options = mode === "competitive" ? competitiveLevels : learnLevels;
  return options.find((option) => option.value === value)?.label ?? value;
}

function App() {
  const [view, setView] = useState<View>("mode");
  const [lessonStarted, setLessonStarted] = useState(false);
  const [returnView, setReturnView] = useState<View>("mode");
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [alternativeIndex, setAlternativeIndex] = useState(0);
  const [adjustments, setAdjustments] = useState<AdjustmentAction[]>([]);
  const [alternativeStatus, setAlternativeStatus] = useState("");
  const [adjustmentStatus, setAdjustmentStatus] = useState("");

  const matchInput = useMemo<MatchInput | undefined>(() => {
    if (!form.mode || !form.goal || !form.phaseOrDomain || !form.observedTag || !form.level || form.equipment.length === 0) {
      return undefined;
    }
    return {
      mode: form.mode,
      goal: form.goal,
      phaseOrDomain: form.phaseOrDomain,
      observedTag: form.observedTag,
      level: form.level,
      equipment: form.equipment,
      details: form.details,
    };
  }, [form]);

  const result = useMemo(
    () => matchInput ? matchTasks(matchInput, alternativeIndex) : undefined,
    [matchInput, alternativeIndex],
  );

  const phaseOrDomainOptions = useMemo(
    () => form.mode ? getAvailablePhaseOrDomainOptions(form.mode, form.level) : [],
    [form.mode, form.level],
  );

  const observedOptions = useMemo(
    () => form.mode ? getAvailableObservedTagOptions(form.mode, form.level, form.phaseOrDomain) : [],
    [form.mode, form.level, form.phaseOrDomain],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  const resetAll = () => {
    setForm(initialForm);
    setErrors([]);
    setAlternativeIndex(0);
    setAdjustments([]);
    setAlternativeStatus("");
    setAdjustmentStatus("");
    setView("mode");
  };

  const chooseMode = (mode: Mode) => {
    setForm({ ...initialForm, mode, details: { ...emptyDetails } });
    setErrors([]);
    setAlternativeIndex(0);
    setAdjustments([]);
    setAlternativeStatus("");
    setAdjustmentStatus("");
    setView("form");
  };

  const toggleEquipment = (value: string) => {
    const equipment = value as EquipmentId;
    setForm((current) => {
      if (equipment === "none") return { ...current, equipment: ["none"] };
      const withoutNone = current.equipment.filter((item) => item !== "none");
      const next = withoutNone.includes(equipment)
        ? withoutNone.filter((item) => item !== equipment)
        : [...withoutNone, equipment];
      return { ...current, equipment: next.length > 0 ? next : ["none"] };
    });
  };

  const changePhaseOrDomain = (phaseOrDomain: string) => {
    setForm((current) => ({
      ...current,
      phaseOrDomain: phaseOrDomain || undefined,
      observedTag: undefined,
      details: { ...current.details, specificConditions: [] },
    }));
  };

  const changeLevel = (level: TargetLevel) => {
    setForm((current) => ({
      ...current,
      level,
      phaseOrDomain: undefined,
      observedTag: undefined,
      details: { ...current.details, specificConditions: [] },
    }));
    setAlternativeIndex(0);
    setAdjustments([]);
    setAlternativeStatus("");
    setAdjustmentStatus("");
  };

  const validateAndShowResults = () => {
    const nextErrors: string[] = [];
    let firstId = "";
    const add = (id: string, message: string) => {
      if (!firstId) firstId = id;
      nextErrors.push(message);
    };
    if (!form.level) add("level-field", "今の練習段階を選んでください。");
    if (!form.goal) add("goal", "今日の狙いを選んでください。");
    if (!form.phaseOrDomain) add("phase", form.mode === "competitive" ? "練習する場面を選んでください。" : "練習する内容を選んでください。");
    if (!form.observedTag) add("observed", "今、どんな泳ぎになっているか選んでください。");
    if (form.equipment.length === 0) add("equipment-field", "今日使える用具を選んでください。");
    setErrors(nextErrors);
    if (nextErrors.length > 0) {
      document.getElementById(firstId)?.focus();
      return;
    }
    setAlternativeIndex(0);
    setAdjustments([]);
    setAlternativeStatus("");
    setAdjustmentStatus("");
    setView("results");
  };

  const showReferences = () => {
    setReturnView(view);
    setView("references");
  };

  const applyAdjustment = (action: AdjustmentAction) => {
    setAdjustments((current) => {
      const withoutOpposite = action === "easier"
        ? current.filter((item) => item !== "harder" && item !== "easier")
        : action === "harder"
          ? current.filter((item) => item !== "easier" && item !== "harder")
          : current.filter((item) => item !== action);
      return [...withoutOpposite, action];
    });
    const label = actionButtons.find((button) => button.action === action)?.label ?? "選んだ変更";
    setAdjustmentStatus(`「${label}」を3つの練習に反映しました。各カードの緑の枠で、変わった内容を確認できます。`);
  };

  const showAlternative = () => {
    if (!result || result.alternativeCount < 2) return;
    const nextNumber = ((result.selectedAlternative + 1) % result.alternativeCount) + 1;
    setAlternativeIndex((current) => current + 1);
    setAdjustments([]);
    setAlternativeStatus(`別の3つの練習に入れ替えました（${nextNumber}/${result.alternativeCount}）`);
    setAdjustmentStatus("");
  };

  return (
    <div className={`app-frame${view === "lesson" ? " app-frame--lesson" : ""}`}>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <header className="app-header" hidden={view === "references"}>
        <button type="button" className="brand-button" onClick={resetAll} aria-label="最初の画面へ戻る">
          <span className="brand-mark"><Waves aria-hidden="true" /></span>
          <span><strong>Swim Constraints Lab</strong><small>今の泳ぎから練習を選ぶ</small></span>
        </button>
        <button type="button" className="header-link" onClick={showReferences}>
          <BookOpen size={18} aria-hidden="true" /> 参考資料
        </button>
      </header>

      {view === "mode" ? (
        <main className="page-shell mode-page" id="main-content">
          <p className="section-kicker">練習選び</p>
          <h1>いまの泳ぎを見て、<br />次の練習を選ぶ。</h1>
          <p className="lead">選手・子どもの今の様子を選ぶと、今日すぐ試せる練習を3つ表示します。</p>
          <div className="principle-note">
            <FlaskConical aria-hidden="true" />
            <p><strong>AIは使用しません。</strong>アプリが診断するのではなく、指導者が泳ぎを見ながら練習を選ぶための参考案です。</p>
          </div>
          <h2 className="mode-heading">どちらの場面で使いますか？</h2>
          <div className="mode-grid">
            {modes.map((mode) => (
              <button type="button" className={`mode-card mode-card--${mode.value}`} onClick={() => chooseMode(mode.value)} key={mode.value}>
                <span>{mode.value === "competitive" ? <Gauge aria-hidden="true" /> : <Waves aria-hidden="true" />}</span>
                <strong>{mode.label}</strong>
                <small>{mode.description}</small>
                <em>選択する <ChevronRight size={18} aria-hidden="true" /></em>
              </button>
            ))}
          </div>
          <section className="lesson-entry">
            <div><h2>スタッフ用のレッスン作成</h2><p>人数・レベル・時間・狙いから、1回分のレッスンを組み立てて印刷できます。</p></div>
            <button type="button" className="primary-button" onClick={() => { setLessonStarted(true); setView("lesson"); }}>レッスンを組み立てる</button>
          </section>
          <p className="draft-callout">収録した練習はすべて監修前の下書きです。最後は現場の指導者が判断してください。</p>
        </main>
      ) : null}

      {view === "form" && form.mode ? (
        <main className="page-shell form-page" id="main-content">
          <div className="selection-strip" aria-label="現在の選択">
            <span>{modeLabel(form.mode)}</span>
            {form.phaseOrDomain ? <span>{phaseLabel(form.mode, form.phaseOrDomain)}</span> : null}
            {form.level ? <span>{levelLabel(form.mode, form.level)}</span> : null}
          </div>
          <button type="button" className="text-button" onClick={() => setView("mode")}>
            <ArrowLeft size={18} aria-hidden="true" /> モードを選び直す
          </button>
          <p className="section-kicker">基本の5項目</p>
          <h1>今日の練習について教えてください</h1>
          <p className="lead">まず5項目を選びます。必要な時だけ、追加の項目を選べます。</p>

          {errors.length > 0 ? (
            <div className="error-summary" role="alert" aria-live="assertive">
              <strong>入力を確認してください</strong>
              <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
            </div>
          ) : null}

          <div className="form-card">
            <div id="level-field" tabIndex={-1}>
              <SingleChoiceChips
                legend="1 今の練習段階（必須）"
                options={form.mode === "competitive" ? competitiveLevels : learnLevels}
                selected={form.level}
                onChange={(value) => changeLevel(value as TargetLevel)}
              />
            </div>

            <label className="select-field" htmlFor="goal">
              <span><b>2</b> 今日の狙い <em>必須</em></span>
              <select id="goal" value={form.goal ?? ""} onChange={(event) => setForm({ ...form, goal: event.target.value as GoalId })}>
                <option value="">選んでください</option>
                {goals.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>

            <label className="select-field" htmlFor="phase">
              <span><b>3</b> {form.mode === "competitive" ? "どの場面を練習しますか？" : "何を練習しますか？"} <em>必須</em></span>
              <select
                id="phase"
                value={form.phaseOrDomain ?? ""}
                disabled={!form.level}
                onChange={(event) => changePhaseOrDomain(event.target.value)}
              >
                <option value="">{form.level ? "選んでください" : "先に練習段階を選んでください"}</option>
                {phaseOrDomainOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>

            <label className="select-field" htmlFor="observed">
              <span><b>4</b> 今、どんな泳ぎになっていますか？ <em>必須</em></span>
              <select
                id="observed"
                value={form.observedTag ?? ""}
                disabled={!form.level || !form.phaseOrDomain}
                onChange={(event) => setForm({ ...form, observedTag: event.target.value })}
              >
                <option value="">
                  {!form.phaseOrDomain
                    ? `先に${form.mode === "competitive" ? "練習する場面" : "練習内容"}を選んでください`
                    : "今見えていることを選んでください"}
                </option>
                {observedOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>

            <div id="equipment-field" tabIndex={-1}>
              <MultiChoiceChips
                legend="5 今日使える用具（必須・複数可）"
                options={equipmentOptions}
                selected={form.equipment}
                onToggle={toggleEquipment}
              />
            </div>
          </div>

          <DetailsPanel
            mode={form.mode}
            phaseOrDomain={form.phaseOrDomain}
            value={form.details}
            onChange={(details) => setForm({ ...form, details })}
          />

          <div className="sticky-action-spacer" />
          <div className="sticky-action">
            <button type="button" className="primary-button" onClick={validateAndShowResults}>
              3つの練習を見る <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </main>
      ) : null}

      {view === "results" && matchInput && result ? (
        <main className="page-shell results-page" id="main-content">
          <div className="selection-strip" aria-label="選択した条件">
            <span>{modeLabel(matchInput.mode)}</span>
            <span>{phaseLabel(matchInput.mode, matchInput.phaseOrDomain)}</span>
            <span>{levelLabel(matchInput.mode, matchInput.level)}</span>
          </div>
          <p className="section-kicker">3つの練習</p>
          <h1>今日試す3つの練習</h1>
          <p className="lead">「まずできるようにする」「やり方を比べる」「レースや普段の泳ぎで試す」の3つです。</p>

          {result.relaxationSteps.length > 0 ? (
            <div className="relaxation-note" role="status">
              合う練習が少なかったため、次の希望は外して選びました：{result.relaxationSteps.map((step) => relaxationLabels[step]).join("、")}
            </div>
          ) : null}

          {result.cards.length === 3 ? (
            <section className="alternative-panel" aria-label="別の練習を表示">
              <div>
                <strong>この3つが合わないとき</strong>
                <span>入力した条件は変えず、別の組み合わせを表示します。</span>
              </div>
              {result.alternativeCount > 1 ? (
                <button type="button" className="secondary-button" onClick={showAlternative}>
                  <Shuffle size={19} aria-hidden="true" /> 別の3つの練習に入れ替える
                </button>
              ) : (
                <p>この条件で表示できる練習は、この3つです。</p>
              )}
              <p className="alternative-status" role="status" aria-live="polite">{alternativeStatus}</p>
            </section>
          ) : null}

          {result.cards.length === 3 ? (
            <div className="results-list" id="result-cards">
              {result.cards.map((template) => {
                const card = adjustTask(template, adjustments, matchInput.equipment);
                return (
                  <TaskCard
                    key={`${template.id}-${adjustments.join("-")}`}
                    card={card}
                    selectedObservedTag={matchInput.observedTag}
                    evidence={evidenceSources.filter((source) => template.evidenceIds.includes(source.id))}
                  />
                );
              })}
            </div>
          ) : (
            <section className="empty-state">
              <h2>条件に合う3つの練習が見つかりませんでした</h2>
              <p>今日使える用具を追加するか、「必要なら、もう少し細かく選ぶ」で選んだ項目を減らしてください。</p>
              <button type="button" className="primary-button" onClick={() => setView("form")}>入力へ戻る</button>
            </section>
          )}

          <section className="adjustment-panel" aria-labelledby="adjustment-heading">
            <p className="section-kicker">練習を調整</p>
            <h2 id="adjustment-heading">人数や用具に合わせて練習を変える</h2>
            <div className="action-grid">
              {actionButtons.map(({ action, label, icon: Icon }) => (
                <button type="button" className="action-button" onClick={() => applyAdjustment(action)} key={action}>
                  <Icon size={19} aria-hidden="true" /> {label}
                  {adjustments.includes(action) ? <Check size={16} aria-label="適用中" /> : null}
                </button>
              ))}
            </div>
            {adjustmentStatus ? (
              <div className="adjustment-status" role="status" aria-live="polite">
                <Check size={18} aria-hidden="true" />
                <span>{adjustmentStatus}</span>
                <a href="#result-cards">変更後のカードを見る</a>
              </div>
            ) : null}
          </section>

          <div className="result-footer-actions">
            <button type="button" className="secondary-button" onClick={() => setView("form")}><ArrowLeft size={18} aria-hidden="true" /> 入力へ戻る</button>
            <button type="button" className="text-button" onClick={resetAll}><RotateCcw size={18} aria-hidden="true" /> 最初からやり直す</button>
          </div>
        </main>
      ) : null}

      {lessonStarted ? <LessonBuilder active={view === "lesson"} onBack={() => setView("mode")} /> : null}
      {view === "references" ? <ReferencesView sources={evidenceSources} onBack={() => setView(returnView)} /> : null}

      <footer className="app-footer" hidden={view === "references"}>
        <p>監修前の案 · AI・外部API不使用 · 診断や唯一の正解を提示しません</p>
      </footer>
    </div>
  );
}

export default App;
