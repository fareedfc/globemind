# ThinkPop — Session Handoff
Last updated: 2026-03-30

---

## Where We Are
Phase 1 MVP is complete. All 4 games are playable. The app boots correctly in Expo Go (SDK 54). Landing and Auth screens are live. Ready for testing.

---

## Recent Changes (2026-03-30)

### App Rename
- **GlobeMind → ThinkPop** across all files, copy, and store persist keys
- Store persist keys updated: `thinkpop-player`, `thinkpop-progress`, `thinkpop-brain`, `thinkpop-auth`

### Visual Redesign
- Background color changed from deep purple (#1F0A3C) to **deep ocean blue (#0B1D3A)**; secondary bg is now `#1A3A5C`
- Level node size increased from 64px → **80px** bubbles
- All primary buttons now use **LinearGradient (#FFAA00 → #FF8C00)** instead of flat gold
- **Confetti particles** added to WinScreen: 10 emoji particles burst on win
- **Bouncy spring tap animations** added to all choice buttons in Logic, Speed, and Pattern games

### New Screens
- `app/landing.tsx` — new entry/lobby screen shown after onboarding and on every subsequent app open. Shows animated globe, "Train your brain. Travel the world." headline, game chips (Memory/Speed/Logic/Pattern), **Play** button → Journey tab, **Track Progress** button → auth screen (or brain tab if logged in)
- `app/auth.tsx` — email login/signup screen with toggle between modes, shake animation on error, "Continue without account" option

### New Auth Store
- `stores/authStore.ts` — Zustand persisted store for local auth state: `isLoggedIn`, `email`, `name`. Persist key: `thinkpop-auth`. Structured to swap in Supabase with minimal changes.

### Routing Changes
- `index.tsx` now routes to `/landing` (not `/(tabs)/journey`) after onboarding check
- Onboarding `finish()` navigates to `/landing` (not `/(tabs)/journey`)

### Brain Tab Updates
- **Focus domain removed** — no longer shown in the Brain tab (was "coming soon", game was never built)
- **Sign-in banner added** for guest users: gradient banner "Save your progress · Sign In →" tapping goes to `/auth`
- **Account row added** for logged-in users: shows "Signed in as [name]" + Log out link

### Scoring System
- Score metric is now **Miles** (not "Brain Score")
- Miles earned per star: 1⭐ = 150, 2⭐ = 300, 3⭐ = 500
- Win screen shows miles counter animating up, "+N Miles ✈️" badge

### Earlier Changes (still in effect)
- **Word Builder removed** — replaced with **Odd One Out (Logic game)**
  - Game file: `app/game/logic.tsx`
  - Data file: `data/oddOneSets.ts` (20 puzzle sets, expand to 50+)
  - Level type `'word'` renamed to `'logic'` throughout codebase
- **Domain names simplified**:
  - Working Memory → **Memory**
  - Processing Speed → **Speed**
  - Verbal Fluency → **Logic**
  - Pattern Recognition → **Pattern**
  - Attention & Focus → removed from Brain tab
- **"Cognitive" language removed** everywhere — replaced with brain training / wellness framing

---

## Before You Test
- Run `npx expo start` from `globemind/app/`
- Scan QR with Camera app (not Expo Go scanner) on same WiFi
- If you see the developer menu, tap X or swipe down to dismiss — app is running behind it
- **The entry point is now the Landing screen** — you will see the globe/game chips lobby before reaching the Journey tab
- To test lives refill quickly, change `REFILL_MS` in `stores/playerStore.ts` to `60_000`. Comment marks exactly where. **Change it back before shipping.**
- To test onboarding again: uninstall/reinstall Expo Go (clears AsyncStorage)
- To test guest vs logged-in Brain tab states: use "Continue without account" on auth screen for guest, or sign up for logged-in view

---

## Files to Reference

| File | Purpose |
|---|---|
| `PRD.md` | Full build status, known gaps, and next priorities |
| `TESTPLAN.md` | Test cases — work through top to bottom |
| `HANDOFF.md` | This file |
| `app/landing.tsx` | New entry/lobby screen |
| `app/auth.tsx` | Email login/signup screen |
| `stores/authStore.ts` | Auth state store (local, Supabase-ready) |
| `app/(tabs)/brain.tsx` | Brain dashboard — guest banner + account row |
| `components/games/WinScreen.tsx` | Confetti particles + miles counter animation |

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
- Auth store is local only — sign-in state will not persist across device reinstalls until Supabase is wired in.
