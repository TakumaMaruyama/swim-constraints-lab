import { ArrowLeft, ExternalLink } from "lucide-react";
import { evidenceCategoryLabels } from "../data/evidenceSources";
import type { EvidenceSource } from "../types";

interface ReferencesViewProps {
  sources: EvidenceSource[];
  onBack: () => void;
}

export function ReferencesView({ sources, onBack }: ReferencesViewProps) {
  return (
    <main className="page-shell references-page" id="main-content">
      <button type="button" className="text-button" onClick={onBack}>
        <ArrowLeft size={18} aria-hidden="true" /> 戻る
      </button>
      <p className="section-kicker">Evidence library</p>
      <h1>全参考資料</h1>
      <p className="lead">根拠区分は優劣ではなく、情報源の種類を示します。個別課題の効果を保証するものではありません。</p>
      <div className="reference-grid">
        {sources.map((source) => (
          <article className="reference-card" key={source.id}>
            <span>{evidenceCategoryLabels[source.category]}</span>
            <h2>{source.title}</h2>
            <p>{source.authorsOrOrganisation}{source.year ? `（${source.year}）` : ""}</p>
            <h3>支持する範囲</h3>
            <ul>{source.supports.map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>支持していないこと</h3>
            <ul>{source.doesNotProve.map((item) => <li key={item}>{item}</li>)}</ul>
            <a href={source.url} target="_blank" rel="noreferrer noopener">
              資料を別タブで開く <ExternalLink size={15} aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </main>
  );
}
