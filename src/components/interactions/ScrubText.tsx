import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import s from './ScrubText.module.css';

/** Wraps every word (including inside <b>, <a>…) in a span useScrub can group into lines. */
function split(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (typeof child === 'string') {
      return child.split(/(\s+)/).map((part, i) =>
        part === '' || /^\s+$/.test(part) ? (
          part
        ) : (
          <span key={i} data-w="" className={s.w}>
            {part}
          </span>
        ),
      );
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children !== undefined) {
      return cloneElement(child, undefined, split(child.props.children));
    }
    return child;
  });
}

/** Text whose lines rise in one after another as it scrolls into view (use inside `data-scrub="lines"`). */
export function ScrubText({ children }: { children: ReactNode }) {
  return <>{split(children)}</>;
}
