import { useEffect, useState } from 'react';

interface MelbourneTime {
  /** "4:51" */
  hm: string;
  /** "PM" */
  ap: string;
}

const formatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Melbourne',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

function read(): MelbourneTime {
  const parts: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of formatter.formatToParts(new Date())) parts[part.type] = part.value;
  return {
    hm: `${parts.hour}:${parts.minute}`,
    ap: (parts.dayPeriod ?? '').toUpperCase(),
  };
}

/** Live Melbourne time. */
export function useMelbourneTime(intervalMs: number): MelbourneTime {
  const [time, setTime] = useState(read);

  useEffect(() => {
    setTime(read());
    const timer = window.setInterval(() => setTime(read()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return time;
}
