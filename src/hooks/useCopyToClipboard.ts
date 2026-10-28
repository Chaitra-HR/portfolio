import { useCallback, useEffect, useRef, useState } from 'react';

/** Copies text and reports `copied` for a moment, as the footers' email button does. */
export function useCopyToClipboard(resetMs = 1800): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    (text: string) => {
      const done = () => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), resetMs);
      };
      try {
        navigator.clipboard.writeText(text).then(done, done);
      } catch {
        done();
      }
    },
    [resetMs],
  );

  return [copied, copy];
}
