# ThinkPop — Product Requirements Document

## Overview
ThinkPop is a mobile brain training game designed for adults aged 30–70 who want to stay mentally sharp but find existing brain training apps boring and clinical. The name "ThinkPop" drives the product theme: satisfying pop moments, spring animations, and instant gratification on every correct answer.

---

## Problem Statement
Brain training apps exist (Lumosity, BrainHQ, Elevate) but they feel like homework. Casual games exist (Candy Crush) but offer no mental value. ThinkPop sits in the gap: a game that is genuinely fun AND a great mental workout, designed specifically for an older demographic that is ignored by the gaming industry.

**Important positioning note:** ThinkPop is framed as a brain training / wellness tool, not a medical or clinical product. We avoid the term "cognitive" throughout the product — regulators and app stores scrutinise cognitive ability claims for computer games. Our language is warm, wellness-oriented and empowering ("sharpen your mind", "mental fitness", "brain workout").

---

## Goals
1. Build a mobile app (iOS + Android) that feels as polished and addictive as Candy Crush
2. Deliver a genuinely enjoyable mental workout across 4 brain training areas
3. Generate sustainable revenue via freemium + IAP
4. Reach 1M MAU within 18 months of launch

---

## User Stories

### Onboarding
- As a new user, I want a quick (<60 second) onboarding that shows me what the game is and sets my baseline brain score
- As a new user, I want the first 5 levels to feel easy so I build confidence
- As a new user, I want to understand what each game trains without it feeling academic

### Core Loop
- As a player, I want to scroll a beautiful path and tap a level to play
- As a player, I want a bottom sheet to appear with level info before I commit to playing
- As a player, I want to complete a short game (2–5 min) and feel rewarded immediately
- As a player, I want to see my score go up after each session
- As a player, I want a satisfying animation of my player moving to the next level after completing one

### Brain Tracking
- As a player, I want to see a breakdown of my performance across brain training areas
- As a player, I want a weekly report that tells me if I'm improving
- As a player, I want to be told which area needs the most work
- As a player, I want to feel like my progress is meaningful and real

### Rewards & Retention
- As a player, I want a daily streak that motivates me to play every day
- As a player, I want to feel a sense of progression even on short sessions

### Monetisation
- As a free player, I want enough content to evaluate the app before paying
- As a premium player, I want unlimited play and detailed reports
- As a player who runs out of lives, I want a clear and fair way to get more

---

## Functional Requirements

### FR-001: Level Path
- Scrollable zigzag path with **50 levels at launch** (scale to 200+)
- PATH_HEIGHT = 6000px; node positions stored as fractions of (pathWidth, PATH_HEIGHT)
- Each level node shows: emoji icon, star rating (0–3), locked/unlocked/current state — nodes are **64px** bubbles
- Tapping unlocked node opens bottom sheet modal
- Current level has pulsing glow + bob animation
- New current level springs into view on mount (scale 0 → 1.3 → 1)
- Locked levels are dimmed, non-interactive
- Path has decorative scattered emoji in the background
- **5 worlds** of 10 levels each; boss levels at 10, 20, 30, 40, 50

### FR-002: Level Modal
- Slides up from bottom on level tap
- Shows: level number, emoji, brain training area tag, description, Play button, dismiss option
- Dismiss by tapping outside modal or "Maybe later" button

### FR-003: Game Engine — Memory Match
- Grid of face-down cards (emoji on reveal)
- Flip two cards: match = stay revealed, no match = flip back after 900ms delay
- Lock input during flip-back animation
- Difficulty scales with level: Level 1 = 3 pairs (6 cards), Final Boss (Level 50) = 9 pairs (18 cards)
- Pip indicators show pairs found
- Win condition: all pairs matched
- **Pop animation + haptic** on matched pair

### FR-004: Game Engine — Odd One Out (Logic)
- 4 emoji shown in a 2×2 grid
- 3 belong to a group, 1 doesn't — player taps the odd one out
- 8 second answer timer per round
- Correct: pip lights green, brief hint shown ("Not a fruit") + Light haptic
- Wrong: pip lights red, correct answer highlighted, hint shown + Medium haptic
- Time out = treated as wrong answer
- 7 rounds per game; win condition: all 7 rounds complete
- Score = correct_answers × 60; Stars: 3⭐ ≥ 6/7, 2⭐ ≥ 4/7, 1⭐ otherwise
- **Bouncy spring pop animation** on choice button tap

