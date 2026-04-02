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
- As a player, I want to see a breakdown of my performance across my strengths
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
- Scrollable **winding organic path** with **50 levels at launch** (scale to 200+)
- PATH_HEIGHT = 6000px; node positions stored as fractions of (pathWidth, PATH_HEIGHT)
- **5 worlds** of 10 levels each, each world sweeps right then arcs back left — organic S-curve feel
- World themed backgrounds: W1 Forest (green), W2 Ocean (sky blue), W3 Desert (amber), W4 Mountain (purple), W5 Space (cyan-teal)
- World LinearGradient bands + emoji decorations + world name labels overlay the path
- Road rendered as multi-layer SVG: drop shadow → world-coloured stroke → white highlight → dashed centreline
- Each level node shows: emoji icon, star rating (0–3), locked/unlocked/current state — nodes are **64px** bubbles
- Tapping unlocked node opens bottom sheet modal
- Current level has pulsing glow + bob animation; springs in on mount (scale 0 → 1.3 → 1)
- Locked levels are dimmed, non-interactive
- Boss levels at 10, 20, 30, 40, 50

### FR-002: Level Modal
- Slides up from bottom on level tap
- Shows: level number, emoji, brain training area tag, description, Play button, dismiss option
- Dismiss by tapping outside modal or "Maybe later" button
- Play gate: premium users bypass all limits → free users check daily cap (3/day) → then lives check

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

### FR-006: Game Engine — Pattern Pulse
- Sequence of 5–7 emoji lights up one at a time (550ms per symbol)
- After sequence: symbols dim, "What comes next?" prompt, 4 choice buttons, 8s timer
- **Choice buttons must NOT use flex:1 on Animated.View** (causes invisible text on new arch) — use minHeight:64 + justifyContent:center
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
- Auto-continues after 2s progress bar → routes through FR-015 (or Journey if last level)

### FR-008: Fail Screen
- Triggered when player exceeds wrong answer threshold (FAIL_THRESHOLD = 4) or runs out of time
- Deflating bubble animation
- Deducts one life on mount
- Options: Try Again or Exit to Journey

### FR-009: Stats Dashboard (Tab 2)
- Tab name: **Stats** with 📊 icon
- Score total: large number, weekly delta ("↑ +N pts this week"), percentile rank vs age group
- Section title: **"Your Strengths"** (not "Brain Training Areas")
- **4 domain bars: Memory, Speed, Logic, Pattern**
- **Coach Tips: 32 tips (8 per domain), rotating daily** — motivational/positive tone, NOT tied to brain training language
- Day streak card
- **Guest users**: gradient "Save your progress · Sign In →" banner → `/auth`
- **Logged-in users**: account row "Signed in as [name]" + Log out

### FR-010: Lives System
- 5 lives max; lose 1 on Play Now (if free user); refill 1 per 30 min
- Premium users: lives gate bypassed entirely
- 0 lives = paywall (`app/paywall.tsx`) with reason=lives

### FR-011: Daily Level Cap
- Free users: 3 levels per day (FREE_DAILY_LEVELS = 3)
- Exceeding cap → paywall with reason=daily
- Premium users: unlimited

### FR-012: Streak System
- Daily streak increments on ≥1 level completed per calendar day
- Breaks if no play for 24+ hours; shown in top bar and Stats tab

### FR-013: Notifications
- Daily reminder, streak-at-risk, lives-refilled (Expo Notifications — not yet wired)

### FR-014: Landing Screen
- Entry point shown after onboarding and on every app open
- **Centred ThinkPop logo** — dark teal "Think" + coral "Pop", Nunito_900Black, fontSize 58
- Light mint gradient: `['#F0FDF9', '#E8FBF5', '#D4F5EB']`; three decorative blobs
- 4 SVG category cards (Pattern/Memory/Logic/Speed) in loose 2×2 grid; light pastel tints; slow 24s drift rotation + glow pulse
- **Play Now →** (orange gradient) → Journey tab
- **Track Progress** (white semi-transparent) → Stats tab directly (no auth wall — Candy Crush model)

### FR-015: Auth Screen
- Email login / signup with toggle; shake animation on error; "Continue without account" (guest)
- Forgot password link on login form → sends reset email → inline confirmation
- After signup: "Check your inbox 📬" state with resend button (30s cooldown)
- Supabase backend (live)

