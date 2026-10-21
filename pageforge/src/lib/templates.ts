import type {Block,BlockKind,Site,Theme} from './types';
import {makeBlock} from './factory';
import {themeForDirection,type DesignDirection} from './design';

export type PremiumTemplate='technology'|'signature'|'creative'|'impact'|'commerce';
export const premiumTemplates:{id:PremiumTemplate;name:string;category:string;description:string;direction:DesignDirection;preview:string}[]=[
 {id:'technology',name:'Aether — Technology',category:'SaaS / Artificial intelligence',description:'Product interface, cinematic depth, and conversion.',direction:'cinematic',preview:'linear-gradient(145deg,#080b14aa,#36326955),url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=650&q=75)'},
 {id:'signature',name:'ÉDIT — Fashion Editorial',category:'Fashion / Campaigns',description:'Campaign photography, layered typography, and editorial rhythm.',direction:'luxury',preview:'linear-gradient(145deg,#d7e55a55,#d7e55a22),url(https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=650&q=75)'},
 {id:'creative',name:'MAY — Experimental Studio',category:'Agencies / Portfolios',description:'Immersive photography, distinctive navigation, and asymmetrical composition.',direction:'bold',preview:'linear-gradient(145deg,#07141a88,#f2633e22),url(https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=650&q=75)'},
 {id:'impact',name:'MONO — Architecture',category:'Architecture / Interiors',description:'Editorial serif typography, negative space, and architectural photography.',direction:'organic',preview:'linear-gradient(145deg,#f4eee633,#98836d22),url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=650&q=75)'},
 {id:'commerce',name:'NOVA — Commerce',category:'Commerce / Services',description:'Clear value proposition, social proof, and commercial conversion.',direction:'product',preview:'linear-gradient(145deg,#dce9f755,#92bad833),url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=650&q=75)'},
];
const photo={
 tech:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=85',
 tech2:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1500&q=85',
 architecture:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1800&q=85',
 architecture2:'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=85',
 architecture3:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=85',
 creative:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=85',
 creative2:'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=1600&q=85',
 creative3:'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=85',
 impact:'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=1800&q=85',
 impact2:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=85',
 commerce:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1800&q=85',
 commerce2:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=85',
};
type Seed={kind:BlockKind;recipe:string;title:string;subtitle?:string;body?:string;image?:string;buttonText?:string;buttonUrl?:string;items?:string[]};
const seeds:Record<PremiumTemplate,Seed[]>={
 technology:[
  {kind:'hero',recipe:'product-stage',title:'Intelligence, beautifully engineered.',subtitle:'A new dimension of digital possibility.',body:'Bring your systems, people and ideas into one beautifully connected experience.',image:photo.tech,buttonText:'Explore the platform',buttonUrl:'#features',items:['Unified platform','Built to evolve']},
  {kind:'stats',recipe:'proof-strip',title:'Results that inspire confidence.',subtitle:'Built for teams that never stop evolving.',items:['99.9%|Projected uptime*','24/7|Seamless experience','1 place|For your entire operation'],body:'*Illustrative template figures. Replace with verified data before publishing.'},
  {kind:'features',recipe:'bento',title:'Everything connected. Everything simpler.',subtitle:'An experience designed down to the smallest detail.',items:['01|Smart workflows that adapt to your work.','02|End-to-end visibility in one intuitive dashboard.','03|More time to create, less time managing.','04|Scalability for whatever comes next.']},
  {kind:'split',recipe:'editorial-split',title:'Clarity for extraordinary decisions.',subtitle:'Turn information into direction.',body:'See what matters with an experience designed to bring focus, context, and speed to everyday decisions.',image:photo.tech2,buttonText:'Explore features',buttonUrl:'#contact'},
  {kind:'testimonials',recipe:'quote-wall',title:'Designed for ambitious thinkers.',subtitle:'A new way to shape the next chapter.',items:['“Finally, everything makes sense in one place.”|Sample testimonial — replace with a genuine review','“The right experience changes how a team works.”|Sample testimonial — replace before publishing']},
  {kind:'pricing',recipe:'pricing-premium',title:'The right plan for your next chapter.',subtitle:'Start simple. Grow at your own pace.',items:['Essential|The essentials to get started with confidence.','Professional|More possibilities for growing teams.','Enterprise|An experience tailored to your needs.'],buttonText:'Talk to an expert',buttonUrl:'#contact'},
  {kind:'faq',recipe:'faq-editorial',title:'Questions deserve clear answers.',items:['Can I customize the platform?|Yes. This is a sample answer; tailor it to your product.','Is support available?|Replace this with your actual support channels and hours.','How do I get started?|Describe your onboarding or activation process.']},
  {kind:'cta',recipe:'immersive-cta',title:'Your next big step starts here.',subtitle:'Your best work is yet to come.',buttonText:'Let\'s talk',buttonUrl:'#contact'},
  {kind:'contact',recipe:'contact-premium',title:'Let\'s build what\'s next.',subtitle:'Tell us what you have in mind.',body:'This section collects contacts in the local PageForge demo only.'},
  {kind:'footer',recipe:'footer-signature',title:'AETHER',subtitle:'Ideas that move tomorrow forward.'},
  /* PAGEFORGE V21 SEED aether */
  {kind:'gallery',recipe:'gallery-mosaic',title:'A closer look at what is possible.',subtitle:'Designed for the details that matter.',image:photo.tech2,items:[`${photo.tech}|The connected experience`,`${photo.tech2}|Insights at a glance`]},

 ],
 signature:[
  {kind:'hero',recipe:'immersive-cover',title:'The art of being unforgettable.',subtitle:'Spring Collection — a new expression.',body:'A campaign of shape, movement, and attitude. Discover a visual story that turns every detail into identity.',image:'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1800&q=85',buttonText:'Explore the collection',buttonUrl:'#gallery'},
  {kind:'split',recipe:'editorial-split',title:'Presence. Movement. Contrast.',subtitle:'The power of a silhouette.',body:'Pieces that express personality with freedom and elegance.',image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=85',buttonText:'Discover the story',buttonUrl:'#gallery'},
  {kind:'gallery',recipe:'gallery-mosaic',title:'A look at the collection.',subtitle:'Editorial / 2026',image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=85',items:['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=85|Style in motion','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=85|Portraits','https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=85|New perspective']},
  {kind:'features',recipe:'bento',title:'Made to leave a mark.',items:['01|Identity','02|Expression','03|Freedom']},
  {kind:'cta',recipe:'immersive-cta',title:'Discover your next chapter.',subtitle:'A new way to express yourself.',buttonText:'Contact the studio',buttonUrl:'#contact'},
  {kind:'contact',recipe:'contact-premium',title:'Get in touch.',subtitle:'One conversation can start it all.'},
  {kind:'footer',recipe:'footer-signature',title:'ÉDIT',subtitle:'An editorial vision.'}
 ],
 creative:[
  {kind:'hero',recipe:'type-monument',title:'Ordinary ideas don\'t change the world.',subtitle:'We create what doesn\'t exist yet.',body:'Strategy, design, and technology for brands born to stand out.',image:photo.creative,buttonText:'Explore our work',buttonUrl:'#gallery'},
  {kind:'features',recipe:'bento',title:'We don\'t follow formulas. We create new ones.',subtitle:'From the first insight to the final detail.',items:['Strategy|Positioning that makes sense and stands out.','Identity|Visual systems with personality.','Experience|Interfaces that connect people and brands.','Digital|Products that turn ideas into results.']},
  {kind:'gallery',recipe:'gallery-mosaic',title:'Work that speaks for itself.',subtitle:'Selected projects / 2026',image:photo.creative2,items:[`${photo.creative}|Identity`,`${photo.creative3}|Experience`,`${photo.creative2}|Art direction`]},
  {kind:'split',recipe:'editorial-split',title:'Boldness with purpose.',subtitle:'Design is a decision, not decoration.',body:'Every project starts with a better question. The result combines clarity, impact, and originality.',image:photo.creative3,buttonText:'Our process',buttonUrl:'#contact'},
  {kind:'stats',recipe:'proof-strip',title:'Creativity in motion.',items:['01|Original thinking','02|Thoughtful execution','03|Lasting impact']},
  {kind:'cta',recipe:'immersive-cta',title:'Let\'s create something impossible to ignore.',subtitle:'The next project starts here.',buttonText:'Contact the studio',buttonUrl:'#contact'},
  {kind:'contact',recipe:'contact-premium',title:'Have an idea? We\'d love to hear it.',subtitle:'Great projects start with great conversations.'},
  {kind:'footer',recipe:'footer-signature',title:'FORMA',subtitle:'Independent by nature.'}
 ],
 impact:[
  {kind:'hero',recipe:'editorial-split',title:'Spaces that make you feel.',subtitle:'Architecture, light, and material.',body:'We create places to live, reflect, and belong. Every project starts with listening.',image:photo.architecture,buttonText:'Explore projects',buttonUrl:'#gallery'},
  {kind:'split',recipe:'editorial-split',title:'The beauty of essentials.',subtitle:'Form and silence.',body:'Honest materials, thoughtful proportions, and a deep connection to the landscape.',image:photo.architecture2,buttonText:'Our approach',buttonUrl:'#contact'},
  {kind:'gallery',recipe:'gallery-mosaic',title:'Selected projects.',subtitle:'A portfolio in progress.',image:photo.architecture3,items:['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1400&q=85|Residence 01','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&q=85|Interiors 02']},
  {kind:'features',recipe:'bento',title:'The way we think.',items:['01|Listening and context','02|Detail and materiality','03|Spaces for people']},
  {kind:'cta',recipe:'immersive-cta',title:'Your next space starts here.',subtitle:'Let\'s design a new story.',buttonText:'Start a conversation',buttonUrl:'#contact'},
  {kind:'contact',recipe:'contact-premium',title:'Tell us about your project.',subtitle:'We\'d love to talk.'},
  {kind:'footer',recipe:'footer-signature',title:'MONO',subtitle:'Architecture & interiors.'}
 ],
 commerce:[
  {kind:'hero',recipe:'product-stage',title:'More value in every experience.',subtitle:'A new way to do business.',body:'Thoughtful solutions that simplify decisions, connect people, and build lasting relationships.',image:photo.commerce,buttonText:'Explore our solutions',buttonUrl:'#features'},
  {kind:'stats',recipe:'proof-strip',title:'Commitment in every detail.',items:['01|Intuitive experience','02|Personal support','03|Quality comes first'],body:'Replace sample claims with verifiable evidence.'},
  {kind:'features',recipe:'bento',title:'Everything that matters, right where it belongs.',subtitle:'Solutions built for the real world.',items:['Agility|A simpler journey from start to finish.','Clarity|Accessible information for better decisions.','Trust|A consistent experience at every touchpoint.','Growth|A foundation ready for new possibilities.']},
  {kind:'split',recipe:'editorial-split',title:'Technology with commercial purpose.',subtitle:'From first contact to the next milestone.',body:'Every detail is designed to reduce friction and create meaningful customer experiences.',image:photo.commerce2,buttonText:'Talk to an expert',buttonUrl:'#contact'},
  {kind:'pricing',recipe:'pricing-premium',title:'A solution for every stage.',items:['Essential|For those ready to get off to a great start.','Professional|For teams ready to go further.','Tailored|For operations that need extra attention.'],buttonText:'Request a proposal',buttonUrl:'#contact'},
  {kind:'faq',recipe:'faq-editorial',title:'Everything clear from the start.',items:['How do I sign up?|Describe your actual sign-up process here.','Can I customize it?|Adapt this answer to your offering.','How does support work?|Provide your actual support channels and hours.']},
  {kind:'cta',recipe:'immersive-cta',title:'Let\'s build your next success.',subtitle:'Your next opportunity starts with a conversation.',buttonText:'Request contact',buttonUrl:'#contact'},
  {kind:'contact',recipe:'contact-premium',title:'Tell us what you\'re looking for.',subtitle:'We\'re ready to listen.'},
  {kind:'footer',recipe:'footer-signature',title:'VERTEX',subtitle:'Experiences that bring people together.'}
 ]
};
export function premiumBlocks(template:PremiumTemplate):Block[]{return seeds[template].map(s=>({...makeBlock(s.kind),...s,items:s.items||[],background:'',foreground:'',align:'left'}));}
export function premiumTheme(template:PremiumTemplate,base:Theme):Theme{return themeForDirection(base,premiumTemplates.find(t=>t.id===template)!.direction);}
export function applyPremiumTemplate(site:Site,template:PremiumTemplate,replaceContent:boolean):Site{
 const blocks=premiumBlocks(template);
 return {...site,theme:premiumTheme(template,site.theme),blocks:replaceContent?blocks:site.blocks.map((b,i)=>({...b,recipe:blocks.find(x=>x.kind===b.kind)?.recipe||b.recipe||'',...(i===0?{recipe:blocks[0].recipe}:{})})),updatedAt:new Date().toISOString()};
}
