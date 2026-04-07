export const MILES_PER_STAR: Record<number, number> = { 1: 150, 2: 300, 3: 500 };

export function calcMemoryStars(wrongFlips: number, totalPairs: number): number {
  if (wrongFlips === 0) return 3;
  if (wrongFlips <= totalPairs) return 2;
  return 1;
}

export function calcWordStars(score: number): number {
  if (score >= 350) return 3;
  if (score >= 200) return 2;
  return 1;
}

export function calcSpeedStars(score: number): number {
  if (score > 200) return 3;
  if (score > 100) return 2;
  return 1;
}

export function calcLogicStars(correct: number): number {
  if (correct >= 6) return 3;
  if (correct >= 4) return 2;
  return 1;
}

export function calcPatternStars(correct: number): number {
  if (correct >= 6) return 3;
  if (correct >= 4) return 2;
  return 1;
}

// Max strength % gain for a perfect 3-star clear, by level tier
function levelTierMax(levelId: number): number {
  if (levelId <= 10) return 5;
  if (levelId <= 20) return 7;
  if (levelId <= 30) return 8;
  if (levelId <= 40) return 10;
  return 12;
}

/**
 * How much strength % to award after completing a level.
 * - First clear or replay after 7+ days → full tiered reward
 * - Replay within 7 days → flat +1%
 * - Replay within 24h → 0% (grinding the same level is worthless)
 */
export function calcStrengthDelta(
  stars: number,
  levelId: number,
  isFirstClear: boolean,
  lastPlayedAt?: number,
): number {
  const now = Date.now();
  const hoursSince = lastPlayedAt != null ? (now - lastPlayedAt) / (1000 * 60 * 60) : Infinity;

  if (!isFirstClear && hoursSince < 24) return 0;
  if (!isFirstClear && hoursSince < 168) return 1;

  const max = levelTierMax(levelId);
  const multiplier = stars === 3 ? 1.0 : stars === 2 ? 0.6 : 0.35;
  return Math.max(1, Math.round(max * multiplier));
}

/**
 * Points to award — reduced for recent replays.
 */
export function calcActualPoints(
  stars: number,
  isFirstClear: boolean,
  lastPlayedAt?: number,
): number {
  const base = MILES_PER_STAR[stars] ?? 150;
  const now = Date.now();
  const hoursSince = lastPlayedAt != null ? (now - lastPlayedAt) / (1000 * 60 * 60) : Infinity;

  if (!isFirstClear && hoursSince < 24) return 50;
  if (!isFirstClear && hoursSince < 168) return 100;
  return base;
}
