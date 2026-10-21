import {useEffect,useState} from 'react';
import type {Block,PublishedSnapshot,Site,Theme} from '../lib/types';
import {safeUrl} from '../lib/security';
import {addEvent,addLead} from '../lib/local';
import {directionOf} from '../lib/design';

type Props={blocks:Block[];theme:Theme;siteId?:string;publicMode?:boolean;editorMode?:boolean;selectedBlockId?:string;onMoveBlock?:(blockId:string,direction:-1|1)=>void};
const labels:Record<Block['kind'],string>={hero:'A NEW ERA STARTS HERE',features:'WHAT DRIVES US',split:'OUR APPROACH',stats:'IN PERSPECTIVE',testimonials:'WORDS THAT MATTER',pricing:'FIND YOUR PATH',faq:'FREQUENTLY ASKED QUESTIONS',cta:'THE NEXT CHAPTER',gallery:'SELECTED PROJECTS',contact:'START A CONVERSATION',footer:'SEE YOU SOON'};
const getHref=(b:Block)=>safeUrl(b.buttonUrl);
function Contact({siteId,publicMode}:{siteId?:string;publicMode?:boolean}){
 const[name,setName]=useState('');const[email,setEmail]=useState('');const[message,setMessage]=useState('');const[done,setDone]=useState(false);
 return <form className="lead-form pf-lead-form pf4-form" onSubmit={e=>{e.preventDefault();if(!publicMode||!siteId){setDone(true);return;}try{addLead(siteId,{name,email,message});setDone(true);}catch{alert('Unable to send your message.');}}}>
  <label>YOUR NAME<input required maxLength={120} placeholder="What should we call you?" value={name} onChange={e=>setName(e.target.value)}/></label>
  <label>YOUR EMAIL<input required type="email" maxLength={180} placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>
  <label>ABOUT YOUR PROJECT<textarea maxLength={2000} rows={4} placeholder="Tell us a little about your idea..." value={message} onChange={e=>setMessage(e.target.value)}/></label>
  <button type="submit">{done?'Message received ✓':'Send message ↗'}</button>{!publicMode&&<small>Preview: no message will be sent.</small>}
 </form>;
}
function Action({b,siteId,publicMode,editorMode}:{b:Block;siteId?:string;publicMode?:boolean;editorMode?:boolean}){
 if(!b.buttonText||b.kind==='contact'||b.kind==='footer')return null;
 return <a data-pf-field={editorMode?"buttonText":undefined} className="render-button pf-action pf4-action" href={editorMode?undefined:getHref(b)} onClick={()=>{if(publicMode&&siteId)addEvent(siteId,'cta_click')}}><span>{b.buttonText}</span><span aria-hidden="true">↗</span></a>;
}
function Media({b,editorMode}:{b:Block;editorMode?:boolean}){
 if(!b.image)return <div className="pf-art pf4-art" aria-hidden="true"><span className="pf-art-orb"/><span className="pf-art-grid"/></div>;
 return <div data-pf-field={editorMode?"image":undefined} className="pf-media pf4-media"><img className="render-image" src={safeUrl(b.image)} alt={b.title} loading={b.kind==='hero'?'eager':'lazy'}/><span className="pf4-media-overlay"/><span className="pf-media-index">VISUAL / 001</span></div>;
}
function TypewriterTitle({text,color}:{text:string;color?:string}){
 const [shown,setShown]=useState(text);
 const [running,setRunning]=useState(false);
 useEffect(()=>{
  if(typeof window==='undefined'||window.matchMedia('(prefers-reduced-motion: reduce)').matches){setShown(text);setRunning(false);return;}
  const chars=Array.from(text);
  let index=0;
  let timer:number|undefined;
  setShown('');setRunning(true);
  const tick=()=>{
   index=Math.min(index+1,chars.length);
   setShown(chars.slice(0,index).join(''));
   if(index<chars.length) timer=window.setTimeout(tick,45);
   else setRunning(false);
  };
  timer=window.setTimeout(tick,380);
  return ()=>{if(timer!==undefined)window.clearTimeout(timer);};
 },[text]);
 return <h2 className={`pf-typewriter-title${running?' pf-typewriter-active':''}`} style={color?{color}:undefined} aria-label={text}>{shown}</h2>;
}

