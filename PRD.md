# GlobeMind — Product Requirements Document

## Overview
GlobeMind is a mobile cognitive training game disguised as a world travel experience. It targets adults aged 30–70 who want to maintain cognitive health but find existing brain training apps boring and clinical.

---

## Problem Statement
Brain training apps exist (Lumosity, BrainHQ, Elevate) but they feel like homework. Casual games exist (Candy Crush) but offer no cognitive value. GlobeMind sits in the gap: a game that is genuinely fun AND genuinely beneficial, designed specifically for an older demographic that is ignored by the gaming industry.

---

## Goals
1. Build a mobile app (iOS + Android) that feels as polished and addictive as Candy Crush
2. Deliver real cognitive training across 5 domains
3. Generate sustainable revenue via freemium + IAP
4. Reach 1M MAU within 18 months of launch

---

## User Stories

### Onboarding
- As a new user, I want a quick (<60 second) onboarding that shows me what the game is and sets my baseline brain score
- As a new user, I want the first 5 levels to feel easy so I build confidence
- As a new user, I want to understand what cognitive domain each game trains without it feeling academic

### Core Loop
- As a player, I want to scroll a beautiful path and tap a level to play
- As a player, I want a bottom sheet to appear with level info before I commit to playing
- As a player, I want to complete a short game (2–5 min) and feel rewarded immediately
- As a player, I want to see my brain score go up after each session
- As a player, I want to unlock new levels by completing current ones

### Brain Tracking
- As a player, I want to see a breakdown of my performance across cognitive domains
- As a player, I want a weekly report that tells me if I'm improving
- As a player, I want to be told which domain needs the most work
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
- Each level node shows: emoji icon, star rating (0–3), locked/unlocked/current state
- Tapping unlocked node opens bottom sheet modal
- Current level has pulsing glow animation
- Locked levels are dimmed, non-interactive, show lock icon
- Path has decorative scattered travel emoji in the background

### FR-002: Level Modal
- Slides up from bottom on level tap
- Shows: level number, emoji, cognitive domain tag, description, Play button, dismiss option
- Dismiss by tapping outside modal or "Maybe later" button

### FR-003: Game Engine — Memory Match
- Grid of face-down cards (emoji on reveal)
- Flip two cards: match = stay revealed, no match = flip back after 900ms delay
- Lock input during flip-back animation
- Difficulty scales: Level 1 = 3 pairs (6 cards), max = 6 pairs (12 cards)
- Pip indicators show pairs found
- Win condition: all pairs matched
- Score = pairs × 15 + time bonus

### FR-004: Game Engine — Word Builder
- 7 letter tiles displayed
- Tap to select letters in sequence, builds word display
- Submit validates against word dictionary
- Clear resets current attempt
- Invalid word: shake animation + clear
- Valid word: flash green, add to found list with points
- Duplicate word: silently clear
- Win condition: 5 valid words found
- Score = sum of (word_length × 15)
- Word lists are pre-curated, not full dictionary (avoid obscure words)

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

### FR-007: Win Screen
- Appears after any game completion
- Shows: emoji celebration, title (score-dependent), subtitle, 3 stat cards, brain insight card
- Brain insight: factual, science-based sentence about the trained domain
- Two buttons: Play Again (replays same level) / Back to Journey
- Brain Score increments by 10–30 pts
- Air miles increment by 120

### FR-008: Brain Dashboard
- Brain Score: large number, weekly delta, percentile rank vs age group
- 5 domain bars: Working Memory, Processing Speed, Verbal Fluency, Pattern Recognition, Attention & Focus
- Each bar shows percentage fill and numeric value
- Coach Tip: one sentence targeting weakest domain
- Day streak card at bottom

### FR-009: Miles & Passport
- Total air miles counter
- Progress bar to next stamp milestone
- Passport stamp grid (8 stamps, earned by milestones)
- Stamp names: Explorer, Wordsmith, Speedster, Pathfinder, Horizon, Luminary, Voyager, Legend
- Stamps animate when newly earned (stamp-press animation)

