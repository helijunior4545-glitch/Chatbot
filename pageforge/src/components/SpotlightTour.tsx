import {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowLeft, ArrowRight, X, Sparkles} from 'lucide-react';
import '../styles/pages/spotlight-tour.css';

type Rect = {top:number;left:number;width:number;height:number};
type Step = {selector:string;eyebrow:string;title:string;description:string};
const STEPS:Step[] = [
  {selector:'.pf-dash-hero',eyebrow:'01 / INTRODUCTION',title:'Welcome to PageForge.',description:'Your workspace for designing, refining, and publishing exceptional websites.'},
  {selector:'.pf-dash-hero-actions',eyebrow:'02 / CREATE',title:'Bring an idea to life.',description:'Create a new website or start with a carefully crafted template.'},
  {selector:'.pf-dash-workspace',eyebrow:'03 / ORGANIZE',title:'Everything in its place.',description:'Switch between workspaces and keep your projects organized.'},
  {selector:'.pf-dash-stats',eyebrow:'04 / OVERVIEW',title:'See the bigger picture.',description:'Review published sites, activity, and leads at a glance.'},
  {selector:'.pf-dash-projects',eyebrow:'05 / PROJECTS',title:'Pick up where you left off.',description:'Search, manage, and open any project in your visual editor.'},
  {selector:'.pf-dash-templates',eyebrow:'06 / TEMPLATES',title:'Design without starting over.',description:'Explore premium templates and make every detail your own.'},
];
const KEY='pageforge-spotlight-tour-v15-seen';
const emptyRect:Rect={top:0,left:0,width:0,height:0};
export function SpotlightTour(){
  const [active,setActive]=useState(false);
  const [step,setStep]=useState(0);
  const [rect,setRect]=useState<Rect>(emptyRect);
  const [tip,setTip]=useState({top:0,left:0});
  const [ready,setReady]=useState(false);
  const [invite,setInvite]=useState(false);
  const tipRef=useRef<HTMLDivElement>(null);
  const focusRef=useRef<HTMLButtonElement>(null);
  const previousFocus=useRef<HTMLElement|null>(null);
  const start=useCallback(()=>{
    previousFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
    setInvite(false);setStep(0);setReady(false);setActive(true);
    try{localStorage.setItem(KEY,'1')}catch{}
  },[]);
  const close=useCallback(()=>{setActive(false);setReady(false);previousFocus.current?.focus()},[]);
  useEffect(()=>{
    const launch=()=>start();window.addEventListener('pageforge:start-tour',launch);
    try{if(localStorage.getItem(KEY)!=='1')setInvite(true)}catch{}
    return()=>window.removeEventListener('pageforge:start-tour',launch);
  },[start]);
  useEffect(()=>{
    if(!active)return;
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();close()}
      if(e.key==='ArrowRight'){e.preventDefault();setStep(s=>Math.min(s+1,STEPS.length-1))}
      if(e.key==='ArrowLeft'){e.preventDefault();setStep(s=>Math.max(s-1,0))}
      if(e.key==='Tab'){
        const buttons=tipRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
        if(!buttons?.length)return;
        const first=buttons[0],last=buttons[buttons.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    };
    document.addEventListener('keydown',onKey);
    return()=>document.removeEventListener('keydown',onKey);
  },[active,close]);
  useEffect(()=>{
    if(!active)return;
    let frame=0;
    const target=document.querySelector<HTMLElement>(STEPS[step].selector);
    if(!target){setReady(false);return;}
    setReady(false);
    target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
    const update=()=>{
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        const r=target.getBoundingClientRect(),pad=7;
        const top=Math.max(8,r.top-pad),left=Math.max(8,r.left-pad);
        const width=Math.max(0,Math.min(window.innerWidth-left-8,r.width+pad*2));
        const height=Math.max(0,Math.min(window.innerHeight-top-8,r.height+pad*2));
        setRect({top,left,width,height});
        const tw=Math.min(344,window.innerWidth-32),th=tipRef.current?.offsetHeight||205;
        const below=r.bottom+20;
        const y=below+th+16<=window.innerHeight?below:Math.max(16,r.top-th-20);
        setTip({top:Math.max(16,Math.min(window.innerHeight-th-16,y)),left:Math.max(16,Math.min(window.innerWidth-tw-16,r.left))});
        setReady(true);
      });
    };
    update();const resize=new ResizeObserver(update);resize.observe(target);
    window.addEventListener('resize',update);window.addEventListener('scroll',update,true);
    const settle=window.setTimeout(update,450);
    return()=>{cancelAnimationFrame(frame);resize.disconnect();clearTimeout(settle);window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true)};
  },[active,step]);
  useEffect(()=>{if(active&&ready)focusRef.current?.focus()},[active,ready,step]);
  return <>
    {invite&&!active&&<div className="pf15-invite" role="region" aria-label="Guided introduction"><span className="pf15-invite-mark"><Sparkles size={17}/></span><div><strong>A quick introduction?</strong><small>Discover PageForge in 60 seconds.</small></div><button type="button" onClick={start}>Start tour <ArrowRight size={14}/></button><button type="button" className="pf15-invite-dismiss" aria-label="Dismiss introduction" onClick={()=>{setInvite(false);try{localStorage.setItem(KEY,'1')}catch{}}}><X size={15}/></button></div>}
    {active&&createPortal(<div className="pf15-tour-root" role="presentation">
      <div className="pf15-tour-shade" onClick={close} aria-hidden="true" style={ready?{clipPath:`polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${rect.left}px ${rect.top}px, ${rect.left}px ${rect.top+rect.height}px, ${rect.left+rect.width}px ${rect.top+rect.height}px, ${rect.left+rect.width}px ${rect.top}px, ${rect.left}px ${rect.top}px)`}:undefined}/>
      {ready&&<div className="pf15-tour-spotlight" style={{top:rect.top,left:rect.left,width:rect.width,height:rect.height}} aria-hidden="true"/>}
      {ready&&<div className="pf15-tour-tip" ref={tipRef} role="dialog" aria-modal="true" aria-labelledby="pf15-tour-title" aria-describedby="pf15-tour-description" style={{top:tip.top,left:tip.left}}>
        <div className="pf15-tour-top"><span>{STEPS[step].eyebrow}</span><button type="button" aria-label="Close tour" onClick={close}><X size={16}/></button></div>
        <h2 id="pf15-tour-title">{STEPS[step].title}</h2><p id="pf15-tour-description">{STEPS[step].description}</p>
        <div className="pf15-tour-footer"><span className="pf15-tour-progress">{String(step+1).padStart(2,'0')} <i>/</i> {String(STEPS.length).padStart(2,'0')}</span><div className="pf15-tour-controls"><button type="button" onClick={close}>Skip</button><button type="button" disabled={step===0} onClick={()=>setStep(s=>s-1)} aria-label="Previous step"><ArrowLeft size={15}/></button><button ref={focusRef} type="button" className="pf15-tour-next" onClick={()=>step===STEPS.length-1?close():setStep(s=>s+1)}>{step===STEPS.length-1?'Finish':'Next'} <ArrowRight size={15}/></button></div></div>
      </div>}
    </div>,document.body)}
  </>;
}
