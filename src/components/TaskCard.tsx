import { Anchor, ArrowRight, CheckCircle2, ExternalLink, Shuffle } from "lucide-react";
import { evidenceCategoryLabels } from "../data/evidenceSources";
import { cueOptions, detailOptionLabels, equipmentFunctionLabels, equipmentLabels, feedbackOptions, observedTagLabels, presentationOptions, variabilityOptions } from "../data/options";
import type { CardDirection, EvidenceSource, RenderedTaskCard } from "../types";

const directionLabels: Record<CardDirection, string> = {
  establish: "まずできるようにする",
  explore: "やり方を比べる",
  transfer: "レース・普段の泳ぎで試す",
};

const directionIcons = {
  establish: CheckCircle2,
  explore: Shuffle,
  transfer: ArrowRight,
};

function InlineList({ items }: { items: string[] }) {
  if (items.length === 0) return <span>なし</span>;
  return (
    <ul className="inline-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

interface TaskCardProps {
  card: RenderedTaskCard;
  selectedObservedTag: string;
  evidence: EvidenceSource[];
}

export function TaskCard({ card, selectedObservedTag, evidence }: TaskCardProps) {
  const DirectionIcon = directionIcons[card.direction];
  const variabilityLabel = variabilityOptions.find(({ value }) => value === card.variabilityLevel)?.label ?? card.variabilityLevel;
  const presentationLabel = presentationOptions.find(({ value }) => value === card.presentationOrder)?.label ?? card.presentationOrder;
  const cueLabel = cueOptions.find(({ value }) => value === card.cueStyle)?.label ?? card.cueStyle;
  const feedbackLabel = feedbackOptions.find(({ value }) => value === card.feedbackStyle)?.label ?? card.feedbackStyle;
  const adjustmentChanges: Array<{ label: string; value: string }> = [];
  const prescriptionChanged = (Object.keys(card.prescription) as Array<keyof typeof card.prescription>)
    .some((key) => card.prescription[key] !== card.effectivePrescription[key]);
  const addedInstructions = card.effectiveInstructions.slice(card.instructions.length);
  const addedSuccessCriteria = card.effectiveSuccessCriteria.slice(card.successCriteria.length);

  if (prescriptionChanged) {
    adjustmentChanges.push({
      label: "実施量",
      value: `${card.effectivePrescription.oneRep}／${card.effectivePrescription.repetitions}／${card.effectivePrescription.recovery}`,
    });
  }
  if (card.effectiveSetup !== card.setup) {
    adjustmentChanges.push({ label: "準備", value: card.effectiveSetup });
  }
  if (addedInstructions.length > 0) {
    adjustmentChanges.push({ label: "進め方", value: addedInstructions.join(" ") });
  }
  if (card.effectiveParticipantCue !== card.participantCue) {
    adjustmentChanges.push({ label: "声かけ", value: card.effectiveParticipantCue });
  }
  if (addedSuccessCriteria.length > 0) {
    adjustmentChanges.push({ label: "できた目安", value: addedSuccessCriteria.join(" ") });
  }
  if (card.activeAdjustments.some((label) => label.includes("用具なし"))) {
    adjustmentChanges.push({ label: "用具", value: "用具を使わずに行う" });
  }
  if (card.effectiveTransferConnection !== card.transferConnection) {
    adjustmentChanges.push({ label: "実際の場面へのつなげ方", value: card.effectiveTransferConnection });
  }

  return (
    <article className={`task-card task-card--${card.direction}`} data-task-id={card.id}>
      <div className="task-card__eyebrow">
        <span className="direction-label"><DirectionIcon size={18} aria-hidden="true" />{directionLabels[card.direction]}</span>
        <span className="draft-badge">監修前の案</span>
      </div>
      <h2>{card.title}</h2>
      <p className="task-card__outcome"><strong>この練習のねらい</strong>{card.summary}</p>

      {card.activeAdjustments.length > 0 ? (
        <div className="adjustment-badges" aria-label="適用中の変更">
          {card.activeAdjustments.map((label) => <span key={label}>{label}</span>)}
        </div>
      ) : null}

      <section className="practice-prescription" aria-label="実施メニュー">
        <h3>実施メニュー</h3>
        <dl>
          <div><dt>やること</dt><dd>{card.effectivePrescription.activity}</dd></div>
          <div><dt>1回分</dt><dd>{card.effectivePrescription.oneRep}</dd></div>
          <div><dt>回数</dt><dd>{card.effectivePrescription.repetitions}</dd></div>
          <div><dt>休み</dt><dd>{card.effectivePrescription.recovery}</dd></div>
        </dl>
      </section>

      {adjustmentChanges.length > 0 ? (
        <section className="adjustment-changes" aria-label="選んだ変更が反映されたところ">
          <h3>選んだ変更が反映されたところ</h3>
          <dl>
            {adjustmentChanges.map((change) => (
              <div key={`${change.label}-${change.value}`}>
                <dt>{change.label}</dt>
                <dd>{change.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <div className="task-card__quick-grid">
        <div><span>今見えていること</span><strong>{observedTagLabels[selectedObservedTag] ?? selectedObservedTag}</strong></div>
        <div><span>この練習で変えるところ</span><strong>{detailOptionLabels[card.primaryConstraintLabel] ?? card.primaryConstraintLabel}</strong></div>
      </div>

      <div className="cue-panel">
        <Anchor size={20} aria-hidden="true" />
        <div><span>本人に伝える一言</span><strong>{card.effectiveParticipantCue || "声をかけずに試す"}</strong></div>
      </div>

      <section className="success-panel">
        <h3>できたかを見る目安</h3>
        <InlineList items={card.effectiveSuccessCriteria} />
      </section>

      <details className="card-details">
        <summary>練習の進め方・見るポイント</summary>
        <dl>
          <DetailRow label="毎回同じにすること"><InlineList items={card.fixedConditions} /></DetailRow>
          <DetailRow label="準備">{card.effectiveSetup}</DetailRow>
          <DetailRow label="進め方"><InlineList items={card.effectiveInstructions} /></DetailRow>
          <DetailRow label="本人に見て・感じてほしいこと"><InlineList items={card.informationToUse} /></DetailRow>
          <DetailRow label="本人が変えてよいこと"><InlineList items={card.permittedSolutions} /></DetailRow>
          <DetailRow label="本人に選んでもらうこと"><InlineList items={card.participantChoices} /></DetailRow>
          <DetailRow label="指導者が1つだけ見ること">{card.coachObservation}</DetailRow>
          <DetailRow label="何通り試すか">{variabilityLabel}</DetailRow>
          <DetailRow label="やり方を伝えるタイミング">{presentationLabel}</DetailRow>
          <DetailRow label="どんな声をかけるか">{cueLabel}</DetailRow>
          <DetailRow label="試した後にどう伝えるか">{feedbackLabel}</DetailRow>
          <DetailRow label="用具">{card.effectiveEquipment.length > 0 ? card.effectiveEquipment.map((item) => equipmentLabels[item]).join("・") : "なし"}</DetailRow>
          <DetailRow label="用具の役割"><InlineList items={card.effectiveEquipment.map((item) => equipmentFunctionLabels[item])} /></DetailRow>
          <DetailRow label="易しくするには">{card.easier}</DetailRow>
          <DetailRow label="難しくするには">{card.harder}</DetailRow>
          <DetailRow label="用具がない場合">{card.noEquipment}</DetailRow>
          <DetailRow label="大人数で行う場合">{card.largeGroup}</DetailRow>
          <DetailRow label="レース・普段の泳ぎにつなげる">{card.effectiveTransferConnection}</DetailRow>
        </dl>
      </details>

      <details className="evidence-details">
        <summary>この練習の考え方・参考資料</summary>
        <p className="evidence-note">{card.evidenceNote}</p>
        {evidence.map((source) => (
          <section key={source.id} className="evidence-source">
            <span>{evidenceCategoryLabels[source.category]}</span>
            <h3>{source.title}</h3>
            <p>{source.authorsOrOrganisation}{source.year ? `（${source.year}）` : ""}</p>
            <h4>この資料から言えること</h4>
            <InlineList items={source.supports} />
            <h4>この資料だけでは言えないこと</h4>
            <InlineList items={source.doesNotProve} />
            <a href={source.url} target="_blank" rel="noreferrer noopener">
              参考資料を開く <ExternalLink size={15} aria-hidden="true" />
            </a>
          </section>
        ))}
      </details>
    </article>
  );
}
