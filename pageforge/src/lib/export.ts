import type {Block,Site} from './types';
import {escapeHtml,safeUrl} from './security';
import designCSS from '../styles/renderer/design-engine.css?raw';
import premiumCSS from '../styles/renderer/premium-templates.css?raw';
import familyCSS from '../styles/renderer/theme-families.css?raw';
import {directionOf} from './design';

export function downloadFile(name:string,text:string,type='text/plain'){
  const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const h=(v:string)=>escapeHtml(v);
function exportBlock(b:Block,index:number,isAether:boolean){
  const style=[b.background?`background:${h(b.background)}`:'',b.foreground?`color:${h(b.foreground)}`:''].filter(Boolean).join(';');
  const action=b.buttonText&&!['contact','footer'].includes(b.kind)?`<a class="render-button pf-action pf4-action" href="${h(safeUrl(b.buttonUrl))}"><span>${h(b.buttonText)}</span><span>↗</span></a>`:'';
  const labels:Record<Block['kind'],string>={hero:'A NEW PERSPECTIVE',features:'WHY CHOOSE US',split:'WHAT DRIVES US',stats:'BY THE NUMBERS',testimonials:'REAL STORIES',pricing:'CHOOSE YOUR PATH',faq:'EVERYTHING YOU NEED TO KNOW',cta:'THE NEXT STEP',gallery:'OUR UNIVERSE',contact:'LET\'S TALK',footer:'SEE YOU SOON'};
  const text=`<div class="render-copy pf-copy pf4-copy"><span class="eyebrow pf-kicker"><span class="pf-kicker-line"></span>${labels[b.kind]}</span><h2${isAether&&b.kind==='hero'?' data-pf-typewriter="true"':''}${b.titleColor?` style="color:${h(b.titleColor)}"`:''}>${h(b.title)}</h2>${b.subtitle?`<p class="subtitle"${b.subtitleColor?` style="color:${h(b.subtitleColor)}"`:''}>${h(b.subtitle)}</p>`:''}${b.body?`<p class="bodycopy"${b.bodyColor?` style="color:${h(b.bodyColor)}"`:''}>${h(b.body)}</p>`:''}${action}</div>`;
  const media=b.image?`<div class="pf-media pf4-media"><img class="render-image" src="${h(safeUrl(b.image))}" alt="${h(b.title)}" loading="lazy"><span class="pf-media-index">PF — STUDIO / 01</span></div>`:`<div class="pf-art"><span class="pf-art-orb"></span><span class="pf-art-grid"></span></div>`;
  const tiles=`<div class="feature-grid pf-tiles pf-tiles-${b.kind} pf4-tiles">${b.items.filter(Boolean).map((it,i)=>{const [head,detail]=it.split('|');return `<article class="feature-tile pf-tile pf4-tile"><div class="pf-tile-top"><span class="pf-tile-num">${String(i+1).padStart(2,'0')}</span><span class="pf-tile-glyph">↗</span></div><strong>${h(head)}</strong><p>${h(detail||'An experience made for you.')}</p></article>`}).join('')}</div>`;
  const faq=`<div class="faq-list pf-faq">${b.items.filter(Boolean).map(it=>{const[q,a]=it.split('|');return `<details><summary><span>${h(q)}</span><span class="pf-faq-plus">+</span></summary><p>${h(a||'Contact us to learn more.')}</p></details>`}).join('')}</div>`;
  const contact='<div class="pf-export-contact"><p>This HTML file is static. Connect a form service to receive messages.</p></div>';
  const gallery=`<div class="pf4-gallery">${[...(b.image?[{src:b.image,label:'Featured project'}]:[]),...b.items.map(it=>{const [src,label]=it.split('|');return {src,label:label||'Selected project'}}).filter(x=>/^https?:\/\//.test(x.src)||x.src.startsWith('data:image/'))].slice(0,5).map((x,i)=>`<figure class="pf4-gallery-card pf4-gallery-card-${i}"><img src="${h(safeUrl(x.src))}" alt="${h(x.label)}" loading="lazy"><figcaption><span>${h(x.label)}</span><span>↗</span></figcaption></figure>`).join('')}</div>`;
  const footer=`<div class="pf-footer-top"><span class="pf-footer-mark">✳</span><span>MADE FOR THE NEXT CHAPTER</span></div>${text}<div class="pf-footer-bottom"><span>© ${new Date().getFullYear()} · ${h(b.title)}</span><span>DESIGN WITH INTENTION</span></div>`;
  const skipAetherVisualMedia=isAether&&['hero','split'].includes(b.kind);
  const inside=b.kind==='footer'?footer:text+(b.kind==='faq'?faq:b.kind==='contact'?contact:b.kind==='gallery'?gallery:['hero','split'].includes(b.kind)?(skipAetherVisualMedia?'':media):['features','stats','testimonials','pricing'].includes(b.kind)?tiles:'');
  return `<section id="${b.kind==='contact'?'contact':b.kind==='gallery'?'gallery':b.kind==='features'?'features':h(b.id)}" data-recipe="${h(b.recipe||'classic')}" class="render-section pf-section pf4-section kind-${b.kind} align-${b.align} pf-section-${index%3}" style="${style}"><div class="render-inner pf-inner pf4-inner">${inside}</div><span class="pf-section-watermark" aria-hidden="true">${String(index+1).padStart(2,'0')}</span></section>`;
}
const aetherTypewriterScript="<script>(function(){\nvar root=document.querySelector('.pf6-tech');if(!root)return;\nvar titles=root.querySelectorAll('.kind-hero h2[data-pf-typewriter]');\nvar reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;\ntitles.forEach(function(el){\n if(reduced)return;\n var full=el.textContent||'';var chars=Array.from(full);var i=0;\n el.setAttribute('aria-label',full);el.textContent='';el.classList.add('pf-typewriter-active');\n function tick(){i=Math.min(i+1,chars.length);el.textContent=chars.slice(0,i).join('');\n  if(i<chars.length)setTimeout(tick,45);else el.classList.remove('pf-typewriter-active');}\n setTimeout(tick,380);\n});\n})();</script>";
export function exportStaticHtml(site:Site){
  const t=site.theme;const direction=directionOf(t);
  const vars=`--pf-brand:${h(t.primary)};--pf-page-bg:${h(t.surface)};--pf-page-fg:${h(t.text)};--pf-round:${Number(t.radius)||0}px;--pf-font:${h(t.font)}`;
  const sections=site.blocks.filter(b=>b.enabled).map((b,i)=>exportBlock(b,i,direction==='cinematic')).join('');
  const title=site.blocks.find(b=>b.kind==='footer')?.title||'STUDIO';
  const nav=`<header class="pf4-nav"><a href="#top" class="pf4-logo"><span class="pf4-logo-mark">✳</span>${h(title)}</a><nav aria-label="Page navigation"><a href="#features">Overview</a><a href="#gallery">Projects</a><a href="#contact">Contact</a></nav><a class="pf4-nav-cta" href="#contact">Let's talk ↗</a></header>`;
  const css=`*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0}a{color:inherit}button,input,textarea{font:inherit}.render-root{min-height:100vh}.pf-site .pf-section{min-height:0}.pf-site .pf-media img{width:100%;height:100%;object-fit:cover}.pf-site .pf-copy h2{overflow-wrap:break-word}.pf-export-contact{font-size:1.1rem;line-height:1.7}`;
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${h(site.description)}"><title>${h(site.name)}</title><style>${css}\n${designCSS.replace(/<\/style/gi,'<\\/style')}\n${premiumCSS.replace(/<\/style/gi,'<\\/style')}${familyCSS.replace(/<\/style/gi,'<\\/style')}</style></head><body><div class="render-root pf-site pf-dir-${direction} pf4-site pf6-site pf6-${({cinematic:"tech",luxury:"fashion",bold:"studio",organic:"architecture",product:"commerce",editorial:"architecture"} as Record<string,string>)[direction]||"tech"}" style="${vars}">${nav}<main id="top">${sections}</main></div>${direction==='cinematic'?aetherTypewriterScript:''}</body></html>`;
}
