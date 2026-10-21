import {useEffect,useState} from 'react';
import type {Store} from './types';
import {readStore} from './local';

export function useStore(){const [store,setStore]=useState<Store>(readStore);useEffect(()=>{const refresh=()=>setStore(readStore());window.addEventListener('pageforge:change',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('pageforge:change',refresh);window.removeEventListener('storage',refresh)}},[]);return store;}
