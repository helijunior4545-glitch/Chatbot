import { useState } from 'react';
import { ArrowRight, Check, Globe2, Layers3, MousePointer2, Sparkles, UserPlus, X } from 'lucide-react';
import type { Actor } from '../lib/types';

import { createLocalAccount, getAllLocalActors } from '../lib/localAccounts';

const highlights = [
  { icon: MousePointer2, label: 'Visual editing', detail: 'Create without friction' },
  { icon: Layers3, label: 'Beautiful by design', detail: 'A canvas made for ideas' },
  { icon: Globe2, label: 'Ready to launch', detail: 'From draft to live' },
];

export function Login({ onLogin }: { onLogin: (a: Actor) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);
  const [accounts, setAccounts] = useState(() => getAllLocalActors());
  const [registerOpen, setRegisterOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const register = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || entering) return;
    setError('');
    setSubmitting(true);
    try {
      const account = createLocalAccount(fullName, email);
      setAccounts(getAllLocalActors());
      choose(account);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create this account.');
      setSubmitting(false);
    }
  };
  const choose = (actor: Actor) => {
    if (entering) return;
    setSelected(actor.id);
    setEntering(true);
    onLogin(actor);
  };

  return (
    <div className="login-page pf17-entry">
      <div className="pf17-noise" aria-hidden="true" />
      <div className="pf17-topline">
        <a className="pf17-wordmark" href="/" aria-label="PageForge Studio home">
          <span className="pf17-mark">✳</span><span>pageforge<span className="pf17-wordmark-light">.studio</span></span>
        </a>
        <span className="pf17-topnote"><span className="pf17-live-dot" /> YOUR CREATIVE WORKSPACE</span>
      </div>

      <main className="pf17-layout">
        <section className="pf17-story" aria-labelledby="pf17-headline">
          <div className="pf17-story-inner">
            <div className="pf17-eyebrow"><Sparkles size={14} aria-hidden="true" /> THE FUTURE IS YOUR CANVAS <span> / 01</span></div>
            <h1 id="pf17-headline">A new way<br />to <em>make</em><br /><span>the web.</span></h1>
            <p className="pf17-lede">Everything you imagine, brought to life. Design, refine, and publish extraordinary websites in one beautifully simple space.</p>
            <div className="pf17-features" aria-label="PageForge capabilities">
              {highlights.map(({icon: Icon,label,detail},i)=>(
                <div className="pf17-feature" key={label}>
                  <span className="pf17-feature-icon"><Icon size={19} strokeWidth={1.6} aria-hidden="true" /></span>
                  <span className="pf17-feature-copy"><strong>{label}</strong><small>{detail}</small></span>
                  <span className="pf17-feature-index">0{i+1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pf17-art" aria-hidden="true">
            <div className="pf17-art-glow" />
            <div className="pf17-window">
              <div className="pf17-window-top"><span className="pf17-dots"><i/><i/><i/></span><span>YOUR NEXT BIG IDEA</span><span>↗</span></div>
              <div className="pf17-window-body"><div className="pf17-window-tag">CREATIVE FREEDOM</div><div className="pf17-window-title">Made to<br/><i>stand out.</i></div><div className="pf17-window-lines"><span/><span/></div><div className="pf17-window-orb"/></div>
            </div>
            <div className="pf17-floating"><span className="pf17-floating-check"><Check size={14}/></span><span><strong>Designed by you</strong><small>Built for what's next</small></span></div>
          </div>
          <div className="pf17-story-foot"><span>INDEPENDENT CREATIVITY, WITHOUT LIMITS.</span><span>✳ &nbsp; CREATE SOMETHING REMARKABLE</span></div>
        </section>

        <section className="pf17-access" aria-labelledby="pf17-access-title">
          <div className="pf17-access-inner">
            <div className="pf17-access-symbol"><span>✳</span></div>
            <div className="pf17-access-kicker">YOUR STUDIO AWAITS <span>—</span> DEMO ACCESS</div>
            <h2 id="pf17-access-title">Welcome to<br/><em>what's next.</em></h2>
            <p className="pf17-access-description">Choose a workspace to explore the PageForge experience. Your next great idea starts here.</p>
            <div className="pf17-account-head"><span>CHOOSE AN ACCOUNT</span><span>{String(accounts.length).padStart(2,'0')} AVAILABLE</span></div>
            <div className="pf17-accounts">
              {accounts.map((a,i)=>(
                <button type="button" className={`pf17-account ${selected===a.id?'pf17-account-selected':''}`} key={a.id} onClick={()=>choose(a)} disabled={entering} aria-label={`Continue as ${a.name}`}>
                  <span className={`pf17-avatar pf17-avatar-${i%4}`}>{a.name.charAt(0).toUpperCase()}</span>
                  <span className="pf17-account-copy"><strong>{a.name}</strong><small>{a.email}</small></span>
                  <span className="pf17-account-arrow"><ArrowRight size={19} strokeWidth={1.7}/></span>
                </button>
              ))}
            </div>
            <button type="button" className="pf18-create-trigger" onClick={() => { setError(''); setRegisterOpen(true); }} disabled={entering}>
              <span className="pf18-create-icon"><UserPlus size={21} aria-hidden="true" /></span>
              <span><strong>Create your account</strong><small>Start a personal workspace in seconds</small></span>
              <ArrowRight size={20} aria-hidden="true" />
            </button>
            {registerOpen && <div className="pf18-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setRegisterOpen(false); }}>
              <section className="pf18-dialog" role="dialog" aria-modal="true" aria-labelledby="pf18-title">
                <button className="pf18-close" type="button" onClick={() => setRegisterOpen(false)} aria-label="Close account creation"><X size={20}/></button>
                <div className="pf18-dialog-kicker">YOUR SPACE STARTS HERE / 01</div>
                <h3 id="pf18-title">Make it <em>yours.</em></h3>
                <p>Set up a local profile and enter your own creative workspace.</p>
                <form onSubmit={register} className="pf18-form">
                  <label htmlFor="pf18-name">Full name</label>
                  <input id="pf18-name" autoFocus autoComplete="name" maxLength={80} required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Alex Morgan" />
                  <label htmlFor="pf18-email">Email address</label>
                  <input id="pf18-email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                  {error && <div className="pf18-error" role="alert">{error}</div>}
                  <button className="pf18-submit" type="submit" disabled={submitting || entering}>Create local account <ArrowRight size={19}/></button>
                </form>
                <p className="pf18-disclaimer">Local demo only: no password or verified identity. Anyone using this browser can open these profiles. Do not enter sensitive information.</p>
              </section>
            </div>}
            <div className="pf17-access-help"><span className="pf17-help-icon">i</span><span>Demo environment. Accounts are for exploring the product and do not authenticate real users.</span></div>
            <div className="pf17-access-bottom"><span>NO SETUP REQUIRED</span><span>JUST PICK A WORKSPACE <ArrowRight size={13}/></span></div>
          </div>
          <div className="pf17-access-corner" aria-hidden="true">PF<span>—</span>01</div>
        </section>
      </main>
      <footer className="pf17-bottom"><span>© {new Date().getFullYear()} PAGEFORGE STUDIO</span><span>IMAGINE MORE. BUILD BETTER.</span><span>CRAFTED FOR CREATORS ↗</span></footer>
    </div>
  );
}
