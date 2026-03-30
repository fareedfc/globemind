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
