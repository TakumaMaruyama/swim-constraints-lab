import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  FlaskConical,
  Gauge,
  RefreshCcw,
  RotateCcw,
  Users,
  Waves,
  Wrench,
} from "lucide-react";
import { DetailsPanel } from "./components/DetailsPanel";
import { MultiChoiceChips, SingleChoiceChips } from "./components/ChoiceChips";
import { ReferencesView } from "./components/ReferencesView";
import { TaskCard } from "./components/TaskCard";
import { evidenceSources } from "./data/evidenceSources";
import {
  competitiveLevels,
  competitiveObservedTags,
  competitivePhases,
  equipmentLabels,
  equipmentOptions,
  goalLabels,
  goals,
  learnDomains,
  learnLevels,
  learnObservedTags,
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

type View = "mode" | "form" | "confirm" | "results" | "references";

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
  { action: "easier", label: "易しくする", icon: Gauge },
  { action: "harder", label: "難しくする", icon: Gauge },
  { action: "noEquipment", label: "用具なしにする", icon: Wrench },
  { action: "largeGroup", label: "人数が多い場合", icon: Users },
  { action: "changeCue", label: "声かけを変える", icon: Waves },
  { action: "moreExplore", label: "探索を増やす", icon: FlaskConical },
  { action: "moreTransfer", label: "実場面へ近づける", icon: ChevronRight },
];

