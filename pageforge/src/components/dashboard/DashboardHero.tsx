import {useEffect, useState} from 'react';
import {ArrowRight, ArrowUpRight, Plus, Sparkles} from 'lucide-react';

const heroPhrases = ['without limits.', 'with total freedom.', 'in just a few clicks.', 'your way.'] as const;

/** Dashboard hero with the self-typing headline and its reduced-motion / visibility handling. */
export function DashboardHero({onCreate}: {onCreate: () => void}) {
  // Hero: fixed first line; second line types and cycles.
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0);
  const [heroChars, setHeroChars] = useState(0);
  const [heroDeleting, setHeroDeleting] = useState(false);
  const [heroMotionReduced, setHeroMotionReduced] = useState(false);
  const [heroTabVisible, setHeroTabVisible] = useState(true);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setHeroMotionReduced(preference.matches);
    const syncVisibility = () => setHeroTabVisible(!document.hidden);
    syncPreference();
    syncVisibility();
    preference.addEventListener('change', syncPreference);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      preference.removeEventListener('change', syncPreference);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (heroMotionReduced || !heroTabVisible) return;
    const phrase = heroPhrases[heroPhraseIndex];
    const finished = heroChars === phrase.length && !heroDeleting;
    const erased = heroChars === 0 && heroDeleting;
    const delay = finished ? 2300 : erased ? 380 : heroDeleting ? 43 : 82;
    const timeout = window.setTimeout(() => {
      if (finished) {setHeroDeleting(true);return;}
      if (erased) {
        setHeroDeleting(false);
        setHeroPhraseIndex(i => (i + 1) % heroPhrases.length);
        return;
      }
      setHeroChars(n => Math.max(0, Math.min(phrase.length, n + (heroDeleting ? -1 : 1))));
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [heroPhraseIndex, heroChars, heroDeleting, heroMotionReduced, heroTabVisible]);

  return <section className="pf-dash-hero" aria-labelledby="pf-dash-title">
    <div className="pf-dash-hero-copy"><span className="pf-dash-kicker"><Sparkles size={15}/> PAGEFORGE STUDIO</span><h1 id="pf-dash-title">Create incredible websites<br/><em className="pf13-type-line">{heroMotionReduced ? heroPhrases[0] : heroPhrases[heroPhraseIndex].slice(0, heroChars)}<span className="pf13-type-cursor" aria-hidden="true"/></em></h1><p>Professional design, an advanced visual editor, and publishing in just a few steps.</p><div className="pf-dash-hero-actions"><button type="button" className="pf15-tour-launch" onClick={() => window.dispatchEvent(new Event('pageforge:start-tour'))}><Sparkles size={15}/> Take a 60-second tour</button><button type="button" className="pf-dash-primary" onClick={onCreate}><Plus size={18}/> Create page <ArrowRight size={17}/></button><a className="pf-dash-ghost" href="#pf-dash-templates">Explore templates <ArrowUpRight size={16}/></a></div></div>
    <div className="pf12-hero-message" aria-hidden="true"><span className="pf12-message-icon"><Sparkles size={20}/></span><span>Turn ideas<br/>into extraordinary<br/>digital experiences.</span><ArrowUpRight size={18}/></div>
  </section>;
}
