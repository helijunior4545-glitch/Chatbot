#!/usr/bin/env python3
# PageForge Responsive V1 — instalador conservador, sem dependencias externas.
# Execute: python3 instalador_pageforge_responsivo_v1.txt --dry-run
#          python3 instalador_pageforge_responsivo_v1.txt
from pathlib import Path
import argparse, datetime, shutil, subprocess, sys, json

CSS = r'''/* PAGEFORGE RESPONSIVE V1 — mobile/tablet UX, loaded last */
:root{--pf-mobile-bar:58px}
html,body,#root{max-width:100%;min-width:0}
.app-shell,.app-main,.pf-main,.editor,.editor-body,.editor-stage{min-width:0}
.pf-mobile-menu,.pf-mobile-scrim,.pf-editor-mobile-tabs{display:none}
@media(max-width:1023px){
 .app-shell{width:100%;min-height:100dvh}
 .app-main,.pf-main{min-width:0;width:100%;max-width:100%}
 .pf-topbar{min-width:0;max-width:100%;gap:8px}
 .pf-mobile-menu{display:inline-flex;align-items:center;justify-content:center;flex:none;width:44px;height:44px;border:1px solid #ffffff2a;border-radius:12px;background:#1d2230;color:#fff;z-index:2}
 .app-shell .app-nav.pf-sidebar{position:fixed!important;top:0;bottom:0;left:0;z-index:1100;width:min(300px,84vw)!important;max-width:84vw;overflow-y:auto;transform:translateX(-105%);transition:transform .22s ease;box-shadow:20px 0 50px #0005}
 .app-shell.pf-nav-open .app-nav.pf-sidebar{transform:translateX(0)}
 .app-shell.pf-nav-open .pf-mobile-scrim{display:block;position:fixed;inset:0;background:#0009;z-index:1099;border:0;border-radius:0}
 .pf12-shell .pf-dashboard{min-width:0;max-width:100%}
 .pf12-shell .pf-dash-hero{min-width:0}
 .pf12-shell .pf-dash-hero h1{overflow-wrap:anywhere}
 .pf202-popover{max-width:min(92vw,390px)}
 .editor{height:100dvh;min-height:0}
 .editor-top{height:auto;min-height:62px;padding:9px 12px;gap:9px;flex-wrap:wrap}
 .editor-heading{flex:1;min-width:100px;max-width:100%}
 .editor-heading strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .editor-top-actions{width:100%;margin:0;overflow-x:auto;overscroll-behavior-x:contain;padding-bottom:3px;scrollbar-width:thin;flex-wrap:nowrap}
 .editor-top-actions>*{flex-shrink:0}
 .editor-body{display:flex;flex-direction:column;position:relative;min-height:0;flex:1;overflow:hidden}
 .pf-editor-mobile-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;padding:7px 9px;background:#101522;border-top:1px solid #ffffff20;order:2;z-index:5;flex-shrink:0}
 .pf-editor-mobile-tabs button{min-height:44px;border:1px solid #ffffff20;border-radius:10px;background:#202538;color:#dbe0ee;font-weight:700;font-size:12px}
 .pf-editor-mobile-tabs button[aria-pressed="true"]{background:#5544a5;border-color:#a58aff;color:#fff}
 .editor-body>.editor-sidebar,.editor-body>.inspector,.editor-body>.editor-stage{display:none!important;flex:1;min-height:0;width:100%;max-width:100%;border:0}
 .editor-body[data-pf-panel="blocks"]>.editor-sidebar{display:block!important;overflow:auto}
 .editor-body[data-pf-panel="design"]>.inspector{display:block!important;overflow:auto}
 .editor-body[data-pf-panel="preview"]>.editor-stage{display:flex!important;overflow:auto;overscroll-behavior:contain}
 .editor-stage{padding:14px;justify-content:center}
 .canvas-frame{max-width:100%;min-width:0;min-height:0}
 .canvas-frame.tablet{width:min(768px,100%)}
 .canvas-frame.mobile{width:min(390px,100%)}
 .editor .properties,.editor .pf-ai-panel{max-width:100%;min-width:0}
 .editor input,.editor select,.editor textarea{max-width:100%;min-width:0}
 .editor textarea,.editor input:not([type="color"]):not([type="range"]),.editor select{font-size:16px}
 .editor .layer .drag{touch-action:none;min-width:38px;min-height:40px}
 .editor .layer-label,.editor .catalog button{min-height:44px}
 .editor .pf16-canvas-tools{opacity:1!important;transform:none!important}
}
@media(min-width:768px) and (max-width:1023px){
 .pf12-shell .pf-dash-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
 .editor-top-actions{width:auto;max-width:100%;margin-left:auto}
 .editor-top{flex-wrap:wrap}
 .editor-stage{padding:22px}
}
@media(max-width:767px){
 .pf-topbar{padding:8px 10px!important;min-height:58px;flex-wrap:wrap}
 .pf12-top-right,.pf202-top{min-width:0;max-width:100%;gap:4px}
 .pf12-top-search{width:auto;min-width:44px;flex:1;max-width:100%}
 .pf12-top-search input{min-width:0;font-size:16px}
 .pf12-shell .pf-dashboard{padding:0 12px 28px}
 .pf12-shell .pf-dash-hero{min-height:0;padding:22px 16px}
 .pf12-shell .pf-dash-hero h1{font-size:clamp(29px,9vw,43px);line-height:1.1}
 .pf12-shell .pf-dash-stats,.pf12-shell .pf-dash-cards{grid-template-columns:1fr}
 .pf12-shell .pf-dash-template-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
 .pf12-shell .pf-dash-template-grid>*{min-width:0}
 .pf202-popover{position:fixed!important;top:65px!important;left:10px!important;right:10px!important;width:auto!important;max-width:none!important;max-height:calc(100dvh - 80px);overflow:auto}
 .editor-top .btn{padding:9px 11px;font-size:12px}
 .editor-top-actions .iconbtn{width:42px;height:42px}
 .editor-stage{padding:8px}
 .catalog{grid-template-columns:repeat(2,minmax(0,1fr))}
 .modal,[role="dialog"]{max-width:calc(100vw - 20px);max-height:calc(100dvh - 20px);overflow-y:auto}
 .pf-site img,.pf-site video{max-width:100%;height:auto}
}
@media(max-width:390px){
 .pf12-shell .pf-dash-template-grid{grid-template-columns:1fr}
 .editor-heading strong{font-size:12px}
 .editor-top{padding:7px}
 .pf-editor-mobile-tabs{padding:5px}
}
@media(prefers-reduced-motion:reduce){.app-shell .app-nav.pf-sidebar{transition:none}}
'''

