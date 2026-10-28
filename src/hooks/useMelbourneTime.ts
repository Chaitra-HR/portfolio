import { useEffect, useState } from 'react';

export interface MelbourneTime {
  /** "4:51" */
  hm: string;
  /** "07" */
  ss: string;
  /** "PM" */
  ap: string;
}

const formatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Melbourne',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

function read(): MelbourneTime {
  const parts: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of formatter.formatToParts(new Date())) parts[part.type] = part.value;
  return {
    hm: `${parts.hour}:${parts.minute}`,
    ss: parts.second ?? '00',
    ap: (parts.dayPeriod ?? '').toUpperCase(),
  };
}

/** Live Melbourne time. Home ticks every 15s, the footers every second. */
export function useMelbourneTime(intervalMs: number): MelbourneTime {
  const [time, setTime] = useState(read);

  useEffect(() => {
    setTime(read());
    const timer = window.setInterval(() => setTime(read()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return time;
}
