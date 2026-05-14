import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { usePlayerStore, MAX_LIVES } from '../stores/playerStore';

export function useLives() {
  const { lives, nextRefillAt, refillLive, checkDailyLivesReset } = usePlayerStore();
  const [, setTick] = useState(0); // triggers re-render for countdown display

  useEffect(() => {
    checkDailyLivesReset();

    // Re-check whenever app comes back to foreground
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') checkDailyLivesReset();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (lives >= MAX_LIVES || !nextRefillAt) return;

    const interval = setInterval(() => {
      if (Date.now() >= nextRefillAt) {
        refillLive();
      } else {
        setTick((t) => t + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lives, nextRefillAt]);

  const msRemaining = nextRefillAt ? Math.max(0, nextRefillAt - Date.now()) : 0;
  const mins = Math.floor(msRemaining / 60_000);
  const secs = Math.floor((msRemaining % 60_000) / 1000);
  const timeUntilNext =
    lives < MAX_LIVES && msRemaining > 0
      ? `${mins}:${secs.toString().padStart(2, '0')}`
      : null;

  return { lives, timeUntilNext, isFull: lives >= MAX_LIVES };
}
