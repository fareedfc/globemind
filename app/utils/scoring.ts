// ─── Star calculators (1–5) ───────────────────────────────────────────────────

/** Memory: based on wrong flips vs total pairs */
export function calcMemoryStars(wrongFlips: number, totalPairs: number): number {
  if (wrongFlips === 0)               return 5; // flawless
  if (wrongFlips <= 2)                return 4; // excellent
  if (wrongFlips <= totalPairs)       return 3; // solid
  if (wrongFlips <= totalPairs * 2)   return 2; // ok
  return 1;                                      // barely made it
}

/** Speed: based on points scored in the 30s window */
export function calcSpeedStars(score: number): number {
  if (score > 300) return 5;
  if (score > 200) return 4;
  if (score > 100) return 3;
  if (score > 50)  return 2;
  return 1;
}

/** Logic: based on correct answers out of 7 rounds */
export function calcLogicStars(correct: number): number {
  if (correct === 7) return 5;
  if (correct === 6) return 4;
  if (correct === 5) return 3;
  if (correct === 4) return 2;
  return 1;
}

/** Pattern: based on correct answers out of 7 rounds */
export function calcPatternStars(correct: number): number {
  if (correct === 7) return 5;
  if (correct === 6) return 4;
  if (correct === 5) return 3;
  if (correct === 4) return 2;
  return 1;
}

// ─── Level-scaled points ─────────────────────────────────────────────────────

/**
 * Base points for a level before star multiplier.
 * Scales linearly: Level 1 = 55pts, Level 50 = 300pts, Level 101 = 555pts.
 */
export function calcLevelBase(levelId: number): number {
  return 50 + levelId * 5;
}

const STAR_MULTIPLIER: Record<number, number> = {
  1: 1.0,  // barely made it
  2: 1.4,  // ok
  3: 1.8,  // solid
  4: 2.3,  // excellent
  5: 3.0,  // flawless — worth chasing
};

/**
 * Points awarded after completing a level.
 *
 * Formula:
 *   base = 50 + (levelId × 5)
 *   raw  = base × starMultiplier
 *
 * Bonuses / caps:
 *   First clear            → raw × 1.5  (new territory bonus)
 *   Replay after 7+ days   → raw         (full points, keep grinding)
 *   Replay within 7 days   → raw × 0.75  (mild diminishing return)
 *   Replay within 24h      → raw × 0.25, min 25  (anti-grind cap)
 *
 * Examples:
 *   Level 1,   1⭐, first clear  →  82 pts
 *   Level 1,   3⭐, first clear  → 165 pts
 *   Level 10,  3⭐, first clear  → 300 pts
 *   Level 50,  3⭐, first clear  → 900 pts
 *   Level 101, 3⭐, first clear  → 1,665 pts
 *   Perfect run (all 101 levels, 3⭐ first clear) → ~92,400 pts total
 */
export function calcActualPoints(
  stars: number,
  levelId: number,
  isFirstClear: boolean,
  lastPlayedAt?: number,
): number {
  const base = calcLevelBase(levelId);
  const raw  = Math.round(base * (STAR_MULTIPLIER[stars] ?? 1.0));

  if (isFirstClear) return Math.round(raw * 1.5);

  const hoursSince = lastPlayedAt != null
    ? (Date.now() - lastPlayedAt) / (1000 * 60 * 60)
    : Infinity;

  if (hoursSince < 24)  return Math.max(25, Math.round(raw * 0.25));
  if (hoursSince < 168) return Math.round(raw * 0.75);
  return raw;
}

// ─── Strength % gain ─────────────────────────────────────────────────────────

function levelTierMax(levelId: number): number {
  if (levelId <= 10)  return 5;
  if (levelId <= 20)  return 7;
  if (levelId <= 30)  return 8;
  if (levelId <= 40)  return 10;
  return 12;
}

export function calcStrengthDelta(
  stars: number,
  levelId: number,
  isFirstClear: boolean,
  lastPlayedAt?: number,
): number {
  const hoursSince = lastPlayedAt != null
    ? (Date.now() - lastPlayedAt) / (1000 * 60 * 60)
    : Infinity;

  if (!isFirstClear && hoursSince < 24)  return 0;
  if (!isFirstClear && hoursSince < 168) return 1;

  const max = levelTierMax(levelId);
  const multiplier =
    stars === 5 ? 1.0 :
    stars === 4 ? 0.8 :
    stars === 3 ? 0.6 :
    stars === 2 ? 0.4 : 0.2;
  return Math.max(1, Math.round(max * multiplier));
}
