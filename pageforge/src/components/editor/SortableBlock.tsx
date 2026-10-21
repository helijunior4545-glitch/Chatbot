import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {GripVertical} from 'lucide-react';
import type {Block} from '../../lib/types';

/** One draggable row of the "Page structure" list. */
export function SortableBlock({block,selected,onSelect}:{block:Block;selected:boolean;onSelect:()=>void}){
 const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useSortable({id:block.id});
 return <div ref={setNodeRef} style={{transform:CSS.Transform.toString(transform),transition,opacity:isDragging?.5:1}} className={`layer ${selected?'selected':''}`}>
  <button className="drag" {...attributes} {...listeners} aria-label="Drag block"><GripVertical size={16}/></button>
  <button className="layer-label" onClick={onSelect}><span>{block.kind}</span><strong>{block.title}</strong></button>
 </div>;
}
