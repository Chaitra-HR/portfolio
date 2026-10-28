import { BentoFooter } from '../../components/layout/BentoFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';
import { usePageMeta } from '../../components/layout/usePageMeta';
import { Pill } from '../../components/ui/Pill';
import { hiringPitch } from '../../data/site';
import s from './NotFound.module.css';

interface NotFoundProps {
  title?: string;
  message?: string;
}

/** Fallback for unknown routes and for projects without a published case study. */
export function NotFound({ title = 'Page not found', message = 'There’s nothing at this address.' }: NotFoundProps) {
  usePageMeta(`${title} · Chaitra Rao`, message);
  return (
    <div className={s.pg}>
      <SiteHeader />
      <main id="main" tabIndex={-1} className={s.body}>
        <h1>{title}</h1>
        <p>{message}</p>
        <Pill fill="grey" href="/#work">
          See the work
        </Pill>
      </main>
      <BentoFooter
        className={s.footer}
        heading={hiringPitch.heading}
        body={hiringPitch.body}
      />
    </div>
  );
}