### FR-005: Game Engine — Speed Match
- Target symbol displayed prominently at top
- 6 option symbols in 3×2 grid
- Correct tap: brief green flash, next round in 180ms + Light haptic
- Wrong tap: brief red flash, combo resets + Medium haptic
- Timer: 30 seconds, bar shifts teal → gold → coral
- Combo multiplier: consecutive correct = +5pts per streak level; base = 10pts
- Win condition: timer expires (always completes)
- **Bouncy spring pop animation** on choice button tap
- Card layout uses `Animated.View` as flex child (wraps `TouchableOpacity`) to fix percentage width resolution

### FR-006: Game Engine — Pattern Pulse
- Sequence of 5–7 emoji lights up one at a time (550ms per symbol)
- After sequence: symbols dim, "What comes next?" prompt, 4 choice buttons, 8s timer
- Correct: pip green + Light haptic; Wrong: pip red + Medium haptic; Timeout = wrong
- 7 rounds per game; win condition: all 7 rounds complete
- Score = correct_answers × 60; same star thresholds as Logic
- **Bouncy spring pop animation** on choice button tap

### FR-007: Win Screen
- **POP! splash** fires immediately: "POP! 🎉" springs in (scale 0→1), holds 380ms, fades out 260ms
- Success haptic fires on win; content (stars, score, stats) reveals after POP! fades
- Stars pop in one by one with spring + rotation
- Score counter animates from old total → new total over 1.2s; "+N pts ⭐" badge shown
- Score earned: 1⭐ = 150 pts, 2⭐ = 300 pts, 3⭐ = 500 pts
- 10 emoji confetti particles burst on win
- Brain insight card (domain-relevant, wellness language)
- Stat cards: 3 game-specific metrics
- **Play Again** → replays same level; **Back to Journey** → routes through FR-015 (or Journey if last level)

### FR-008: Brain Dashboard
- Score total: large number, weekly delta ("↑ +N pts this week"), percentile rank vs age group
- **4 training area bars: Memory, Speed, Logic, Pattern**
- Coach Tip: one sentence targeting weakest area
- Day streak card
- **Guest users**: gradient "Save your progress · Sign In →" banner → `/auth`
- **Logged-in users**: account row "Signed in as [name]" + Log out

### FR-009: Lives System
- 5 lives max; lose 1 on Play Now; refill 1 per 30 min
- 0 lives = soft paywall (wait or purchase)

### FR-010: Streak System
- Daily streak increments on ≥1 level completed per calendar day
- Breaks if no play for 24+ hours; shown in top bar and Brain tab

### FR-011: Notifications
- Daily reminder, streak-at-risk, lives-refilled (Expo Notifications — not yet wired)

### FR-012: Landing Screen
- Entry point shown after onboarding and on every app open
- **Centred ThinkPop logo** — dark teal "Think" + coral "Pop", Nunito_900Black, fontSize 58
- Light mint gradient: `['#F0FDF9', '#E8FBF5', '#D4F5EB']`; three decorative blobs
- 4 SVG category cards (Pattern/Memory/Logic/Speed) in loose 2×2 grid; light pastel tints; slow 24s drift rotation + glow pulse
- **Play Now →** (orange gradient) → Journey tab
- **Track Progress** (white semi-transparent) → `/auth` if guest, Brain tab if logged in

### FR-013: Auth Screen
- Email login / signup with toggle; shake animation on error; "Continue without account" (guest)
- Supabase swap-in ready (currently local via authStore)

### FR-014: Level Transition Screen (`app/transition.tsx`)
- Triggered by "Back to Journey" on win screen when next level exists
- Mini path scene: completed level node (gold) + next level node (teal), dashed bezier between them
- Node positions use real POS fractions from `data/levels.ts`
- **⭐ marker** travels from node A to node B (1.1s cubic easing, `useNativeDriver: true`)
- Haptic fires on arrival; next node springs in (0 → 1.3 → 1 scale) + continuous glow pulse
- "Level N Unlocked!" + domain + description animate in; "Continue to Journey →" button springs last
- On last level (50): `onExit()` routes directly to Journey (no transition)

