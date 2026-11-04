import archiveStill from '../../../assets/images/points/archive.jpg';
import archive from '../../../assets/images/points/archive.mp4';
import globeStill from '../../../assets/images/points/globe.jpg';
import globe from '../../../assets/images/points/globe.mp4';
import lensStill from '../../../assets/images/points/lens.jpg';
import lens from '../../../assets/images/points/lens.mp4';
import type { ReactNode } from 'react';
import blocksStill from '../../../assets/images/points/blocks.jpg';
import blocks from '../../../assets/images/points/blocks.mp4';
import bubbleStill from '../../../assets/images/points/bubble.jpg';
import bubble from '../../../assets/images/points/bubble.mp4';
import briefcaseStill from '../../../assets/images/points/briefcase.jpg';
import briefcase from '../../../assets/images/points/briefcase.mp4';
import bulbStill from '../../../assets/images/points/bulb.jpg';
import bulb from '../../../assets/images/points/bulb.mp4';
import compassStill from '../../../assets/images/points/compass.jpg';
import compass from '../../../assets/images/points/compass.mp4';
import megaphoneStill from '../../../assets/images/points/megaphone.jpg';
import megaphone from '../../../assets/images/points/megaphone.mp4';
import mirrorStill from '../../../assets/images/points/mirror.jpg';
import mirror from '../../../assets/images/points/mirror.mp4';
import mugsStill from '../../../assets/images/points/mugs.jpg';
import mugs from '../../../assets/images/points/mugs.mp4';
import pawnsStill from '../../../assets/images/points/pawns.jpg';
import pawns from '../../../assets/images/points/pawns.mp4';
import scalesStill from '../../../assets/images/points/scales.jpg';
import scales from '../../../assets/images/points/scales.mp4';
import signpostStill from '../../../assets/images/points/signpost.jpg';
import signpost from '../../../assets/images/points/signpost.mp4';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import p from './PointCards.module.css';

const OBJECTS = {
  archive: [archive, archiveStill],
  globe: [globe, globeStill],
  lens: [lens, lensStill],
  blocks: [blocks, blocksStill],
  briefcase: [briefcase, briefcaseStill],
  bubble: [bubble, bubbleStill],
  bulb: [bulb, bulbStill],
  compass: [compass, compassStill],
  megaphone: [megaphone, megaphoneStill],
  mirror: [mirror, mirrorStill],
  mugs: [mugs, mugsStill],
  pawns: [pawns, pawnsStill],
  scales: [scales, scalesStill],
  signpost: [signpost, signpostStill],
};

interface Point {
  /** The looping object. Without one, the card is its words alone. */
  object?: keyof typeof OBJECTS;
  title: ReactNode;
  body: ReactNode;
}

/** Points on cards, each with a small looping 3D object, after together.agency/careers. Holds on the first frame for reduced motion. */
export function PointCards({ items, list }: { items: Point[]; list?: boolean }) {
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <ul className={list ? `${p.points} ${p.list}` : p.points}>
      {items.map(({ object, title, body }, i) => {
        const [video, poster] = object ? OBJECTS[object] : [];
        return (
          <li key={i} className={p.point}>
            {object && <video key={String(still)} className={p.object} src={video} poster={poster} autoPlay={!still} muted loop playsInline preload="metadata" aria-hidden="true" />}
            <div className={p.words}>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
