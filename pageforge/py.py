#!/usr/bin/env python3
"""PageForge V26.5 — digitação real com quebra automática de linha.
Execute na raiz do projeto: python3 py.py --dry-run; python3 py.py
"""
from pathlib import Path
from datetime import datetime
import argparse
import subprocess
import sys

ROOT = Path.cwd()
EDITOR = ROOT / 'src/components/Editor.tsx'
CSS = ROOT / 'src/styles/pages/pageforge-ai-v26.css'
COMP = ROOT / 'src/components/AICopilotTyping.tsx'
OLD = '<p className="pf-ai-typewriter"><span>Describe a change to the selected section. Review the proposed operations before applying.</span></p>'
NEW = '<AICopilotTyping />'
START = '/* PAGEFORGE V26.4 AI TYPEWRITER START */'
END = '/* PAGEFORGE V26.4 AI TYPEWRITER END */'
IMPORT = "import AICopilotTyping from './AICopilotTyping';\n"
COMPONENT = '''import { useEffect, useState } from 'react';

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
'''
CSS_PATCH = '''
/* PAGEFORGE V26.5 AI TYPEWRITER WRAP START */
/* O texto é revelado pelo React, não por width: 0; pode quebrar em qualquer largura. */
.editor .pf-ai-panel .pf-ai-typewriter.pf-ai-typewriter-wrap,
.editor .pf-ai-panel .pf-ai-typewriter.pf-ai-typewriter-wrap > span {
  width: auto !important;
  max-width: 100% !important;
  overflow: visible !important;
  white-space: normal !important;
  overflow-wrap: break-word !important;
  word-break: normal !important;
  border-right: 0 !important;
  animation: none !important;
}
.editor .pf-ai-panel .pf-ai-typewriter.pf-ai-typewriter-wrap {
  display: block !important;
  min-width: 0;
  line-height: 1.55;
}
.editor .pf-ai-panel .pf-ai-typewriter .pf-ai-typewriter-caret {
  display: inline !important;
  margin-left: 1px;
  color: currentColor;
  opacity: 1;
  animation: pf-ai-wrap-caret .75s step-end infinite !important;
}
@keyframes pf-ai-wrap-caret { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .editor .pf-ai-panel .pf-ai-typewriter .pf-ai-typewriter-caret { animation: none !important; }
}
/* PAGEFORGE V26.5 AI TYPEWRITER WRAP END */
'''

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    if not all(p.is_file() for p in (EDITOR, CSS, ROOT/'package.json')):
        raise RuntimeError('Execute na raiz do PageForge com V26.4 instalado.')
    editor = EDITOR.read_text(encoding='utf-8')
    css = CSS.read_text(encoding='utf-8')
    if editor.count(OLD) != 1 or css.count(START) != 1 or css.count(END) != 1:
        raise RuntimeError('V26.4 nao encontrado exatamente uma vez. Nenhum arquivo alterado.')
    if COMP.exists() or 'PAGEFORGE V26.5 AI TYPEWRITER WRAP START' in css or 'AICopilotTyping' in editor:
        raise RuntimeError('V26.5 ja existe ou ha conflito. Nenhum arquivo alterado.')
    if "from './AICopilotTyping'" in editor:
        raise RuntimeError('Import ja existe. Nenhum arquivo alterado.')
    # Insere import antes do primeiro import existente, sem tocar nos outros imports.
    lines = editor.splitlines(keepends=True)
    idx = next((i for i, line in enumerate(lines) if line.startswith('import ')), None)
    if idx is None:
        raise RuntimeError('Nao encontrei imports no Editor.tsx. Nenhum arquivo alterado.')
    lines.insert(idx, IMPORT)
    updated_editor = ''.join(lines).replace(OLD, NEW, 1)
    updated_css = css.rstrip() + '\n' + CSS_PATCH
    if args.dry_run:
        print('DRY-RUN OK: substituira animacao por digitação real com quebra de linha.')
        print('Arquivos: Editor.tsx, pageforge-ai-v26.css e novo AICopilotTyping.tsx')
        return
    backup = ROOT/'.pageforge_backups'/('v26_5_ai_wrap_'+datetime.now().strftime('%Y%m%d_%H%M%S_%f'))
    backup.mkdir(parents=True, exist_ok=False)
    for path in (EDITOR, CSS):
        target = backup/path.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(path.read_bytes())
    try:
        EDITOR.write_text(updated_editor, encoding='utf-8')
        CSS.write_text(updated_css, encoding='utf-8')
        COMP.write_text(COMPONENT, encoding='utf-8')
        subprocess.run(['npm', 'run', 'build'], cwd=ROOT, check=True)
    except Exception:
        for path in (EDITOR, CSS):
            path.write_bytes((backup/path.relative_to(ROOT)).read_bytes())
        COMP.unlink(missing_ok=True)
        print('ROLLBACK: arquivos restaurados e componente novo removido.')
        raise
    print('SUCESSO: AI Copilot digita com quebra automatica de linha.')
    print('Backup:', backup)

if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('ERRO:', exc)
        sys.exit(1)