p=argparse.ArgumentParser(description='PageForge responsive installer')
p.add_argument('--dry-run',action='store_true');p.add_argument('--no-build',action='store_true')
a=p.parse_args()
root=Path.cwd()
if not (root/'package.json').is_file() or not (root/'src/App.tsx').is_file():
 sys.exit('ERRO: execute na pasta que contem package.json e src/App.tsx')
files={name:(root/name) for name in ['src/App.tsx','src/components/Editor.tsx','src/pages/Shell.tsx']}
original={k:v.read_text(encoding='utf-8') for k,v in files.items()}
if 'pf-responsive-v1.css' in original['src/App.tsx']:
 sys.exit('Responsividade V1 ja instalada. Nenhuma alteracao realizada.')

# Guardas ancoradas na estrutura enviada; aborta sem modificar se mudou.
def one(text,old,new,name):
 n=text.count(old)
 if n!=1: raise ValueError(f'{name}: esperado um marcador, encontrados {n}: {old[:90]}')
 return text.replace(old,new,1)
try:
 app=original['src/App.tsx']
 app=one(app,"import './styles/pages/theme-modal-panoramic-v26-2.css';", "import './styles/pages/theme-modal-panoramic-v26-2.css';\nimport './styles/pages/pf-responsive-v1.css';",'App.tsx')
 editor=original['src/components/Editor.tsx']
 editor=one(editor,"const [device,setDevice]=useState<'desktop'|'tablet'|'mobile'>('desktop');", "const [device,setDevice]=useState<'desktop'|'tablet'|'mobile'>('desktop');const [pfPanel,setPfPanel]=useState<'preview'|'blocks'|'design'>('preview');",'Editor.tsx')
 editor=one(editor,'<div className="editor-body"><aside className="editor-sidebar">','<div className="editor-body" data-pf-panel={pfPanel}><div className="pf-editor-mobile-tabs" role="group" aria-label="Editor panels"><button type="button" aria-pressed={pfPanel===\'preview\'} onClick={()=>setPfPanel(\'preview\')}>Preview</button><button type="button" aria-pressed={pfPanel===\'blocks\'} onClick={()=>setPfPanel(\'blocks\')}>Sections</button><button type="button" aria-pressed={pfPanel===\'design\'} onClick={()=>setPfPanel(\'design\')}>Design & AI</button></div><aside className="editor-sidebar">','Editor.tsx')
 # On narrow screens, selecting a layer opens the inspector (desktop stays untouched).
 editor=one(editor,'onSelect={()=>setSelectedId(b.id)}','onSelect={()=>{setSelectedId(b.id);if(window.matchMedia(\'(max-width:1023px)\').matches)setPfPanel(\'design\')}}','Editor.tsx')
 shell=original['src/pages/Shell.tsx']
 shell=one(shell,"const [menu,setMenu]=useState<TopMenu>(null);", "const [menu,setMenu]=useState<TopMenu>(null);const [pfNavOpen,setPfNavOpen]=useState(false);",'Shell.tsx')
 shell=one(shell,'<div className={`app-shell pf-studio ${dashboard?\'pf12-shell\':\'\'}`}>','<div className={`app-shell pf-studio ${dashboard?\'pf12-shell\':\'\'} ${pfNavOpen?\'pf-nav-open\':\'\'}`}><button className="pf-mobile-scrim" type="button" aria-label="Close navigation" onClick={()=>setPfNavOpen(false)}/>', 'Shell.tsx')
 shell=one(shell,'<aside className="app-nav pf-sidebar">','<aside className="app-nav pf-sidebar" onClickCapture={e=>{if((e.target as HTMLElement).closest(\'a\'))setPfNavOpen(false)}}>', 'Shell.tsx')
 shell=one(shell,'<header className="pf-topbar">','<header className="pf-topbar"><button type="button" className="pf-mobile-menu" aria-label="Open navigation" aria-expanded={pfNavOpen} onClick={()=>setPfNavOpen(v=>!v)}><span aria-hidden="true">☰</span></button>', 'Shell.tsx')