### FR-016: Level Transition Screen (`app/transition.tsx`)
- Triggered by Win screen auto-continue when next level exists
- Mini path scene: completed level node (gold) + next level node (teal), dashed bezier between them
- **⭐ marker** travels from node A to node B (1.1s cubic easing, `useNativeDriver: true`)
- Haptic fires on arrival; next node springs in (0 → 1.3 → 1 scale) + continuous glow pulse
- "Level N Unlocked!" + domain + description animate in; "Continue to Journey →" button springs last
- On last level (50): routes directly to Journey (no transition)

### FR-017: Paywall (`app/paywall.tsx`)
- Reason-aware header: "Daily limit reached" vs "You're out of lives"
- Feature comparison table: Free vs Premium
- "Get Premium — $6.99/mo" CTA (currently mock — RevenueCat TODO)
- "Restore Purchase" stub
- Success screen on purchase: "👑 You're Premium!"
- Premium pill in Journey TopBar: 👑 Premium replaces ❤️ lives

### FR-018: Password Reset
- Forgot password → `supabase.auth.resetPasswordForEmail` → deep link `thinkpop://reset`
- `app/reset-password.tsx`: enter new password + confirm → `updatePassword` → success → Login
- Deep link handled in `_layout.tsx` via Linking

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
- Brain scores and progress synced to Supabase cloud (live)
- GDPR compliant — privacy policy generated via iubenda

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

### Pattern Types — 90 rounds ✅
AB repeat, AAB repeat, ABC repeat, ABBA, growing sequence, longer ABC(7) — across nature, food, animals, weather, space, sports, ocean, and more.

### Memory Emoji Sets — 18 themed sets ✅
Landmarks, Travel, Nature, Ocean, Forest, Fruits, Space, Jungle, Food, Weather, Sports, Music, Architecture, Birds, Vehicles, Gems, Insects, Vegetables — each set has 9 emoji (supports up to 9 pairs on boss levels).

---

## Screens / Views

| Screen | File | Status |
|---|---|---|
| Onboarding | `app/onboarding/index.tsx` | ✅ |
| Landing | `app/landing.tsx` | ✅ Centred logo, SVG cards, Track Progress → Stats (no auth wall) |
| Auth | `app/auth.tsx` | ✅ Supabase, email confirmation state, forgot password |
| Reset Password | `app/reset-password.tsx` | ✅ |
| Explore (Journey) | `app/(tabs)/journey.tsx` | ✅ 50 levels, 5 worlds, organic winding path |
| Level Transition | `app/transition.tsx` | ✅ Marker + unlock animation |
| Game — Memory | `app/game/memory.tsx` | ✅ |
| Game — Logic | `app/game/logic.tsx` | ✅ |
| Game — Speed | `app/game/speed.tsx` | ✅ |
| Game — Pattern | `app/game/pattern.tsx` | ✅ Choice button flex fix |
| Win Screen | `components/games/WinScreen.tsx` | ✅ POP! + score counter + auto-continue |
| Fail Screen | `components/games/FailScreen.tsx` | ✅ Deflating bubble |
| Stats Dashboard | `app/(tabs)/brain.tsx` | ✅ "Your Strengths", 32 rotating tips |
| Paywall | `app/paywall.tsx` | ✅ Feature table, reason-aware (mock purchase) |

---

## Tech Stack

### Current — React Native + Expo (SDK 54)
- React Native built-in `Animated` API, `useNativeDriver: true` throughout
- Zustand + AsyncStorage for local persistence (4 stores)
- expo-haptics for tactile feedback
- `newArchEnabled: true` (Fabric renderer)

### Backend — Live
- **Supabase**: Auth + Postgres (live) — `https://nfxxmhtzgyklxlzueztz.supabase.co`
- Tables: `profiles`, `level_completions`, `brain_scores` (all with RLS)
- Sync: `lib/sync.ts` (pure I/O) + `lib/userId.ts` singleton (no circular imports)

### Backend — Pending
- **RevenueCat**: subscriptions (mock only — `setPremium(true)`)
- **Expo Notifications**: push notifications (not wired)
- **PostHog / analytics**: not yet integrated

---

## File / Folder Structure

