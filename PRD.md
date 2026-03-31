# ThinkPop — Product Requirements Document

## Overview
ThinkPop is a mobile brain training game disguised as a world travel experience. It targets adults aged 30–70 who want to stay mentally sharp but find existing brain training apps boring and clinical.

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
- As a player, I want to see my miles go up after each session
- As a player, I want to unlock new levels by completing current ones

### Brain Tracking
- As a player, I want to see a breakdown of my performance across brain training areas
- As a player, I want a weekly report that tells me if I'm improving
- As a player, I want to be told which area needs the most work
- As a player, I want to feel like my progress is meaningful and real

### Rewards & Retention
- As a player, I want to earn air miles and passport stamps as I progress
- As a player, I want a daily streak that motivates me to play every day
- As a player, I want to feel a sense of progression even on short sessions
- As a player, I want to share my passport stamps on social media

### Monetisation
- As a free player, I want enough content to evaluate the app before paying
- As a premium player, I want unlimited play and detailed reports
- As a player who runs out of lives, I want a clear and fair way to get more

---

## Functional Requirements

### FR-001: Level Path
- Scrollable zigzag path with minimum 50 levels at launch (scale to 200+)
- Each level node shows: emoji icon, star rating (0–3), locked/unlocked/current state — nodes are **80px** bubbles
- Tapping unlocked node opens bottom sheet modal
- Current level has pulsing glow animation
- Locked levels are dimmed, non-interactive, show lock icon
- Path has decorative scattered travel emoji in the background

### FR-002: Level Modal
- Slides up from bottom on level tap
- Shows: level number, emoji, brain training area tag, description, Play button, dismiss option
- Dismiss by tapping outside modal or "Maybe later" button

### FR-003: Game Engine — Memory Match
- Grid of face-down cards (emoji on reveal)
- Flip two cards: match = stay revealed, no match = flip back after 900ms delay
- Lock input during flip-back animation
- Difficulty scales: Level 1 = 3 pairs (6 cards), max = 6 pairs (12 cards)
- Pip indicators show pairs found
- Win condition: all pairs matched
- Score = pairs × 15 + time bonus

### FR-004: Game Engine — Odd One Out (Logic)
- 4 emoji shown in a 2×2 grid
- 3 belong to a group, 1 doesn't — player taps the odd one out
- 8 second answer timer per round
- Correct: pip lights green, brief hint shown ("Not a fruit")
- Wrong: pip lights red, correct answer highlighted, hint shown
- Time out = treated as wrong answer
- 7 rounds per game
- Win condition: all 7 rounds complete
- Score = correct_answers × 60
- Stars: 3⭐ ≥ 6/7, 2⭐ ≥ 4/7, 1⭐ otherwise
- Choice buttons have bouncy spring tap animations

### FR-005: Game Engine — Speed Match
- Target symbol displayed prominently at top
- 6 option symbols in 3×2 grid
- Tap correct symbol: brief green flash, next round immediately
- Tap wrong symbol: brief red flash, combo resets
- Timer: 30 seconds, bar shrinks and shifts teal→gold→coral
- Combo multiplier: consecutive correct = +5pts per streak level
- Base score per correct: 10pts
- Win condition: timer expires (game always completes)
- New round auto-generates in 180ms after correct tap
- Choice buttons have bouncy spring tap animations

### FR-006: Game Engine — Pattern Pulse
- Sequence of 5–7 emoji lights up one at a time (550ms per symbol)
- After sequence: symbols dim, "What comes next?" prompt appears
- 4 choice buttons shown
- 8 second answer timer
- Correct: pip lights green, brief reveal of full sequence
- Wrong: pip lights red, correct answer highlighted
- Time out = treated as wrong answer
- 7 rounds per game
- Win condition: all 7 rounds complete (regardless of score)
- Score = correct_answers × 60
- Choice buttons have bouncy spring tap animations

### FR-007: Win Screen
- Appears after any game completion
- Shows: emoji celebration, title (score-dependent), subtitle, 3 stat cards, brain insight card
- Brain insight: warm, accessible sentence about the training area (no clinical language)
- Two buttons: Play Again (replays same level) / Back to Journey
- **Confetti particles**: 10 emoji particles burst on win
- **Miles counter animates** up to new total; "+N Miles ✈️" badge shown
- Miles earned per star: 1⭐ = 150 miles, 2⭐ = 300 miles, 3⭐ = 500 miles

### FR-008: Brain Dashboard
- Miles total: large number, weekly delta, percentile rank vs age group
- **4 active training area bars: Memory, Speed, Logic, Pattern** (Focus domain removed)
- Each bar shows percentage fill
- Coach Tip: one sentence targeting weakest area
- Day streak card at bottom
- **Guest users**: gradient sign-in banner "Save your progress · Sign In →" tapping goes to `/auth`
- **Logged-in users**: account row showing "Signed in as [name]" + Log out link

