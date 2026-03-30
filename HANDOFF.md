# GlobeMind — Session Handoff
Last updated: 2026-03-29

---

## Where We Are
Phase 1 MVP is complete. All 9 must-have items from the PRD are built. The app is ready for a first round of testing.

---

## Before You Test

- Run `npx expo start` from `globemind/app/`
- To test lives refill quickly, change `REFILL_MS` in `stores/playerStore.ts` to `60_000`. There is a comment marking exactly where. **Change it back before shipping.**
- To test onboarding again after completing it: clear AsyncStorage, or uninstall/reinstall the Expo Go app.

---

## Files to Reference

| File | Purpose |
|---|---|
| `PRD.md` | Updated with full build status, known gaps, and recommended next priorities |
| `TESTPLAN.md` | 57 test cases with a tracker table — work through top to bottom |
| `HANDOFF.md` | This file |

---

## Top 3 Things to Build Next (after testing)

1. **Expand to 50 levels** — pure data work in `data/levels.ts` + `POS` array. No new components needed.
2. **Wire Miles stamps** to real `playerStore.miles` milestones — `miles.tsx` UI is already done, just needs the logic.
3. **RevenueCat** — wire the paywall "Get Premium" button to an actual subscription.

---

## Known Things to Watch For During Testing

- If onboarding appears on every launch during dev, `hasOnboarded` isn't being set — check AsyncStorage permissions or Expo Go sandbox behaviour.
- If lives don't persist after app restart, confirm `@react-native-async-storage/async-storage` is installed (`npx expo install @react-native-async-storage/async-storage`).