```
thinkpop/
├── CLAUDE.md / PRD.md / HANDOFF.md / TESTPLAN.md
├── app/
│   ├── index.tsx              ← Entry → /landing after onboarding check
│   ├── landing.tsx            ← Entry lobby (Track Progress → Stats, no auth wall)
│   ├── auth.tsx               ← Login/signup/forgot password/email confirmation state
│   ├── reset-password.tsx     ← Password reset screen (deep link target)
│   ├── transition.tsx         ← Level transition screen
│   ├── paywall.tsx            ← Monetisation gate
│   ├── (tabs)/
│   │   ├── _layout.tsx        ← Explore + Stats tabs; deep link handler
│   │   ├── journey.tsx        ← 50-level winding path
│   │   └── brain.tsx          ← Stats dashboard
│   ├── game/
│   │   ├── memory.tsx / logic.tsx / speed.tsx / pattern.tsx
│   └── onboarding/index.tsx
├── components/
│   ├── path/LevelNode.tsx / PathSVG.tsx
│   ├── games/WinScreen.tsx / FailScreen.tsx
│   ├── ui/Pill.tsx
│   └── layout/TopBar.tsx
├── stores/
│   ├── playerStore.ts         ← score, lives, streak, isPremium, daily counter
│   ├── progressStore.ts       ← level completions, stars
│   ├── brainStore.ts          ← domain scores
│   └── authStore.ts           ← Supabase auth + store hydration
├── lib/
│   ├── supabase.ts            ← Supabase client
│   ├── sync.ts                ← push/pull functions (pure I/O, no store imports)
│   └── userId.ts              ← userId singleton (breaks circular imports)
├── data/
│   ├── levels.ts              ← 50 levels + 50 POS entries (PATH_HEIGHT=6000)
│   ├── oddOneSets.ts          ← 55 puzzle sets
│   ├── patternSets.ts         ← 90 rounds
│   ├── memoryEmojis.ts        ← 18 themed sets
│   └── brainInsights.ts
├── hooks/useLives.ts
├── utils/scoring.ts
└── constants/
    ├── colors.ts
    └── config.ts              ← PATH_HEIGHT=6000, NODE_SIZE=64, MAX_LIVES=5, FREE_DAILY_LEVELS=3
```

---

## Build Status — Last Updated 2026-04-02

### Phase 1 MVP — COMPLETE ✅
- [x] Onboarding (3 slides + baseline reveal → Landing)
- [x] Landing — centred ThinkPop logo, SVG category cards, drift/glow animation
- [x] Auth — Supabase email login/signup, shake on error, guest mode, forgot password
- [x] Email confirmation flow — "Check your inbox" state, resend, deep link handling
- [x] Password reset — forgot password → email → deep link → reset screen
- [x] Explore tab — 50 levels, 5 worlds, organic winding path, world zone backgrounds
- [x] All 4 games — Memory, Logic, Speed, Pattern — fully playable
- [x] Fail screens — deflating bubble, life deduction
- [x] POP! theme — correct answer spring + haptic in all games; POP! splash on win screen
- [x] Level transition screen — ⭐ marker travel + next level unlock animation
- [x] Win screen — POP! splash, confetti, score counter, "+N pts ⭐" badge, auto-continue
- [x] Stats dashboard — 4 domains, guest banner, account row, 32 rotating coach tips
- [x] Lives system + daily cap (3/day free) + paywall with feature table
- [x] Supabase backend live — auth, profiles, completions, brain scores sync
- [x] Monetisation scaffolding — isPremium, gates, paywall (mock purchase)
- [x] 55 Odd One Out puzzle sets
- [x] 90 Pattern rounds
- [x] 18 themed Memory emoji sets
- [x] Privacy policy generated (iubenda)
- [x] Terms & Conditions (termsfeed.com — in progress)

### Phase 2 — App Store Submission
- [ ] RevenueCat — wire real purchase in `app/paywall.tsx`
- [ ] Privacy Policy + T&C URLs added to app and App Store Connect
- [ ] EAS Build setup — production iOS build
- [ ] App Store assets — 1024×1024 icon, screenshots, description, keywords
- [ ] Apple Developer account active

### Phase 3 — Post-Launch
- [ ] Push notifications (Expo Notifications)
- [ ] Leaderboards, daily challenges
- [ ] Social sharing, referral loop
- [ ] Premium level packs IAP
- [ ] Analytics (PostHog)

---

## Known Gaps / Tech Debt
- RevenueCat **not integrated** — purchase is mocked with `setPremium(true)`
- Push notifications not wired
- Percentile rank vs age group in Stats tab is static/placeholder
- Speed game card layout was previously buggy — resolved

---

## Recommended Next Priorities

### Immediate (App Store blockers)
1. **RevenueCat** — wire paywall "Get Premium" button
2. **Legal URLs** — add privacy policy + T&C URLs to auth screen and App Store Connect
3. **EAS Build** — configure production build
4. **App Store assets** — icon, screenshots, copy

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
6. ~~RevenueCat before or after TestFlight?~~ — **Before — Apple tests purchase flow in review**
