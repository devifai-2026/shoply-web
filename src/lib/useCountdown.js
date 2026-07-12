import { useState, useEffect, startTransition } from 'react';

export function useCountdown(endsAt) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!endsAt) return;

    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      startTransition(() => {
        if (diff <= 0) { setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); return; }
        const hours   = Math.floor(diff / 3_600_000);
        const minutes = Math.floor((diff % 3_600_000) / 60_000);
        const seconds = Math.floor((diff % 60_000) / 1_000);
        setTimeLeft({ hours, minutes, seconds });
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return timeLeft;
}