---

## Non-Functional Requirements

### NFR-001: Performance
- Level path renders within 500ms on mid-range Android
- All animations use `useNativeDriver: true`
- No frame drops during card flip or pop animations

### NFR-002: Accessibility
- Minimum font size: 14px body, 18px headings
- Touch targets minimum 44×44px
- No colour-only information encoding

### NFR-003: Offline
- Free tier: online required; Premium: full offline play

### NFR-004: Data
- Brain scores and progress synced to cloud (Phase 2)
- GDPR compliant data handling

---

## Game Content

### Level Rotation
Levels cycle through game types; boss levels fixed at 10/20/30/40/50.
```
World 1 (1–10):   memory, logic, memory, speed, pattern, logic, memory, speed, pattern, memory*
World 2 (11–20):  logic, speed, pattern, memory, logic, speed, pattern, memory, logic, speed*
World 3 (21–30):  pattern, memory, logic, speed, pattern, memory, logic, speed, pattern, memory*
World 4 (31–40):  logic, speed, pattern, memory, logic, speed, pattern, memory, logic, speed*
World 5 (41–50):  pattern, memory, logic, speed, pattern, memory, logic, speed, pattern, memory*
* = boss
```

### Odd One Out Sets — 55 sets ✅
Categories: fruits, animals, transport, landmarks, sea creatures, flowers, instruments, vehicles, sky/space, food, insects, mountains, colours, sweet treats, flags, holidays, physical activity, planets, pets, winter, plants, gaming, drinks, dog family, buildings, natural elements, citrus, hats, water sports, birds, emergency vehicles, body parts, beach, study tools, exercise, cooking, cold things, reptiles, Asian countries, furniture, and more.

### Pattern Types — 60+ rounds ✅
AB repeat, AAB repeat, ABC repeat, ABBA, growing sequence, longer ABC(7) — across nature, food, animals, weather, space, sports, ocean, and more.

### Memory Emoji Sets — 18 themed sets ✅
Landmarks, Travel, Nature, Ocean, Forest, Fruits, Space, Jungle, Food, Weather, Sports, Music, Architecture, Birds, Vehicles, Gems, Insects, Vegetables — each set has 9 emoji (supports up to 9 pairs on boss levels).

---

## Screens / Views

| Screen | File | Status |
|---|---|---|
| Onboarding | `app/onboarding/index.tsx` | ✅ |
| Landing | `app/landing.tsx` | ✅ Centred logo, SVG cards |
| Auth | `app/auth.tsx` | ✅ |
| Journey | `app/(tabs)/journey.tsx` | ✅ 50 levels |
| Level Transition | `app/transition.tsx` | ✅ Marker + unlock animation |
| Game — Memory | `app/game/memory.tsx` | ✅ |
| Game — Logic | `app/game/logic.tsx` | ✅ |
| Game — Speed | `app/game/speed.tsx` | ✅ Card width fix |
| Game — Pattern | `app/game/pattern.tsx` | ✅ |
| Win Screen | `components/games/WinScreen.tsx` | ✅ POP! + score counter |
| Brain Dashboard | `app/(tabs)/brain.tsx` | ✅ |
| Paywall | `app/paywall.tsx` | ✅ Placeholder |

---

## Tech Stack

### Current — React Native + Expo (SDK 54)
- React Native built-in `Animated` API, `useNativeDriver: true` throughout
- Zustand + AsyncStorage for local persistence (4 stores)
- expo-haptics for tactile feedback

### Backend (planned)
- **Supabase**: Auth + Postgres; **RevenueCat**: subscriptions; **Expo Notifications**: push; **PostHog**: analytics

---

## File / Folder Structure