except ValueError as exc:
 sys.exit(f'ABORTADO sem alterar arquivos: {exc}')
changes={files['src/App.tsx']:app,files['src/components/Editor.tsx']:editor,files['src/pages/Shell.tsx']:shell,root/'src/styles/pages/pf-responsive-v1.css':CSS}
if (root/'src/styles/pages/pf-responsive-v1.css').exists():sys.exit('ABORTADO: arquivo CSS de destino ja existe; revise manualmente.')
print('PageForge Responsive V1 — alteracoes planejadas:')
for f in changes:print(' +',f.relative_to(root))
if a.dry_run:print('DRY RUN concluido. Nenhum arquivo alterado.');sys.exit(0)
backup=root/'.pageforge_backups'/('responsive-v1-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
try:
 for f in files.values():
  dst=backup/f.relative_to(root);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,dst)
 for f,content in changes.items():f.parent.mkdir(parents=True,exist_ok=True);f.write_text(content,encoding='utf-8')
 print('Arquivos aplicados; backup:',backup)
 if not a.no_build:
  npm=shutil.which('npm')
  if not npm:raise RuntimeError('npm nao encontrado; instalacao revertida. Use --no-build somente se desejar validar manualmente.')
  check=subprocess.run([npm,'run','build'],cwd=root)
  if check.returncode:raise RuntimeError('npm run build falhou; restaurando arquivos originais.')
except Exception as exc:
 for f,content in original.items():files[f].write_text(content,encoding='utf-8')
 (root/'src/styles/pages/pf-responsive-v1.css').unlink(missing_ok=True)
 sys.exit('INSTALACAO REVERTIDA: '+str(exc))
print('SUCESSO. Teste em 320, 375, 390, 768, 1024 e 1440px. Nenhum push automatico.')