function Copy({b,siteId,publicMode,editorMode,typing=false}:{b:Block;siteId?:string;publicMode?:boolean;editorMode?:boolean;typing?:boolean}){
 return <div className="render-copy pf-copy pf4-copy"><span className="eyebrow pf-kicker"><span className="pf-kicker-line"/>{labels[b.kind]}</span>{typing?<TypewriterTitle text={b.title} color={b.titleColor}/>:<h2 style={b.titleColor?{color:b.titleColor}:undefined} data-pf-field={editorMode?"title":undefined}>{b.title}</h2>}{b.subtitle&&<p style={b.subtitleColor?{color:b.subtitleColor}:undefined} data-pf-field={editorMode?"subtitle":undefined} className="subtitle">{b.subtitle}</p>}{b.body&&<p style={b.bodyColor?{color:b.bodyColor}:undefined} data-pf-field={editorMode?"body":undefined} className="bodycopy">{b.body}</p>}<Action b={b} siteId={siteId} publicMode={publicMode} editorMode={editorMode}/></div>;
}
function Tiles({b,editorMode}:{b:Block;editorMode?:boolean}){
 return <div data-pf-field={editorMode?"items":undefined} className={`feature-grid pf-tiles pf-tiles-${b.kind} pf4-tiles`}>{b.items.filter(Boolean).map((item,i)=>{const[head,detail]=item.split('|');return <article className="feature-tile pf-tile pf4-tile" key={`${i}-${item}`}><div className="pf-tile-top"><span className="pf-tile-num">{String(i+1).padStart(2,'0')}</span><span className="pf-tile-glyph" aria-hidden="true">↗</span></div><strong>{head}</strong><p>{detail||'An experience thoughtfully designed for what comes next.'}</p></article>;})}</div>;
}
function Gallery({b,editorMode}:{b:Block;editorMode?:boolean}){
 const entries=[...(b.image?[{src:b.image,label:'Featured project'}]:[]),...b.items.map(item=>{const[src,label]=item.split('|');return {src,label:label||'Selected project'};}).filter(x=>/^https?:\/\//.test(x.src)||x.src.startsWith('data:image/'))].slice(0,5);
 if(!entries.length)return <Media b={b} editorMode={editorMode}/>;
 return <div data-pf-field={editorMode?"items":undefined} className="pf4-gallery">{entries.map((entry,i)=><figure className={`pf4-gallery-card pf4-gallery-card-${i}`} key={`${i}-${entry.src}`}><img src={safeUrl(entry.src)} alt={entry.label} loading="lazy"/><figcaption><span>{entry.label}</span><span>↗</span></figcaption></figure>)}</div>;
}
function Section({b,index,siteId,publicMode,editorMode,selectedBlockId,onMoveBlock,blockCount,isAether}:{b:Block;index:number;siteId?:string;publicMode?:boolean;editorMode?:boolean;selectedBlockId?:string;onMoveBlock?:(blockId:string,direction:-1|1)=>void;blockCount:number;isAether:boolean}){
 const visual=b.kind==='hero'||b.kind==='split';
 const skipAetherVisualMedia=isAether&&visual;
 return <section id={b.kind==='contact'?'contact':b.kind==='gallery'?'gallery':b.kind==='features'?'features':b.id} data-pf-block={editorMode?b.id:undefined} data-recipe={b.recipe||'classic'} data-index={index} className={`render-section pf-section pf4-section kind-${b.kind} align-${b.align} pf-section-${index%3} ${editorMode&&selectedBlockId===b.id?"pf7-canvas-selected":""}`} style={{...(b.background?{background:b.background}:{}),...(b.foreground?{color:b.foreground}:{}),'--radius':'16px'} as React.CSSProperties}>
 {editorMode&&onMoveBlock&&<div className="pf16-canvas-tools" data-pf-canvas-control="true" role="toolbar" aria-label={`Reorder ${b.kind} section`}><span className="pf16-canvas-grip">{String(index+1).padStart(2,'0')} · {b.kind}</span><button type="button" disabled={index===0} aria-label={`Move ${b.kind} section up`} title="Move section up" onClick={e=>{e.preventDefault();e.stopPropagation();onMoveBlock(b.id,-1)}}>↑</button><button type="button" disabled={index===blockCount-1} aria-label={`Move ${b.kind} section down`} title="Move section down" onClick={e=>{e.preventDefault();e.stopPropagation();onMoveBlock(b.id,1)}}>↓</button></div>}
  <div className="render-inner pf-inner pf4-inner">
 {b.kind==='footer'?<><div className="pf-footer-top"><span className="pf-footer-mark">✳</span><span>DESIGN THAT LEAVES A MARK</span></div><Copy b={b} editorMode={editorMode}/><div className="pf-footer-bottom"><span>© {new Date().getFullYear()} · {b.title}</span><span>MADE WITH INTENTION</span></div></>:
 b.kind==='faq'?<><Copy b={b} editorMode={editorMode}/><div data-pf-field={editorMode?"items":undefined} className="faq-list pf-faq">{b.items.filter(Boolean).map((it,i)=>{const[q,a]=it.split('|');return <details key={i}><summary><span>{q}</span><span className="pf-faq-plus">+</span></summary><p>{a||'Contact us to learn more.'}</p></details>})}</div></>:
 b.kind==='contact'?<><Copy b={b} editorMode={editorMode}/><Contact siteId={siteId} publicMode={publicMode}/></>:
 b.kind==='gallery'?<><Copy b={b} editorMode={editorMode}/><Gallery b={b} editorMode={editorMode}/></>:
 <><Copy b={b} siteId={siteId} publicMode={publicMode} editorMode={editorMode} typing={isAether&&b.kind==='hero'&&!editorMode}/>{visual?(skipAetherVisualMedia?null:<Media b={b} editorMode={editorMode}/>):['features','stats','testimonials','pricing'].includes(b.kind)?<Tiles b={b} editorMode={editorMode}/>:null}</>}
 </div><span className="pf-section-watermark" aria-hidden="true">{String(index+1).padStart(2,'0')}</span></section>;
}
export function Renderer({blocks,theme,siteId,publicMode,editorMode,selectedBlockId,onMoveBlock}:Props){
 const direction=directionOf(theme);const active=blocks.filter(b=>b.enabled);const title=active.find(b=>b.kind==='footer')?.title||'STUDIO';const first=active.find(b=>b.kind==='hero');
 return <div className={`render-root pf-site pf-dir-${direction} pf4-site pf6-site pf6-${({cinematic:"tech",luxury:"fashion",bold:"studio",organic:"architecture",product:"commerce",editorial:"architecture"} as Record<string,string>)[direction]||"tech"}`} style={{'--pf-brand':theme.primary,'--pf-page-bg':theme.surface,'--pf-page-fg':theme.text,'--pf-round':`${theme.radius}px`,'--pf-font':theme.font} as React.CSSProperties}>
 <header className="pf4-nav"><a href="#top" className="pf4-logo"><span className="pf4-logo-mark">✳</span>{title}</a><nav aria-label="Page navigation"><a href="#features">Overview</a><a href="#gallery">Projects</a><a href="#contact">Contact</a></nav><a className="pf4-nav-cta" href="#contact">Let's talk <span>↗</span></a></header>
 <main id="top">{active.map((b,i)=><Section key={b.id} b={b} index={i} siteId={siteId} publicMode={publicMode} editorMode={editorMode} selectedBlockId={selectedBlockId} onMoveBlock={onMoveBlock} blockCount={active.length} isAether={direction==='cinematic'}/>)}</main>
 {first&&<a href="#contact" className="pf4-mobile-contact" aria-label="Go to contact">Contact ↗</a>}
 </div>;
}
export function RenderSnapshot({snapshot,site}:{snapshot:PublishedSnapshot;site:Site}){return <Renderer blocks={snapshot.blocks} theme={snapshot.theme} siteId={site.id} publicMode/>;}
