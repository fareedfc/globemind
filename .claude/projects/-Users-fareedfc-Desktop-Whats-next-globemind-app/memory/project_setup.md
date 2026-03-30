---
name: GlobeMind App Setup
description: Stack, folder structure, porting status, design tokens, what's built vs not
type: project
---

## Tech Stack
- React Native + Expo SDK 54, expo-router v6 (file-based routing, `app/` dir)
- react-native-reanimated v4 (LevelNode animations)
- react-native-svg (PathSVG bezier path)
- expo-linear-gradient (bubble gradients)
- Zustand v5 + persist middleware + AsyncStorage (@react-native-async-storage/async-storage)
- @expo-google-fonts/nunito (400Regular / 700Bold / 800ExtraBold / 900Black)
- `"main": "expo-router/entry"` in package.json
- babel.config.js has `react-native-reanimated/plugin`

## Design Tokens (constants/colors.ts)
bg=#1a1a2e, bg2=#16213e, gold=#FFD166, gold2=#FFAA00, teal=#06D6A0, coral=#EF476F, purple=#9B5DE5, blue=#118AB2, white=#FFFFFF, muted=rgba(255,255,255,0.45)

## What's Built (Phase 1 MVP — complete as of 2026-03-29)
- `app/(tabs)/journey.tsx` — zigzag path, level modal, live state from progressStore, lives gate
- `app/(tabs)/brain.tsx` — live domain bars, weekly delta, coach tip, percentile
- `app/(tabs)/miles.tsx` — UI complete, stamps static (not wired to miles milestones yet)
- `app/game/memory.tsx` — Memory Match, wrongFlips tracking, star rating
- `app/game/word.tsx` — Word Builder, 5 words to win, star rating
- `app/game/speed.tsx` — Speed Match, 30s timer, combo multiplier, star rating
- `app/game/pattern.tsx` — Pattern Pulse, 7 rounds, async sequence, star rating
- `app/paywall.tsx` — lives gate, countdown timer, premium CTA placeholder
- `app/onboarding/index.tsx` — 3 slides + animated baseline reveal, sets hasOnboarded
- `components/games/WinScreen.tsx` — stars anim, score counter, brain insight, calls addScore/addMiles/completeLevel/recordGame/recordPlay
- `stores/playerStore.ts` — score/lives/streak/miles + useLive/refillLive/recordPlay + REFILL_MS
- `stores/progressStore.ts` — currentLevelId/completions/completeLevel (best-stars)
- `stores/brainStore.ts` — domain scores (memory/word/speed/pattern) + recordGame + weekly snapshot
- `hooks/useLives.ts` — 1s interval refill timer, returns lives + timeUntilNext
- `data/levels.ts` — 15 levels + POS zigzag coords
- `data/brainInsights.ts` — 4 insights per domain + pickInsight()
- `utils/scoring.ts` — calcMemoryStars / calcWordStars / calcSpeedStars / calcPatternStars

## Known Gaps / Next Priorities
1. Journey only has 15 levels — PRD target is 50. Expand data/levels.ts + POS array.
2. Miles tab stamps are static — need to wire to playerStore.miles milestones.
3. RevenueCat not integrated — paywall CTA is placeholder.
4. No game fail states — lives deducted on play start, not on fail.
5. Attention & Focus game mode not built (5th domain shows "Coming soon").
6. TESTING TIP: change REFILL_MS in playerStore.ts to 60_000 to test lives refill in 1 min.

## Key Files
- PRD: `/Users/fareedfc/Desktop/Whats_next/globemind/PRD.md`
- Test plan: `/Users/fareedfc/Desktop/Whats_next/globemind/TESTPLAN.md`
- App root: `/Users/fareedfc/Desktop/Whats_next/globemind/app/`