const relaxationLabels: Record<RelaxationStep, string> = {
  cuePreference: "声かけ",
  feedback: "フィードバック",
  variabilityPreference: "変動量・提示順",
  equipmentPreference: "任意用具の一致",
  detailPreferences: "その他の詳細条件",
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
  const [returnView, setReturnView] = useState<View>("mode");
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [alternativeIndex, setAlternativeIndex] = useState(0);
  const [adjustments, setAdjustments] = useState<AdjustmentAction[]>([]);

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  const resetAll = () => {
    setForm(initialForm);
    setErrors([]);
    setAlternativeIndex(0);
    setAdjustments([]);
    setView("mode");
  };

  const chooseMode = (mode: Mode) => {
    setForm({ ...initialForm, mode, details: { ...emptyDetails } });
    setErrors([]);
    setAlternativeIndex(0);
    setAdjustments([]);
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

  const validateAndConfirm = () => {
    const nextErrors: string[] = [];
    let firstId = "";
    const add = (id: string, message: string) => {
      if (!firstId) firstId = id;
      nextErrors.push(message);
    };
    if (!form.goal) add("goal", "今日の狙いを選んでください。");
    if (!form.phaseOrDomain) add("phase", "対象局面または技能領域を選んでください。");
    if (!form.observedTag) add("observed", "現在起きていることを選んでください。");
    if (!form.level) add("level-field", "対象レベルを選んでください。");
    if (form.equipment.length === 0) add("equipment-field", "使用できる用具を選んでください。");
    setErrors(nextErrors);
    if (nextErrors.length > 0) {
      document.getElementById(firstId)?.focus();
      return;
    }
    setView("confirm");
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
  };

  if (view === "references") {
    return <ReferencesView sources={evidenceSources} onBack={() => setView(returnView)} />;
  }

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <header className="app-header">
        <button type="button" className="brand-button" onClick={resetAll} aria-label="最初の画面へ戻る">
          <span className="brand-mark"><Waves aria-hidden="true" /></span>
          <span><strong>Swim Constraints Lab</strong><small>観察から課題を選ぶ</small></span>
        </button>
        <button type="button" className="header-link" onClick={showReferences}>
          <BookOpen size={18} aria-hidden="true" /> 参考資料
        </button>
      </header>

      {view === "mode" ? (
        <main className="page-shell mode-page" id="main-content">
          <p className="section-kicker">Constraint-led practice ideas</p>
          <h1>動きを決めつけず、<br />試す条件を設計する。</h1>
          <p className="lead">観察された事実と今日の狙いから、成立・探索・実場面の3方向を静的データで提示します。</p>
          <div className="principle-note">
            <FlaskConical aria-hidden="true" />
            <p><strong>AIは使用しません。</strong>診断や唯一の正解ではなく、「この条件で何が起きるか」を観察するためのヒントです。</p>
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
          <p className="draft-callout">収録課題はすべて監修前ドラフトです。専門コーチの判断を置き換えません。</p>
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
          <p className="section-kicker">Basic conditions</p>
          <h1>今日の条件を選ぶ</h1>
          <p className="lead">まず6項目だけ。細かな条件は必要なときに追加できます。</p>

          {errors.length > 0 ? (
            <div className="error-summary" role="alert" aria-live="assertive">
              <strong>入力を確認してください</strong>
              <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
            </div>
          ) : null}

          <div className="form-card">
            <label className="select-field" htmlFor="goal">
              <span><b>1</b> 今日の狙い <em>必須</em></span>
              <select id="goal" value={form.goal ?? ""} onChange={(event) => setForm({ ...form, goal: event.target.value as GoalId })}>
                <option value="">選んでください</option>
                {goals.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>

            <label className="select-field" htmlFor="phase">
              <span><b>2</b> {form.mode === "competitive" ? "対象局面" : "技能領域"} <em>必須</em></span>
              <select id="phase" value={form.phaseOrDomain ?? ""} onChange={(event) => setForm({ ...form, phaseOrDomain: event.target.value })}>
                <option value="">選んでください</option>
                {(form.mode === "competitive" ? competitivePhases : learnDomains).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>

            <label className="select-field" htmlFor="observed">
              <span><b>3</b> 現在起きていること <em>必須</em></span>
              <select id="observed" value={form.observedTag ?? ""} onChange={(event) => setForm({ ...form, observedTag: event.target.value })}>
                <option value="">観察した事実を選んでください</option>
                {(form.mode === "competitive" ? competitiveObservedTags : learnObservedTags).map((label) => <option value={label} key={label}>{label}</option>)}
              </select>
            </label>

            <div id="level-field" tabIndex={-1}>
              <SingleChoiceChips
                legend="4 対象レベル（必須）"
                options={form.mode === "competitive" ? competitiveLevels : learnLevels}
                selected={form.level}
                onChange={(value) => setForm({ ...form, level: value as TargetLevel })}
              />
            </div>

            <div id="equipment-field" tabIndex={-1}>
              <MultiChoiceChips
                legend="5 使用できる用具（必須・複数可）"
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
            <button type="button" className="primary-button" onClick={validateAndConfirm}>
              条件を確認する <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </main>
      ) : null}

      {view === "confirm" && matchInput ? (
        <main className="page-shell confirm-page" id="main-content">
          <button type="button" className="text-button" onClick={() => setView("form")}>
            <ArrowLeft size={18} aria-hidden="true" /> 条件入力へ戻る
          </button>
          <p className="section-kicker">Review</p>
          <h1>選択条件の確認</h1>
          <p className="lead">この条件から、異なる3方向のヒントを選びます。</p>
          <dl className="summary-card">
            <div><dt>モード</dt><dd>{modeLabel(matchInput.mode)}</dd></div>
            <div><dt>今日の狙い</dt><dd>{goalLabels[matchInput.goal]}</dd></div>
            <div><dt>局面・技能領域</dt><dd>{phaseLabel(matchInput.mode, matchInput.phaseOrDomain)}</dd></div>
            <div><dt>観察事実</dt><dd>{matchInput.observedTag}</dd></div>
            <div><dt>対象レベル</dt><dd>{levelLabel(matchInput.mode, matchInput.level)}</dd></div>
            <div><dt>使用できる用具</dt><dd>{matchInput.equipment.map((item) => equipmentLabels[item]).join("・")}</dd></div>
            <div><dt>追加した詳細条件</dt><dd>{Object.values(matchInput.details).filter((value) => Array.isArray(value) ? value.length > 0 : Boolean(value)).length}項目</dd></div>
          </dl>
          <div className="confirm-actions">
            <button type="button" className="secondary-button" onClick={() => setView("form")}>条件を編集</button>
            <button type="button" className="primary-button" onClick={() => setView("results")}>
              ヒントを表示 <ChevronRight size={20} aria-hidden="true" />
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
          <p className="section-kicker">Three directions</p>
          <h1>今日試せる3つの方向</h1>
          <p className="lead">同じ観察事実に対して、成立・探索・実場面を1枚ずつ選びました。</p>

          {result.relaxationSteps.length > 0 ? (
            <div className="relaxation-note" role="status">
              条件を一部緩めています：{result.relaxationSteps.map((step) => relaxationLabels[step]).join("、")}
            </div>
          ) : null}

          {result.cards.length === 3 ? (
            <div className="results-list">
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
              <h2>一致する3方向が見つかりませんでした</h2>
              <p>モードと局面・技能領域は固定したまま、使用できる用具を追加するか、詳細条件を一部外してください。</p>
              <button type="button" className="primary-button" onClick={() => setView("form")}>条件入力へ戻る</button>
            </section>
          )}

          <section className="adjustment-panel" aria-labelledby="adjustment-heading">
            <p className="section-kicker">Adjust without AI</p>
            <h2 id="adjustment-heading">条件を変えてもう一度見る</h2>
            <div className="action-grid">
              <button
                type="button"
                className="action-button action-button--wide"
                onClick={() => { setAlternativeIndex((current) => current + 1); setAdjustments([]); }}
              >
                <RefreshCcw size={19} aria-hidden="true" /> 同じ条件で別案
              </button>
              {actionButtons.map(({ action, label, icon: Icon }) => (
                <button type="button" className="action-button" onClick={() => applyAdjustment(action)} key={action}>
                  <Icon size={19} aria-hidden="true" /> {label}
                  {adjustments.includes(action) ? <Check size={16} aria-label="適用中" /> : null}
                </button>
              ))}
            </div>
          </section>

          <div className="result-footer-actions">
            <button type="button" className="secondary-button" onClick={() => setView("form")}><ArrowLeft size={18} aria-hidden="true" /> 条件入力へ戻る</button>
            <button type="button" className="text-button" onClick={resetAll}><RotateCcw size={18} aria-hidden="true" /> 最初からやり直す</button>
          </div>
        </main>
      ) : null}

      <footer className="app-footer">
        <p>監修前ドラフト · AI・外部API不使用 · 診断や唯一の正解を提示しません</p>
      </footer>
    </div>
  );
}

export default App;
