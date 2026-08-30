import { Anchor, ArrowRight, CheckCircle2, ExternalLink, Shuffle } from "lucide-react";
import { evidenceCategoryLabels } from "../data/evidenceSources";
import { cueOptions, equipmentFunctionLabels, equipmentLabels, feedbackOptions, presentationOptions, variabilityOptions } from "../data/options";
import type { CardDirection, EvidenceSource, RenderedTaskCard } from "../types";

const directionLabels: Record<CardDirection, string> = {
  establish: "まず成立",
  explore: "比べて探索",
  transfer: "実場面へつなぐ",
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

  return (
    <article className={`task-card task-card--${card.direction}`}>
      <div className="task-card__eyebrow">
        <span className="direction-label"><DirectionIcon size={18} aria-hidden="true" />{directionLabels[card.direction]}</span>
        <span className="draft-badge">監修前ドラフト</span>
      </div>
      <h2>{card.title}</h2>
      <p className="task-card__outcome"><strong>起こしたい結果</strong>{card.summary}</p>

      {card.activeAdjustments.length > 0 ? (
        <div className="adjustment-badges" aria-label="適用中の変更">
          {card.activeAdjustments.map((label) => <span key={label}>{label}</span>)}
        </div>
      ) : null}

      <div className="task-card__quick-grid">
        <div><span>観察事実</span><strong>{selectedObservedTag}</strong></div>
        <div><span>主に変える制約</span><strong>{card.primaryConstraintLabel}</strong></div>
        <div><span>推奨</span><strong>{card.effectiveSuggestedDose}</strong></div>
      </div>

      <div className="cue-panel">
        <Anchor size={20} aria-hidden="true" />
        <div><span>選手・子どもへの一言</span><strong>{card.effectiveParticipantCue || "声かけなし"}</strong></div>
      </div>

      <section className="success-panel">
        <h3>成功条件</h3>
        <InlineList items={card.effectiveSuccessCriteria} />
      </section>

      <details className="card-details">
        <summary>課題の詳細を見る</summary>
        <dl>
          <DetailRow label="固定する条件"><InlineList items={card.fixedConditions} /></DetailRow>
          <DetailRow label="セットアップ">{card.effectiveSetup}</DetailRow>
          <DetailRow label="実施方法"><InlineList items={card.effectiveInstructions} /></DetailRow>
          <DetailRow label="本人が利用する情報"><InlineList items={card.informationToUse} /></DetailRow>
          <DetailRow label="許される解決方法"><InlineList items={card.permittedSolutions} /></DetailRow>
          <DetailRow label="本人が選べる項目"><InlineList items={card.participantChoices} /></DetailRow>
          <DetailRow label="指導者が見るポイント">{card.coachObservation}</DetailRow>
          <DetailRow label="変動量">{variabilityLabel}</DetailRow>
          <DetailRow label="提示順">{presentationLabel}</DetailRow>
          <DetailRow label="声かけ形式">{cueLabel}</DetailRow>
          <DetailRow label="フィードバック">{feedbackLabel}</DetailRow>
          <DetailRow label="用具">{card.effectiveEquipment.length > 0 ? card.effectiveEquipment.map((item) => equipmentLabels[item]).join("・") : "なし"}</DetailRow>
          <DetailRow label="用具が変える情報"><InlineList items={card.effectiveEquipment.map((item) => equipmentFunctionLabels[item])} /></DetailRow>
          <DetailRow label="易しくする">{card.easier}</DetailRow>
          <DetailRow label="難しくする">{card.harder}</DetailRow>
          <DetailRow label="用具なし版">{card.noEquipment}</DetailRow>
          <DetailRow label="人数が多い場合">{card.largeGroup}</DetailRow>
          <DetailRow label="全泳・実場面への接続">{card.effectiveTransferConnection}</DetailRow>
        </dl>
      </details>

      <details className="evidence-details">
        <summary>根拠と参考資料</summary>
        <p className="evidence-note">{card.evidenceNote}</p>
        {evidence.map((source) => (
          <section key={source.id} className="evidence-source">
            <span>{evidenceCategoryLabels[source.category]}</span>
            <h3>{source.title}</h3>
            <p>{source.authorsOrOrganisation}{source.year ? `（${source.year}）` : ""}</p>
            <h4>この資料が支える範囲</h4>
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
