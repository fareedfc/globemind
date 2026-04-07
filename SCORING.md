# ThinkPop Scoring Model

## Overview

Points scale with level difficulty and star rating. The goal is to make progress through the map feel rewarding, and to give players a meaningful reason to replay levels for a higher star rating.

---

## Points Formula

```
base  = 50 + (levelId × 5)
raw   = base × starMultiplier
final = raw × clearBonus
```

### Base points by level

| Level | Base pts |
|-------|----------|
| 1     | 55       |
| 10    | 100      |
| 25    | 175      |
| 50    | 300      |
| 75    | 425      |
| 101   | 555      |

### Star multipliers

| Stars | Multiplier | Description          |
|-------|------------|----------------------|
| ⭐    | ×1.0       | Barely made it       |
| ⭐⭐  | ×1.4       | Ok                   |
| ⭐⭐⭐ | ×1.8      | Solid                |
| ⭐⭐⭐⭐ | ×2.3    | Excellent            |
| ⭐⭐⭐⭐⭐ | ×3.0  | Flawless — worth chasing |

### Clear bonuses / replay caps

| Situation              | Modifier             |
|------------------------|----------------------|
| First clear            | ×1.5 (new territory) |
| Replay after 7+ days   | ×1.0 (full points)   |
| Replay within 7 days   | ×0.75                |
| Replay within 24h      | ×0.25, min 25 pts    |

### Example points

| Level | Stars | First clear? | Points |
|-------|-------|--------------|--------|
| 1     | ⭐    | ✅           | 82     |
| 1     | ⭐⭐⭐⭐⭐ | ✅      | 247    |
| 10    | ⭐⭐⭐ | ✅           | 270    |
| 10    | ⭐⭐⭐⭐⭐ | ✅      | 450    |
| 50    | ⭐⭐⭐ | ✅           | 810    |
| 50    | ⭐⭐⭐⭐⭐ | ✅      | 1,350  |
| 101   | ⭐⭐⭐⭐⭐ | ✅      | 2,497  |

**Perfect run** (all 101 levels, ⭐⭐⭐⭐⭐ first clear) ≈ **~140,000 pts**

---

## Star Thresholds Per Game

### Memory Match
Based on wrong flips vs total pairs on the board.

| Stars | Condition |
|-------|-----------|
| ⭐⭐⭐⭐⭐ | 0 wrong flips (flawless) |
| ⭐⭐⭐⭐ | 1–2 wrong flips |
| ⭐⭐⭐ | Wrong flips ≤ total pairs |
| ⭐⭐ | Wrong flips ≤ 2× total pairs |
| ⭐ | Completed with many mistakes |

### Logic (Odd One Out) & Pattern Pulse
Based on correct answers out of 7 rounds.

| Stars | Correct / 7 |
|-------|-------------|
| ⭐⭐⭐⭐⭐ | 7 / 7 — perfect |
| ⭐⭐⭐⭐ | 6 / 7 |
| ⭐⭐⭐ | 5 / 7 |
| ⭐⭐ | 4 / 7 |
| ⭐ | 3 / 7 — survived |

### Speed Match
Based on total points scored in the 30-second window (includes combo multiplier).

| Stars | Score threshold |
|-------|----------------|
| ⭐⭐⭐⭐⭐ | > 300 pts |
| ⭐⭐⭐⭐ | > 200 pts |
| ⭐⭐⭐ | > 100 pts |
| ⭐⭐ | > 50 pts  |
| ⭐ | ≤ 50 pts  |

---

## Strength % (Domain Bars)

Separate from points — controls the domain bars on the Stats tab.

| Situation | Strength gain |
|-----------|---------------|
| Replay within 24h | +0% (no grinding) |
| Replay within 7 days | +1% |
| First clear or replay after 7+ days | Tiered by level + stars |

### Tiered max % gain by level

| Level range | Max gain (3⭐) |
|-------------|----------------|
| 1–10        | 5%             |
| 11–20       | 7%             |
| 21–30       | 8%             |
| 31–40       | 10%            |
| 41+         | 12%            |

Star scaling within tier: 5⭐ = 100%, 4⭐ = 80%, 3⭐ = 60%, 2⭐ = 40%, 1⭐ = 20% of tier max.

---

## Design Intent

- **Level scaling** makes late-game levels feel meaningfully more valuable
- **5-star spread (×1.0 → ×3.0)** gives players a strong reason to replay for perfection
- **First clear bonus** rewards exploration and forward progress
- **Replay caps** prevent score inflation from grinding the same easy level
- **Strength % is separate** from score so the domain bars reflect skill, not just time played
