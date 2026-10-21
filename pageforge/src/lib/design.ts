import type {Theme} from './types';

export type DesignDirection = 'cinematic'|'editorial'|'luxury'|'bold'|'product'|'organic';
export const designDirections: {id:DesignDirection;name:string;description:string;accent:string}[] = [
  {id:'cinematic',name:'Cinematic Tech',description:'Dark atmosphere, light, and depth',accent:'#a88bff'},
  {id:'editorial',name:'Editorial Studio',description:'Monumental typography and precision',accent:'#181818'},
  {id:'luxury',name:'Luxury Collection',description:'Elegance, imagery, and editorial rhythm',accent:'#b99c6b'},
  {id:'bold',name:'Bold Creative',description:'Contrast and visual energy',accent:'#ff653b'},
  {id:'product',name:'Product Excellence',description:'Clear product design and sophisticated UI',accent:'#3867ff'},
  {id:'organic',name:'Organic Elegance',description:'Calm, materials, and natural tones',accent:'#64836b'},
];
export function directionOf(theme:Theme):DesignDirection {
  const d=theme.direction;
  return designDirections.some(x=>x.id===d)?d as DesignDirection:'cinematic';
}
export function themeForDirection(theme:Theme,d:DesignDirection):Theme {
  const palettes:Record<DesignDirection,Pick<Theme,'primary'|'surface'|'text'|'radius'|'font'>>={
    cinematic:{primary:'#a88bff',surface:'#080b14',text:'#f5f5ff',radius:22,font:'Inter, system-ui, sans-serif'},
    editorial:{primary:'#171717',surface:'#f4f1eb',text:'#191919',radius:5,font:'Arial, Helvetica, sans-serif'},
    luxury:{primary:'#c8aa77',surface:'#151613',text:'#f3eee3',radius:3,font:'Georgia, serif'},
    bold:{primary:'#ff653b',surface:'#171620',text:'#fffaf4',radius:15,font:'Arial, Helvetica, sans-serif'},
    product:{primary:'#4167ff',surface:'#f5f7fd',text:'#171e33',radius:18,font:'Inter, system-ui, sans-serif'},
    organic:{primary:'#66836e',surface:'#f4f1e8',text:'#25372c',radius:20,font:'Georgia, serif'},
  };
  return {...theme,...palettes[d],direction:d};
}
