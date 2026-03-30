# GlobeMind — Session Handoff
Last updated: 2026-03-30

---

## Where We Are
Phase 1 MVP is complete. All 4 games are playable. The app boots correctly in Expo Go (SDK 54). Ready for testing.

---

## Recent Changes (2026-03-30)

### Startup fixes
- Added `app/index.tsx` as the proper expo-router entry point — routes to onboarding or journey based on AsyncStorage
- Fixed `_layout.tsx` to wait for navigator ready before calling `router.replace`
- Removed `react-native-reanimated` (incompatible with Expo Go SDK 54) — replaced with React Native built-in `Animated` in `LevelNode.tsx`
- Added missing `babel-preset-expo` devDependency

### Product changes
- **Word Builder removed** — replaced with **Odd One Out (Logic game)**
  - New game file: `app/game/logic.tsx`
  - New data file: `data/oddOneSets.ts` (20 puzzle sets, expand to 50+)
  - Level type `'word'` renamed to `'logic'` throughout codebase
- **Domain names simplified** — no more nerdy labels:
  - Working Memory → **Memory**
  - Processing Speed → **Speed**
  - Verbal Fluency → **Logic**
  - Pattern Recognition → **Pattern**
  - Attention & Focus → **Focus** (still coming soon)
- **"Cognitive" language removed** everywhere — replaced with brain training / wellness framing
  - Brain tab section: "Brain Training Areas" (was "Cognitive Domains")
  - Onboarding copy updated
  - All brain insights reworded

---

## Before You Test
- Run `npx expo start` from `globemind/app/`
- Scan QR with Camera app (not Expo Go scanner) on same WiFi
- If you see the developer menu, tap X or swipe down to dismiss — app is running behind it
- To test lives refill quickly, change `REFILL_MS` in `stores/playerStore.ts` to `60_000`. Comment marks exactly where. **Change it back before shipping.**
- To test onboarding again: uninstall/reinstall Expo Go (clears AsyncStorage)

---

## Files to Reference

| File | Purpose |
|---|---|
| `PRD.md` | Full build status, known gaps, and next priorities |
| `TESTPLAN.md` | 57 test cases — work through top to bottom |
| `HANDOFF.md` | This file |

---

## Top 3 Things to Build Next (after testing)

1. **Expand to 50 levels** — pure data work in `data/levels.ts` + `POS` array. No new components needed.
2. **Expand Odd One Out sets** — currently 20 sets in `data/oddOneSets.ts`, grow to 50+ for variety.
3. **Wire Miles stamps** to real `playerStore.miles` milestones — `miles.tsx` UI is already done, just needs the logic.

---

## Known Things to Watch For During Testing

- If onboarding appears on every launch during dev, `hasOnboarded` isn't being set — check AsyncStorage permissions or Expo Go sandbox behaviour.
- If lives don't persist after app restart, confirm `@react-native-async-storage/async-storage` is installed (`npx expo install @react-native-async-storage/async-storage`).
- `word.tsx` still exists in `app/game/` but is dead code — no levels route to it. Safe to delete later.