### FR-009: Miles & Passport
- Total air miles counter
- Progress bar to next stamp milestone
- Passport stamp grid (8 stamps, earned by milestones)
- Stamp names: Explorer, Wordsmith, Speedster, Pathfinder, Horizon, Luminary, Voyager, Legend
- Stamps animate when newly earned (stamp-press animation)

### FR-010: Lives System
- 5 lives max
- Lose a life on: tapping Play Now
- Lives refill at 1 per 30 minutes
- 0 lives = soft paywall (wait or purchase)
- Premium users: 8 lives max, faster refill

### FR-011: Streak System
- Daily streak increments when player completes ≥1 level per calendar day
- Streak shown in top bar and Brain tab
- Streak breaks if no play for 24+ hours
- "Streak Shield" purchasable IAP to protect streak

### FR-012: Notifications
- Daily reminder: "Your brain is waiting — 5 minutes today keeps you sharp 🧠"
- Streak at risk: "Don't break your X day streak!"
- New levels unlocked: "5 new adventures just dropped ✈️"
- Lives refilled: "You're back to full health — ready to play?"

### FR-013: Landing Screen
- Shown after onboarding completes and on every app open (entry point)
- Displays: animated globe, "Train your brain. Travel the world." headline, game chips (Memory, Speed, Logic, Pattern)
- **Play** button → navigates to Journey tab
- **Track Progress** button → navigates to `/auth` if guest, or Brain tab if logged in

### FR-014: Auth Screen
- Email login / signup with toggle between modes
- Shake animation on error (wrong password, invalid email)
- "Continue without account" option (guest mode)
- Ready for Supabase swap-in (currently local auth via authStore)

---

## Non-Functional Requirements

### NFR-001: Performance
- Level path renders within 500ms on mid-range Android
- Game transitions < 200ms
- No frame drops during card flip animations

### NFR-002: Accessibility
- Minimum font size: 14px body, 18px headings
- High contrast mode support
- Touch targets minimum 44×44px
- No colour-only information encoding (always paired with shape/text)

### NFR-003: Offline
- Free tier: online required
- Premium tier: full offline play (levels cached locally)

### NFR-004: Data
- Brain scores and progress synced to cloud
- Cross-device continuity for premium users
- GDPR compliant data handling

---

## Game Content Plan

### Level Rotation Pattern (repeating)
```
Memory → Logic → Memory → Speed → Pattern → Logic → Memory → Speed → Pattern → Memory (Boss) → ...
```

### Odd One Out Sets (expand to 50+ sets)
- Currently 20 sets covering: animals, transport, food, nature, landmarks, colours, sports, instruments, space, flags
- Expand with: travel, culture, numbers, shapes, flags, seasons, professions

### Pattern Types (expand to 10+)
- AB repeat, AAB repeat, ABC repeat, ABBA, odd-one-out, growing sequence, mirror sequence

### Memory Emoji Sets (expand to 10+ sets)
- Travel: 🗼🌊🌸🎭🏔️🌺
- Nature: 🦋🌻🍀🌙⭐🎯
- Journey: ✈️🧭🌍🎒🌅⛵
- Night: 🌙🌟🦉🔮🌌🕯️

---

## Screens / Views

| Screen | Description |
|---|---|
| Splash | Logo animation, loads user data |
| Onboarding | 3-screen swipe intro + quick baseline test |
| Landing | Entry lobby: animated globe, game chips, Play / Track Progress |
| Auth | Email login/signup, shake on error, continue as guest |
| Journey | Main scrolling path (home screen) |
| Level Modal | Bottom sheet on level tap |
| Game — Memory | Card flip matching game |
| Game — Logic | Odd One Out game |
| Game — Speed | Symbol match game |
| Game — Pattern | Sequence memory game |
| Win Screen | Post-game celebration with confetti and miles counter |
| Brain Dashboard | Scores and training areas (4 domains) |
| Miles & Passport | Rewards and stamps |
| Settings | Notifications, account, subscription |
| Paywall | Premium upsell (lives gate / feature gate) |
| Onboarding Paywall | Post-onboarding premium offer |

---

## Recommended Tech Stack

### Option A — React Native + Expo (Recommended)
- Single codebase for iOS and Android
- Expo Go for rapid prototyping
- React Native built-in `Animated` API for animations (no Reanimated dependency)
- AsyncStorage + Supabase for persistence
- Expo Notifications for push

### Option B — Capacitor + React
- Web-first, wrap in native shell
- Faster initial development if team knows React
- Slightly worse performance for animations
- Good for PWA fallback

