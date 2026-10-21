import type {Block,BlockKind} from './types';
export type FieldKind='text'|'textarea'|'url'|'color'|'select'|'range'|'list';
export type FieldSpec={key:keyof Block;label:string;kind:FieldKind;min?:number;max?:number;options?:{value:string;label:string}[]};
export type SectionSpec={kind:BlockKind;name:string;description:string;fields:FieldSpec[];recipes:{value:string;label:string}[]};
const common:FieldSpec[]=[{key:'title',label:'Title',kind:'text'},{key:'subtitle',label:'Subtitle',kind:'textarea'},{key:'body',label:'Description',kind:'textarea'}];
const action:FieldSpec[]=[{key:'buttonText',label:'Button text',kind:'text'},{key:'buttonUrl',label:'Button destination',kind:'url'}];
const media:FieldSpec[]=[{key:'image',label:'Hero background image (URL)',kind:'url'}];
const items:FieldSpec[]=[{key:'items',label:'Items (one per line; title|description)',kind:'list'}];
const visual:FieldSpec[]=[{key:'background',label:'Section background',kind:'color'},{key:'foreground',label:'Section text',kind:'color'},{key:'align',label:'Alignment',kind:'select',options:[{value:'left',label:'Left'},{value:'center',label:'Center'}]}];
const specs:{kind:BlockKind;name:string;description:string;recipes:string[];fields:FieldSpec[]}[]=[
 {kind:'hero',name:'Cover',description:'A powerful first impression',recipes:['product-stage','immersive-cover','type-monument','editorial-split','classic'],fields:[...common,...action,...media]},
 {kind:'features',name:'Benefits',description:'Features and advantages',recipes:['bento','classic'],fields:[...common,...items]},
 {kind:'split',name:'Editorial',description:'Visual storytelling with imagery',recipes:['editorial-split','immersive-cover','classic'],fields:[...common,...action,...media]},
 {kind:'stats',name:'Indicators',description:'Figures and proof points',recipes:['proof-strip','classic'],fields:[...common,...items]},
 {kind:'testimonials',name:'Testimonials',description:'Social proof',recipes:['quote-wall','classic'],fields:[...common,...items]},
 {kind:'pricing',name:'Planos',description:'Offers and conversion',recipes:['pricing-premium','classic'],fields:[...common,...items,...action]},
 {kind:'faq',name:'Questions',description:'Questions and answers',recipes:['faq-editorial','classic'],fields:[...common,...items]},
 {kind:'cta',name:'Call to action',description:'Conversion and action',recipes:['immersive-cta','classic'],fields:[...common,...action]},
 {kind:'gallery',name:'Gallery',description:'Projects and imagery',recipes:['gallery-mosaic','classic'],fields:[...common,...media,...items]},
 {kind:'contact',name:'Contact',description:'Capture interest',recipes:['contact-premium','classic'],fields:common},
 {kind:'footer',name:'Footer',description:'Closing and branding',recipes:['footer-signature','classic'],fields:common}
];
export const sectionRegistry:Record<BlockKind,SectionSpec>=Object.fromEntries(specs.map(s=>[s.kind,{...s,recipes:s.recipes.map(r=>({value:r,label:r.replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase())})),fields:[...s.fields,...visual]}])) as Record<BlockKind,SectionSpec>;
export function sanitizeBlockField(block:Block,key:keyof Block,value:string):Block{
 if(key==='items')return {...block,items:value.split('\n').slice(0,40).map(x=>x.slice(0,600))};
 if(key==='align')return {...block,align:value==='center'?'center':'left'};
 if(key==='background'||key==='foreground')return {...block,[key]:/^#[0-9a-f]{6}$/i.test(value)?value:''};
 if(key==='buttonUrl'||key==='image')return {...block,[key]:value.slice(0,4000)};
 if(key==='recipe')return {...block,recipe:value.slice(0,80)};
 if(['title','subtitle','body','buttonText'].includes(key))return {...block,[key]:value.slice(0,8000)};
 return block;
}
