# ThinkPop — Session Handoff
Last updated: 2026-04-01 (session 2)

---

## Where We Are
Phase 1 MVP is complete. All 4 games are playable. 50 levels built. Level transition screen added. Score/POP! branding consistent throughout. Pattern sets expanded to 60+ rounds. Memory emoji sets expanded to 18 themed sets (9 emoji each, supporting up to 9 pairs on boss levels). Passport/stamps feature removed from scope. Ready for TestFlight.

---

## Recent Changes (2026-04-01, session 2)

### Data Expansion
- `data/patternSets.ts` expanded **10 → 60+ rounds** covering AB, AAB, ABC, ABBA, longer-ABC(7) patterns across nature, food, animals, weather, space, sports, ocean themes
- `data/memoryEmojis.ts` expanded **3 → 18 themed sets**, each with **9 emoji** (was 6) — supports up to 9 pairs on boss levels
- `memory.tsx` pair count cap raised **6 → 9** to match level descriptions (`Math.min(3 + Math.floor(levelId/2.5), 9)`)

### Passport/Stamps Removed
- Feature dropped from scope entirely
- `miles.tsx` still exists as a file but is not referenced in navigation or docs
- All passport/stamp/miles-tab references removed from CLAUDE.md, PRD.md, HANDOFF.md, TESTPLAN.md

---

## Earlier Changes (2026-04-01, session 1)

### Landing Screen Polish
- ThinkPop logo moved from left-aligned → **centred**
- 4 rotating category cards made **lighter** (pastel tints washed out further)

### Level Expansion — 15 → 50 Levels
- `data/levels.ts` extended to **50 levels** across 5 worlds
- Boss levels at 10 (Memory), 20 (Speed), 30 (Memory), 40 (Speed), 50 (Memory — Final Boss)
- `PATH_HEIGHT` in `constants/config.ts` updated **1800 → 6000** to maintain consistent ~110px node spacing
- All 50 `POS` entries recomputed as fractions of new PATH_HEIGHT
- `PathSVG.tsx` and `LevelNode.tsx` pick up the new values automatically

### Odd One Out Expansion — 20 → 55 Sets
- `data/oddOneSets.ts` extended from 20 → **55 puzzle sets**
- New categories: pets, winter symbols, plants, gaming, drinks, dog family, buildings, English-speaking countries, natural elements, sweet treats, two-wheelers, computing, big cats, citrus, hats, water sports, flowers (round 2), birds (round 2), emergency vehicles, body parts, beach, study tools, exercise, cooking vessels, cold things, reptiles, Asian countries, furniture, space

### Level Transition Screen — NEW
- New file: `app/transition.tsx`
- Shown after "Back to Journey" on the win screen (when a next level exists)
- **Flow**: Win screen → `/transition?levelId=X` → Journey tab
- **Animation sequence**:
  1. Mini path scene shows: completed level node (gold) + next level node (teal) connected by dashed bezier
  2. ⭐ marker travels from node A → node B (1.1s cubic easing + `useNativeDriver: true`)
  3. Haptic fires on arrival; next node springs in (0 → 1.3 → 1) + glow pulse starts
  4. "Level N Unlocked!" label springs in with domain + description
  5. "Continue to Journey →" button appears
- Node x-positions use real `POS` fractions so the layout mirrors the actual journey path
- `WinScreen.tsx` — "Back to Journey" button now routes to `/transition?levelId=X` when next level exists; falls back to `onExit()` on final level (50)

### Speed Game Card Fix
- **Bug**: Option cards appeared as narrow vertical strips
- **Root cause**: `width: '30%'` was on `Animated.View` (child of `TouchableOpacity`), so the percentage resolved relative to the `TouchableOpacity`'s unconstrained width (~0)
- **Fix**: Swapped order — `Animated.View` is now the outermost element (direct flex child of the grid), `TouchableOpacity` is nested inside with `width: '100%'`

---

## Earlier Changes (still in effect, from previous session)

