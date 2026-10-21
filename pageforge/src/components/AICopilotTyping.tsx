import { useEffect, useState } from 'react';

const HELP_TEXT = 'Describe a change to the selected section. Review the proposed operations before applying.';

export default function AICopilotTyping() {
  const [count, setCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion || count >= HELP_TEXT.length) return;
    const timer = window.setTimeout(() => setCount(n => Math.min(n + 1, HELP_TEXT.length)), 42);
    return () => window.clearTimeout(timer);
  }, [count, reducedMotion]);

  return (
    <p className="pf-ai-typewriter pf-ai-typewriter-wrap" aria-label={HELP_TEXT}>
      <span aria-hidden="true">{HELP_TEXT.slice(0, reducedMotion ? HELP_TEXT.length : count)}</span>
      {!reducedMotion && count < HELP_TEXT.length && <span className="pf-ai-typewriter-caret" aria-hidden="true">|</span>}
    </p>
  );
}