### FR-010: Lives System
- 5 lives max
- Lose a life on: failing a level (defined per game mode)
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
Memory → Word → Memory → Speed → Pattern → Word → Memory → Speed → Pattern → Memory (Boss) → ...
```

### Word Sets (expand to 20+ sets)
- TRAVELS, WORLDS, JOURNEY, COASTAL, SUNRISE, LANTERN, PASSAGE, EXPLORE, DISTANT, HORIZON

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
| Journey | Main scrolling path (home screen) |
| Level Modal | Bottom sheet on level tap |
| Game — Memory | Card grid game |
| Game — Word | Letter tile game |
| Game — Speed | Symbol match game |
| Game — Pattern | Sequence memory game |
| Win Screen | Post-game celebration |
| Brain Dashboard | Scores and domains |
| Miles & Passport | Rewards and stamps |
| Settings | Notifications, account, subscription |
| Paywall | Premium upsell (lives gate / feature gate) |
| Onboarding Paywall | Post-onboarding premium offer |

---

## Recommended Tech Stack

### Option A — React Native + Expo (Recommended)
- Single codebase for iOS and Android
- Expo Go for rapid prototyping
- Reanimated 3 for animations
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
globemind/
├── CLAUDE.md                  ← AI context file (keep updated)
├── PRD.md                     ← This file
├── app/
│   ├── (tabs)/
│   │   ├── journey.tsx        ← Main path screen
│   │   ├── brain.tsx          ← Brain dashboard
│   │   └── miles.tsx          ← Passport & miles
│   ├── game/
│   │   ├── memory.tsx         ← Memory match game
│   │   ├── word.tsx           ← Word builder game
│   │   ├── speed.tsx          ← Speed match game
│   │   └── pattern.tsx        ← Pattern pulse game
│   ├── modals/
│   │   ├── level-modal.tsx    ← Bottom sheet level info
│   │   ├── win-screen.tsx     ← Post-game celebration
│   │   └── paywall.tsx        ← Premium upsell
│   └── onboarding/
│       └── index.tsx          ← Onboarding flow
├── components/
│   ├── path/
│   │   ├── LevelNode.tsx      ← Individual bubble node
│   │   ├── PathSVG.tsx        ← Wavy path line
│   │   └── PathScroll.tsx     ← Scrollable container
│   ├── games/
│   │   ├── MemoryCard.tsx
│   │   ├── LetterTile.tsx
│   │   ├── SpeedOption.tsx
│   │   └── PatternSymbol.tsx
│   ├── ui/
│   │   ├── Pill.tsx           ← Stat pills (score, lives, streak)
│   │   ├── TimerBar.tsx       ← Shrinking timer
│   │   ├── DomainBar.tsx      ← Brain domain progress bar
│   │   └── PassportStamp.tsx  ← Collectible stamp
│   └── layout/
│       ├── TopBar.tsx
│       └── BottomNav.tsx
├── stores/
│   ├── playerStore.ts         ← Zustand: score, lives, streak
│   ├── progressStore.ts       ← Zustand: level completion, stars
│   └── brainStore.ts          ← Zustand: domain scores
├── data/
│   ├── levels.ts              ← Level definitions (type, domain, desc)
│   ├── wordSets.ts            ← All word pools
│   ├── patternSets.ts         ← All pattern rounds
│   └── memoryEmojis.ts        ← All emoji sets
├── hooks/
│   ├── useGame.ts             ← Shared game state hook
│   ├── useLives.ts            ← Lives timer logic
│   └── useStreak.ts           ← Streak tracking
├── utils/
│   ├── scoring.ts             ← Score calculation
│   ├── brainScore.ts          ← Domain score aggregation
│   └── animations.ts          ← Shared animation configs
├── constants/
│   ├── colors.ts              ← Design tokens
│   ├── fonts.ts
│   └── config.ts              ← Game config (timer lengths etc)
└── assets/
    ├── fonts/
    └── sounds/                ← Tap, match, win SFX
```

---

## Build Status — Last Updated 2026-03-29

### Phase 1 MVP — COMPLETE ✅

**Must have:**
- [x] Onboarding (3 slides + animated baseline score reveal)
- [x] Journey path (15 levels built; zigzag path, level modal, decorative emoji)
- [x] All 4 game modes fully playable (Memory Match, Word Builder, Speed Match, Pattern Pulse)
- [x] Win screen + brain insight (stars animation, score counter, randomised domain insights)
- [x] Brain dashboard (live domain scores, weekly delta, dynamic coach tip, percentile rank)
- [x] Lives system (5 hearts, 30-min timer refill, deduct on play, gate when empty)
- [x] Day streak (date-based tracking, resets on missed day, increments on win)
- [x] Local persistence (AsyncStorage via Zustand persist — player, progress, brain stores)
- [x] Basic paywall (lives gate screen with countdown timer and premium CTA placeholder)