### Branding — GlobeMind → ThinkPop, Miles → Score
- All "miles" / "Miles" / ✈️ references replaced with "score" / "pts" / ⭐ throughout
- `playerStore.ts`: `miles` → `score`, `addMiles` → `addScore`
- Win screen badge: "+N pts ⭐" (was "+N Miles ✈️")
- Journey top bar pill: ⭐ score (was ✈️ miles)
- Brain tab: "Total Score ⭐" (was "Miles Traveled ✈️")

### POP! Theme (all 4 games + win screen)
- **Correct answer pop**: spring scale burst (1→1.2→1) + Light haptic on all game choice buttons
- **Wrong answer**: Medium haptic
- **Win screen POP! splash**: "POP! 🎉" springs in, holds 380ms, fades before content reveals
- **Level unlock**: current level node springs in (0→1.25→1) on mount in `LevelNode.tsx`

### Score Metric
- Score earned per star: 1⭐ = 150 pts, 2⭐ = 300 pts, 3⭐ = 500 pts
- Animated counter on win screen counts up old → new total

---

## Before You Test
- Run `npx expo start` from `globemind/app/`
- Scan QR with Camera app on same WiFi
- The entry point is the **Landing screen** — ThinkPop logo (centred), 4 card grid, Play Now / Track Progress
- **Level 4** is the current level (Speed Match) — tap its node to play the first Speed game
- The full path now scrolls through 50 levels
- After completing any level, tapping "Back to Journey" plays the transition animation before returning
- To test lives refill quickly: change `REFILL_MS` in `stores/playerStore.ts` to `60_000`. **Change back before shipping.**
- To test onboarding again: uninstall/reinstall Expo Go (clears AsyncStorage)

---

## Files to Reference

| File | Purpose |
|---|---|
| `PRD.md` | Full build status, requirements, known gaps |
| `TESTPLAN.md` | Manual test cases — work top to bottom |
| `HANDOFF.md` | This file |
| `app/landing.tsx` | Entry lobby — centred logo, SVG card grid |
| `app/transition.tsx` | Level transition screen — NEW |
| `components/games/WinScreen.tsx` | POP! splash, score counter, transition routing |
| `data/levels.ts` | 50 levels + 50 POS coordinates (PATH_HEIGHT=6000) |
| `data/oddOneSets.ts` | 55 Odd One Out puzzle sets |
| `data/patternSets.ts` | 60+ Pattern rounds (expanded) |
| `data/memoryEmojis.ts` | 18 themed Memory sets, 9 emoji each (expanded) |
| `constants/config.ts` | PATH_HEIGHT=6000, NODE_SIZE=64 |
| `app/game/speed.tsx` | Fixed card layout (Animated.View wraps TouchableOpacity) |
| `stores/playerStore.ts` | score, lives, streak — change REFILL_MS for testing |

---

## Top 3 Things to Build Next

1. **Lives-on-failure** — currently a life is deducted only on Play Now; should also deduct when a player loses or exits mid-game.
2. **Difficulty curve review** — walk all 50 levels and verify pair counts / game variety feel appropriately graduated (especially boss levels expecting 9 pairs).
3. **RevenueCat integration** — wire the paywall "Get Premium" button to start generating revenue before scaling.

---

## Known Things to Watch For During Testing

- If onboarding appears on every launch during dev, `hasOnboarded` isn't being set — check AsyncStorage / Expo Go sandbox.
- If the level transition screen appears but nodes are in unexpected positions, check that `POS[levelId - 1]` and `POS[levelId]` are valid for the level being tested.
- `word.tsx` in `app/game/` is dead code — no levels route to it. Safe to delete.
- `miles.tsx` in `app/(tabs)/` is unused dead code — safe to delete.
- Auth is local only — sign-in state won't persist across device reinstalls until Supabase is wired.
- Journey path now scrolls significantly longer (PATH_HEIGHT=6000) — test scroll performance on older devices.
- Boss levels (10, 20, 30, 40, 50) use Memory game with 9 pairs — verify the 4-column grid renders cleanly on small screens.
