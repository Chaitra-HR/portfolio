import type { ReactNode } from 'react';
import { SmartLink } from '../../components/ui/SmartLink';
import type { SideProject } from '../../data/projects';
import { cx } from '../../lib/cx';
import { workArt } from '../../work';
import s from './Home.module.css';

interface SideProjectCardProps {
  project: SideProject;
  on: boolean;
  onHover: (slug: string) => void;
  onLeave: () => void;
}

/** Side project card. Links out when the project has an `href`; otherwise it is focusable so the gist still updates. */
export function SideProjectCard({ project, on, onHover, onLeave }: SideProjectCardProps) {
  const Cover = workArt[project.slug]?.Cover;
  const hover = () => onHover(project.slug);
  const props = { className: cx(s.spc, on && s.on), onMouseEnter: hover, onFocus: hover, onMouseLeave: onLeave, onBlur: onLeave, 'data-cursor-tooltip': 'View' };

  const body: ReactNode = (
    <>
      {/* the media panel: the project's colour, edge to edge */}
      <span className={s.spi} style={{ background: project.color }}>
        <span className={s.shot}>
          {Cover && <Cover />}
        </span>
      </span>
      <p className={s.spt}>
        {project.title} <span>· {project.role}</span>
      </p>
      <p className={s.spd}>{project.description}</p>
      <span className={s.chips}>
        {project.chips.map((chip) => (
          <span key={chip} className={s.chip}>
            {chip}
          </span>
        ))}
      </span>
    </>
  );

  return project.href ? (
    <SmartLink href={project.href} {...props}>
      {body}
    </SmartLink>
  ) : (
    <div tabIndex={0} {...props}>
      {body}
    </div>
  );
}