### Option C — Flutter
- Best performance
- Steeper learning curve
- Excellent for polished animations

### Backend (all options)
- **Supabase**: Auth, Postgres DB, real-time sync
- **RevenueCat**: Subscription management (iOS + Android IAP)
- **Expo Notifications** or **OneSignal**: Push notifications
- **PostHog** or **Mixpanel**: Analytics

---

## File / Folder Structure (React Native + Expo)

```
thinkpop/
├── CLAUDE.md                  ← AI context file (keep updated)
├── PRD.md                     ← This file
├── app/
│   ├── index.tsx              ← Entry point → routes to /landing after onboarding
│   ├── landing.tsx            ← Entry lobby screen (animated globe, game chips)
│   ├── auth.tsx               ← Email login/signup screen
│   ├── (tabs)/
│   │   ├── journey.tsx        ← Main path screen
│   │   ├── brain.tsx          ← Brain dashboard
│   │   └── miles.tsx          ← Passport & miles
│   ├── game/
│   │   ├── memory.tsx         ← Memory match game
│   │   ├── logic.tsx          ← Odd One Out game
│   │   ├── speed.tsx          ← Speed match game
│   │   └── pattern.tsx        ← Pattern pulse game
│   ├── paywall.tsx
│   └── onboarding/
│       └── index.tsx          ← Onboarding flow → finish goes to /landing
├── components/
│   ├── path/
│   │   ├── LevelNode.tsx      ← Individual bubble node (80px)
│   │   └── PathSVG.tsx        ← Wavy path line
│   ├── games/
│   │   └── WinScreen.tsx      ← Confetti particles, miles counter animation
│   ├── ui/
│   │   └── Pill.tsx
│   └── layout/
│       └── TopBar.tsx
├── stores/
│   ├── playerStore.ts         ← Zustand: score, lives, streak (key: thinkpop-player)
│   ├── progressStore.ts       ← Zustand: level completion, stars (key: thinkpop-progress)
│   ├── brainStore.ts          ← Zustand: domain scores (key: thinkpop-brain)
│   └── authStore.ts           ← Zustand: auth state, isLoggedIn, email, name (key: thinkpop-auth)
├── data/
│   ├── levels.ts              ← Level definitions (type, domain, desc)
│   ├── oddOneSets.ts          ← Odd One Out puzzle data
│   ├── patternSets.ts         ← All pattern rounds
│   ├── memoryEmojis.ts        ← All emoji sets
│   └── brainInsights.ts       ← Post-game insight copy
├── hooks/
│   └── useLives.ts            ← Lives timer logic
├── utils/
│   └── scoring.ts             ← Score / star / miles calculation
├── constants/
│   ├── colors.ts              ← Design tokens (#0B1D3A, #1A3A5C, #FFD166, #06D6A0)
│   └── config.ts              ← Game config (timer lengths, MILES_PER_STAR etc)
└── assets/
    └── fonts/
```

---

## Build Status — Last Updated 2026-03-30

### Phase 1 MVP — COMPLETE ✅

**Built and working:**
- [x] Onboarding (3 slides + animated baseline score reveal → lands on Landing screen)
- [x] Landing screen (`app/landing.tsx`) — animated globe, game chips, Play / Track Progress buttons
- [x] Auth screen (`app/auth.tsx`) — email login/signup, shake on error, continue as guest
- [x] Journey path (15 levels built; zigzag path, level modal, decorative emoji; 80px nodes)
- [x] All 4 game modes fully playable (Memory Match, Odd One Out, Speed Match, Pattern Pulse)
- [x] Bouncy spring tap animations on all choice buttons (Logic, Speed, Pattern games)
- [x] Win screen + confetti particles + miles counter animation + "+N Miles ✈️" badge
- [x] Brain dashboard (live training area scores — 4 domains, Focus removed; weekly delta; dynamic coach tip; percentile rank; guest sign-in banner; logged-in account row)
- [x] Lives system (5 hearts, 30-min timer refill, deduct on play, gate when empty)
- [x] Day streak (date-based tracking, resets on missed day, increments on win)
- [x] Local persistence (AsyncStorage via Zustand persist — keys: thinkpop-player, thinkpop-progress, thinkpop-brain, thinkpop-auth)
- [x] Basic paywall (lives gate screen with countdown timer and premium CTA placeholder)
- [x] Auth store (`stores/authStore.ts`) — local auth, Supabase-ready

**Nice to have (Phase 2):**
- [ ] Cloud sync (Supabase)
- [ ] Push notifications
- [ ] Social sharing (passport stamps)
- [ ] RevenueCat subscription (paywall CTA is placeholder — needs wiring)