```
thinkpop/
├── CLAUDE.md / PRD.md / HANDOFF.md / TESTPLAN.md
├── app/
│   ├── index.tsx              ← Entry → /landing after onboarding check
│   ├── landing.tsx            ← Entry lobby
│   ├── auth.tsx               ← Login/signup
│   ├── transition.tsx         ← Level transition screen ← NEW
│   ├── (tabs)/
│   │   ├── _layout.tsx        ← Journey + Brain tabs
│   │   ├── journey.tsx        ← 50-level path
│   │   └── brain.tsx          ← Brain dashboard
│   ├── game/
│   │   ├── memory.tsx / logic.tsx / speed.tsx / pattern.tsx
│   ├── paywall.tsx
│   └── onboarding/index.tsx
├── components/
│   ├── path/LevelNode.tsx / PathSVG.tsx
│   ├── games/WinScreen.tsx
│   ├── ui/Pill.tsx
│   └── layout/TopBar.tsx
├── stores/
│   ├── playerStore.ts         ← score, lives, streak
│   ├── progressStore.ts       ← level completions, stars
│   ├── brainStore.ts          ← domain scores
│   └── authStore.ts           ← auth state
├── data/
│   ├── levels.ts              ← 50 levels + 50 POS entries (PATH_HEIGHT=6000)
│   ├── oddOneSets.ts          ← 55 puzzle sets
│   ├── patternSets.ts / memoryEmojis.ts / brainInsights.ts
├── hooks/useLives.ts
├── utils/scoring.ts
└── constants/
    ├── colors.ts
    └── config.ts              ← PATH_HEIGHT=6000, NODE_SIZE=64, MAX_LIVES=5
```

---

## Build Status — Last Updated 2026-04-01

### Phase 1 MVP — COMPLETE ✅
- [x] Onboarding (3 slides + baseline reveal → Landing)
- [x] Landing — centred ThinkPop logo, SVG category cards, drift/glow animation
- [x] Auth — email login/signup, shake on error, guest mode
- [x] Journey — 50 levels, 5 worlds, boss nodes, zigzag path (PATH_HEIGHT=6000)
- [x] All 4 games — Memory, Logic, Speed, Pattern — fully playable
- [x] POP! theme — correct answer spring + haptic in all games; POP! splash on win screen
- [x] Level transition screen — ⭐ marker travel + next level unlock animation
- [x] Win screen — POP! splash, confetti, score counter, "+N pts ⭐" badge
- [x] Brain dashboard — 4 domains, guest banner, account row, coach tip, percentile
- [x] Lives system, streak system, local persistence (4 Zustand stores)
- [x] 55 Odd One Out puzzle sets
- [x] Score metric (replaced miles/✈️ branding throughout)
- [x] Speed game card width bug fixed
- [x] Pattern sets expanded to 60+ rounds
- [x] Memory emoji sets expanded to 18 themed sets (9 emoji each)

### Phase 2 (planned)
- [ ] Supabase cloud sync + real auth
- [ ] RevenueCat subscription
- [ ] Push notifications

---

## Known Gaps / Tech Debt
- Paywall premium CTA **placeholder** — RevenueCat not integrated
- No per-game **failure state** — lives deducted on play start only
- `word.tsx` in `app/game/` is dead code — safe to delete
- Auth is local only — no cross-device continuity until Supabase

---

## Recommended Next Priorities

### Immediate (before TestFlight)
1. **Lives-on-failure** — deduct a life when the player loses/exits mid-game, not only on Play Now
2. **Revise difficulty curve** — verify pair counts and game variety feel right across all 50 levels

### Phase 2 — Revenue & Retention
1. RevenueCat — wire paywall "Get Premium" button
2. Push notifications — Expo Notifications
3. Onboarding paywall — premium upsell post-baseline
4. Supabase — real auth + cloud sync

### Phase 3 — Growth
- Leaderboards, daily challenges, social sharing, referral loop, premium level packs IAP

---

## Success Metrics

| Metric | Target (Month 3) | Target (Month 12) |
|---|---|---|
| DAU | 10,000 | 200,000 |
| D7 Retention | 35% | 45% |
| D30 Retention | 15% | 25% |
| Avg session length | 8 min | 10 min |
| Conversion to premium | 4% | 6% |
| ARPU (monthly) | $0.80 | $1.20 |

---

## Open Questions
1. ~~React Native vs Capacitor~~ — **Decided: React Native + Expo**
2. iOS first or both stores simultaneously?
3. Should the Brain Score algorithm be clinically validated?
4. Partnership with a neuroscientist / university for credibility?
5. A/B test "brain training" vs "wellness game" framing in ads?
6. RevenueCat before or after TestFlight?
