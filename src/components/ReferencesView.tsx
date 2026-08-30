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
      <p className="section-kicker">練習を考える時に参考にした資料</p>
      <h1>参考資料の一覧</h1>
      <p className="lead">それぞれの資料に「この資料から言えること」と「この資料だけでは言えないこと」があります。このアプリに載っている練習の効果を保証するものではありません。</p>
      <div className="reference-grid">
        {sources.map((source) => (
          <article className="reference-card" key={source.id}>
            <span>{evidenceCategoryLabels[source.category]}</span>
            <h2>{source.title}</h2>
            <p>{source.authorsOrOrganisation}{source.year ? `（${source.year}）` : ""}</p>
            <h3>この資料から言えること</h3>
            <ul>{source.supports.map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>この資料だけでは言えないこと</h3>
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