**Nice to have (Phase 2):**
- [ ] Cloud sync (Supabase)
- [ ] Push notifications
- [ ] Social sharing (passport stamps)
- [ ] RevenueCat subscription (paywall CTA is placeholder — needs wiring)

**Out of scope for MVP:**
- [ ] Attention & Focus game mode
- [ ] Detailed weekly reports
- [ ] Leaderboards
- [ ] Multiplayer / friends

---

## What Was Built (Technical Detail)

### Screens
| Screen | File | Status |
|---|---|---|
| Onboarding | `app/onboarding/index.tsx` | ✅ 3 slides + baseline animation |
| Journey (main path) | `app/(tabs)/journey.tsx` | ✅ Live level state from progressStore |
| Brain Dashboard | `app/(tabs)/brain.tsx` | ✅ Wired to live brainStore |
| Miles & Passport | `app/(tabs)/miles.tsx` | ✅ UI complete (static stamps) |
| Memory Match | `app/game/memory.tsx` | ✅ Fully playable, star rating |
| Word Builder | `app/game/word.tsx` | ✅ Fully playable, star rating |
| Speed Match | `app/game/speed.tsx` | ✅ Fully playable, star rating |
| Pattern Pulse | `app/game/pattern.tsx` | ✅ Fully playable, star rating |
| Win Screen | `components/games/WinScreen.tsx` | ✅ Stars anim, score counter, brain insight |
| Paywall | `app/paywall.tsx` | ✅ Lives gate, countdown, premium CTA |

### State / Data
| Store | File | Status |
|---|---|---|
| Player (score, lives, streak, miles) | `stores/playerStore.ts` | ✅ Persisted, lives timer, streak date logic |
| Progress (level completions, stars) | `stores/progressStore.ts` | ✅ Persisted, best-stars logic |
| Brain (domain scores, weekly delta) | `stores/brainStore.ts` | ✅ Persisted, domain nudge per win |

### Known Gaps / Tech Debt
- Journey path has **15 levels** — PRD target is 50. Need to expand `data/levels.ts` and `POS` coordinates.
- Miles tab stamps are **static** — not yet wired to real milestone milestones from playerStore.miles.
- Paywall premium CTA is a **placeholder** — RevenueCat not integrated.
- Streak displayed in Brain tab is live but **no streak shield IAP** yet.
- No **failure state** in games — lives deducted on play start, not on fail. Needs per-game fail conditions in Phase 2.
- Attention & Focus domain shows "Coming soon" in Brain tab — **no game built yet**.

---

## Recommended Next Priorities

### Immediate (before any user testing / TestFlight)
1. **Expand to 50 levels** — extend `data/levels.ts` with 35 more levels and matching `POS` zigzag coordinates. No new code, just data.
2. **Wire Miles stamps to real milestones** — connect passport stamps to `playerStore.miles` thresholds so they unlock dynamically.
3. **Fix streak display in TopBar** — Brain tab shows live streak, but TopBar pill on Journey still reads from store directly (already works, just verify).

### Phase 2 — Revenue & Retention (months 4–6)
1. **RevenueCat** — wire the paywall "Get Premium" button to an actual subscription. This is the single highest-impact revenue action.
2. **Push notifications** — daily reminder + streak-at-risk + lives-refilled. Use Expo Notifications (no extra backend needed).
3. **Onboarding paywall** — add a premium upsell screen at the end of onboarding (post-baseline reveal). High conversion window.
4. **Supabase cloud sync** — auth + Postgres for cross-device continuity. Required before wide launch.
5. **Attention & Focus game mode** — 5th domain, completes the brain dashboard.

### Phase 3 — Growth (months 6–12)
- Leaderboards, daily challenges, seasonal events
- Social sharing of passport stamps
- Friend comparison / referral loop
- Premium level packs (Continent Packs IAP)

---

## Phase 2 (months 4–6)
- Cloud sync + cross-device (Supabase)
- Push notifications (Expo Notifications)
- Attention & Focus game mode
- Weekly brain report (detailed)
- Social sharing (passport stamps)
- Subscription via RevenueCat
- Onboarding paywall
- A/B test paywall timing

## Phase 3 (months 6–12)
- Leaderboards
- Daily challenges
- Seasonal content / events
- Friend comparison
- Premium "Hidden Gem" level packs
- Potential web version (PWA)

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
