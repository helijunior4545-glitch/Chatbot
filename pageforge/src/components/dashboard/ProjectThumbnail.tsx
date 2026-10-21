import {useEffect, useRef, useState} from 'react';
import type {Site} from '../../lib/types';

/** Preview with a stable virtual viewport: scales to the actual card width.
 * The rendered page width stays consistent between grid and list views.
 */
export function ProjectThumbnail({site}: {site: Site}) {
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const measure = () => setWidth(Math.max(1, node.getBoundingClientRect().width));
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const viewportWidth = 1280;
  const scale = width > 0 ? width / viewportWidth : 0;
  return <div ref={frame} className="pf-dash-thumb-stage" style={{visibility: width > 0 ? "visible" : "hidden"}}>
    <iframe
      title={`Thumbnail of ${site.name}`}
      src={`/preview/${site.id}?mini=1`}
      tabIndex={-1}
      loading="lazy"
      aria-hidden="true"
      scrolling="no"
      style={{width: viewportWidth, height: 720, transform: `scale(${scale})`}}
    />
  </div>;
}
