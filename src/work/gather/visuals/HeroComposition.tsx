import { useLayoutEffect, useRef } from 'react';
import { AdvisorScreen, GatewayScreen, InvestmentsScreen } from '../product/Product';
import s from './HeroComposition.module.css';

/** Visual 01. The three parts of the product, layered like one flow. */
export function HeroComposition() {
  const stage = useRef<HTMLDivElement>(null);
  // the picture was composed at 592px wide and .48: hold that ratio at any width
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => el.style.setProperty('--s', String((el.clientWidth / 592) * 0.48));
    fit();
    const watch = new ResizeObserver(fit);
    watch.observe(el);
    return () => watch.disconnect();
  }, []);
  return (
    <div ref={stage} className={s.stage}>
      <div className={s.a}>
        <GatewayScreen />
      </div>
      <div className={s.c}>
        <AdvisorScreen slim />
      </div>
      <div className={s.b}>
        <InvestmentsScreen slim />
      </div>
    </div>
  );
}
