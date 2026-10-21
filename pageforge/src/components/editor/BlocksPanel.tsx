import {DndContext,PointerSensor,KeyboardSensor,useSensor,useSensors,closestCenter,type DragEndEvent} from '@dnd-kit/core';
import {SortableContext,verticalListSortingStrategy,arrayMove,sortableKeyboardCoordinates} from '@dnd-kit/sortable';
import {Plus} from 'lucide-react';
import type {Block,Site} from '../../lib/types';
import {catalog} from '../../lib/factory';
import {SortableBlock} from './SortableBlock';
import type {ApplySiteChange} from './types';

type Props={site:Site;selectedId:string;apply:ApplySiteChange;onSelectBlock:(id:string)=>void;onAddBlock:(kind:Block['kind'])=>void};

/** "Blocks" tab: sortable page structure plus the section catalog. */
export function BlocksPanel({site,selectedId,apply,onSelectBlock,onAddBlock}:Props){
 const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:5}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}));
 const dragEnd=(event:DragEndEvent)=>{
  const {active,over}=event;
  if(!over||active.id===over.id)return;
  apply(s=>{
   const from=s.blocks.findIndex(b=>b.id===active.id);
   const to=s.blocks.findIndex(b=>b.id===over.id);
   return {...s,blocks:arrayMove(s.blocks,from,to)};
  });
 };
 return <>
  <div className="sidebar-heading"><strong>Page structure</strong><small>Drag to reorder</small></div>
  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}>
   <SortableContext items={site.blocks.map(b=>b.id)} strategy={verticalListSortingStrategy}>
    <div className="layers">{site.blocks.map(b=><SortableBlock key={b.id} block={b} selected={selectedId===b.id} onSelect={()=>onSelectBlock(b.id)}/>)}</div>
   </SortableContext>
  </DndContext>
  <div className="sidebar-heading"><strong>Add section</strong></div>
  <div className="catalog">{catalog.map(c=><button key={c.kind} onClick={()=>onAddBlock(c.kind)}><Plus size={15}/><span><strong>{c.name}</strong><small>{c.description}</small></span></button>)}</div>
 </>;
}