**Out of scope for MVP:**
- [ ] Focus game mode (removed from Brain dashboard; no game built)
- [ ] Detailed weekly reports
- [ ] Leaderboards
- [ ] Multiplayer / friends

---

## What Was Built (Technical Detail)

### Screens
| Screen | File | Status |
|---|---|---|
| Onboarding | `app/onboarding/index.tsx` | ✅ 3 slides + baseline animation → /landing |
| Landing | `app/landing.tsx` | ✅ Animated globe, game chips, Play / Track Progress |
| Auth | `app/auth.tsx` | ✅ Login/signup, shake on error, continue as guest |
| Journey (main path) | `app/(tabs)/journey.tsx` | ✅ Live level state from progressStore; 80px nodes |
| Brain Dashboard | `app/(tabs)/brain.tsx` | ✅ 4 domains, guest banner, account row |
| Miles & Passport | `app/(tabs)/miles.tsx` | ✅ UI complete (static stamps) |
| Memory Match | `app/game/memory.tsx` | ✅ Fully playable, star rating |
| Odd One Out | `app/game/logic.tsx` | ✅ Fully playable, star rating, spring animations |
| Speed Match | `app/game/speed.tsx` | ✅ Fully playable, star rating, spring animations |
| Pattern Pulse | `app/game/pattern.tsx` | ✅ Fully playable, star rating, spring animations |
| Win Screen | `components/games/WinScreen.tsx` | ✅ Confetti particles, miles counter, "+N Miles ✈️" badge |
| Paywall | `app/paywall.tsx` | ✅ Lives gate, countdown, premium CTA |

### State / Data
| Store | File | Status |
|---|---|---|
| Player (score, lives, streak, miles) | `stores/playerStore.ts` | ✅ Persisted (thinkpop-player), lives timer, streak date logic |
| Progress (level completions, stars) | `stores/progressStore.ts` | ✅ Persisted (thinkpop-progress), best-stars logic |
| Brain (domain scores, weekly delta) | `stores/brainStore.ts` | ✅ Persisted (thinkpop-brain), domain nudge per win |
| Auth (isLoggedIn, email, name) | `stores/authStore.ts` | ✅ Persisted (thinkpop-auth), Supabase-ready |

### Known Gaps / Tech Debt
- Journey path has **15 levels** — PRD target is 50. Need to expand `data/levels.ts` and `POS` coordinates.
- Miles tab stamps are **static** — not yet wired to real milestone milestones from playerStore.miles.
- Paywall premium CTA is a **placeholder** — RevenueCat not integrated.
- Streak displayed in Brain tab is live but **no streak shield IAP** yet.
- No **failure state** in games — lives deducted on play start, not on fail. Needs per-game fail conditions in Phase 2.

---

## Recommended Next Priorities

### Immediate (before any user testing / TestFlight)
1. **Expand to 50 levels** — extend `data/levels.ts` with 35 more levels and matching `POS` zigzag coordinates. No new code, just data.
2. **Wire Miles stamps to real milestones** — connect passport stamps to `playerStore.miles` thresholds so they unlock dynamically.
3. **Expand Odd One Out sets** — currently 20 sets, grow to 50+ for variety across 15 Logic levels.

### Phase 2 — Revenue & Retention (months 4–6)
1. **RevenueCat** — wire the paywall "Get Premium" button to an actual subscription. This is the single highest-impact revenue action.
2. **Push notifications** — daily reminder + streak-at-risk + lives-refilled. Use Expo Notifications (no extra backend needed).
3. **Onboarding paywall** — add a premium upsell screen at the end of onboarding (post-baseline reveal). High conversion window.
4. **Supabase cloud sync** — swap authStore local logic for real Supabase auth + Postgres for cross-device continuity. Required before wide launch.

### Phase 3 — Growth (months 6–12)
- Leaderboards, daily challenges, seasonal events
- Social sharing of passport stamps
- Friend comparison / referral loop
- Premium level packs (Continent Packs IAP)

---

## Success Metrics

| Metric | Target (Month 3) | Target (Month 12) |
|---|---|---|
| DAU | 10,000 | 200,000 |
| D7 Retention | 35% | 45% |
| D30 Retention | 15% | 25% |
| Avg session length | 8 min | 10 min |
| Sessions per DAU | 3.5 | 4+ |
| Conversion to premium | 4% | 6% |
| ARPU (monthly) | $0.80 | $1.20 |

---

## Open Questions
1. ~~React Native vs Capacitor~~ — **Decided: React Native + Expo**
2. Do we launch on both stores simultaneously or iOS first?
3. Should the Brain Score algorithm be proprietary / clinically validated?
4. Partnership with a neuroscientist / university for credibility?
5. Should we A/B test "brain training" vs "travel game" framing in ads?
6. When should RevenueCat be integrated — before or after TestFlight?
