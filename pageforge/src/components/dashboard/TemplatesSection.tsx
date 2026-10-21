import {ArrowUpRight} from 'lucide-react';
import {premiumTemplates, type PremiumTemplate} from '../../lib/templates';

/** Curated template gallery; picking one opens the create-project dialog. */
export function TemplatesSection({onPick}: {onPick: (template: PremiumTemplate) => void}) {
  return <section className="pf-dash-templates" id="pf-dash-templates" aria-labelledby="pf-dash-templates-title">
    <div className="pf-dash-section-heading"><div><span className="pf-dash-kicker">CURATED COLLECTION</span><h2 id="pf-dash-templates-title">Professional templates<span className="pf-dash-period">.</span></h2><p>A distinctive visual identity for every project.</p></div></div>
    <div className="pf-dash-template-grid">{premiumTemplates.map((t,i) => <button type="button" className="pf-dash-template" key={t.id} onClick={() => onPick(t.id)}><span className={`pf-dash-template-art pf-dash-template-art-${i % 5}`} style={{'--pf-template-bg':t.preview} as React.CSSProperties}></span><span className="pf-dash-template-bottom"><span><strong>{t.name}</strong><small>{t.category}</small></span><ArrowUpRight size={18}/></span></button>)}</div>
  </section>;
}
