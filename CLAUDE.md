# ThinkPop — Claude Code Context

## What is ThinkPop?
A mobile-first brain training game targeting **30–70 year olds**. Think Candy Crush meets brain training — but without the patronising "homework" feel of Lumosity or BrainHQ. The name "ThinkPop" is thematic: every correct answer, level unlock, and win moment has a satisfying **pop** — spring animations, haptics, and instant gratification throughout.

## The Core Insight
The 30–70 demographic is massively underserved in mobile gaming. They have:
- High disposable income
- Real motivation to stay cognitively sharp
- Daily phone habits but few games made *for* them
- Willingness to pay if the value feels legitimate

Existing brain training apps (Lumosity, BrainHQ) feel like homework. ThinkPop feels like Candy Crush but makes you smarter.

## Theme & Aesthetic
- Players are on a "journey" — scrolling path like Candy Crush, not a geography lesson
- Light, fresh aesthetic: mint/cream gradient backgrounds, orange/teal/coral accents
- Primary buttons: LinearGradient (#FFAA00 → #FF8C00)
- Font: Nunito (rounded, friendly, readable for older users)
- NO flashing, NO chaos, NO EDM music — calm but engaging
- **"Pop" theme** throughout: spring animations on every tap, POP! splash on win, haptic feedback everywhere

## Navigation Structure
2 tabs:
1. **Journey** (🗺️) — Main Candy Crush-style scrolling path with 50 level nodes
2. **Brain** (🧠) — Brain training domain scores and weekly report

## Entry Flow
- New users: **Onboarding** (3 slides + baseline) → **Landing screen** (`/landing`)
- Returning users: open directly to **Landing screen**
- Landing: centred ThinkPop logo, 4 SVG category cards (slowly drifting), **Play Now →** → Journey, **Track Progress** → auth (or Brain tab if logged in)
- After winning a level: Win screen → **Level Transition screen** → Journey (with next level unlocked)

## The Level Path
- Zigzag scrolling path, PATH_HEIGHT = 6000px, 50 levels across 5 worlds
- Level nodes are 64px bubbles; node positions stored as POS fractions in `data/levels.ts`
- Tapping a node opens a bottom sheet modal with level info + Play button
- Levels rotate across 4 game types — no rigid type locking
- Stars (1–3) shown under completed nodes
- Current level: glowing pulse + bob animation; springs in on mount (pop animation)
- Boss levels at 10, 20, 30, 40, 50

## Level Transition Screen (`app/transition.tsx`)
- Shown between Win screen and Journey (when next level exists)
- Mini path scene: completed level node (gold) + next level node (teal), dashed bezier connecting them
- ⭐ marker travels from node A to node B (1.1s, cubic easing, useNativeDriver)
- Haptic on arrival; next node springs in (0→1.3→1 scale) + glow pulse
- "Level N Unlocked!" label + domain + description + "Continue →" button
- Falls through to Journey directly on final level (50)

## The 4 Game Modes

### 1. Memory Match — Memory
- Classic card flip-and-match; emoji on reveal
- Pop animation + haptic on matched pair
- Board scales: Level 1 = 3 pairs, Final Boss (L50) = 9 pairs
- Win: find all pairs

### 2. Odd One Out — Logic
- 4 emoji in 2×2 grid; tap the one that doesn't belong
- 8s timer per round; hint shown after each ("Not a fruit")
- 7 rounds per game; win: complete all 7
- Bouncy spring pop on tap; Light haptic correct / Medium haptic wrong

### 3. Speed Match — Speed
- Target symbol at top; 6 options in 3×2 grid (Animated.View wraps TouchableOpacity for correct flex width)
- 30s timer: teal→gold→coral; combo multiplier for consecutive correct
- Bouncy spring pop on tap; Light haptic correct / Medium haptic wrong
- Win: timer expires

### 4. Pattern Pulse — Pattern
- Sequence lights up one by one; player picks what comes next from 4 choices
- 8s answer timer; 7 rounds per game
- Bouncy spring pop on tap; Light haptic correct / Medium haptic wrong
- Win: complete all 7 rounds

## POP! Features (across all games)
- **Correct answer**: spring scale burst (1→1.2→1) + Light haptic
- **Wrong answer**: Medium haptic
- **Win screen**: "POP! 🎉" text springs in (scale 0→1), holds 380ms, fades before content reveals
- **Level unlock**: new current node springs in (0→1.25→1) on mount
- **Level transition**: ⭐ marker travels path + next node pop + glow
- `useNativeDriver: true` on all animations throughout

## Score System
- Metric is **Score / pts** (not miles, not brain score)
- Pts earned per star: 1⭐ = 150, 2⭐ = 300, 3⭐ = 500
- Win screen: score counter animates old → new total; "+N pts ⭐" badge
- Brain tab: "Total Score ⭐", weekly delta "↑ +N pts this week"
- NO miles (✈️) or passport branding in the score metric

## Brain Dashboard
- Score total as large number; weekly delta; percentile rank vs age group
- 4 domain bars: Memory, Speed, Logic, Pattern (Focus removed)
- Coach Tip: targets weakest domain
- Guest users: "Save your progress · Sign In →" banner → `/auth`
- Logged-in users: "Signed in as [name]" + Log out

## What Has Been Built
A fully working React Native (Expo SDK 54) app in `app/` with:
- All 4 games playable end-to-end
- **50 levels** across 5 worlds, zigzag path, boss levels at 10/20/30/40/50
- **55 Odd One Out puzzle sets** across 35+ categories
- POP! animations and haptics across all 4 games
- Level transition screen (marker travel + next level unlock)
- Win screen: POP! splash, confetti, score counter, "+N pts ⭐" badge
- Brain tab: 4 domains, guest banner, account row, coach tip, percentile
- Lives system (5 hearts, 30-min refill), day streak tracking
- Local persistence via Zustand+AsyncStorage — keys: `thinkpop-player`, `thinkpop-progress`, `thinkpop-brain`, `thinkpop-auth`
- Landing screen (centred logo, SVG card grid, drift/glow animation)
- Auth screen (email login/signup, shake on error, continue as guest)
- Onboarding (3 slides + baseline reveal → Landing)

Key files:
- `data/levels.ts` — 50 levels + 50 POS entries (PATH_HEIGHT=6000)
- `data/oddOneSets.ts` — 55 puzzle sets
- `constants/config.ts` — PATH_HEIGHT=6000, NODE_SIZE=64
- `app/transition.tsx` — level transition screen
- `components/games/WinScreen.tsx` — POP! + score counter + transition routing

## Tech Stack
- **React Native + Expo (SDK 54)** — iOS + Android
- **expo-router** — file-based navigation
- **Zustand + AsyncStorage** — local state persistence
- **React Native built-in `Animated`** — all animations (no Reanimated)
- **expo-haptics** — tactile feedback
- Backend (planned): Supabase for auth/scores, RevenueCat for subscriptions

## Key Design Principles
1. **Never make the player feel dumb** — frame difficulty as "brain warming up"
2. **Start every session with an easy win**
3. **Celebrate improvement, not just success** — POP! for every correct answer
4. **No panic timers** — gentle pressure only
5. **Sessions 5–10 minutes** — fits a morning coffee ritual
6. **Large text, high contrast** — this audience needs it
7. **"Cognitive" is banned** — wellness language only ("brain workout", "mental fitness", "sharpen your mind")

## Target User
- Age 30–70, skewing 40–60
- Motivated by brain health
- Uses Facebook/Instagram (not TikTok)
- Responds to "mental fitness" framing, not "game" framing

## Monetisation Plan
| Feature | Free | Premium ($6.99/mo) |
|---|---|---|
| Daily levels | 3 | Unlimited |
| Game modes | All 4 | All 4 + future |
| Brain Score | Basic | Full breakdown |
| Weekly Report | Summary | Detailed |
| Lives | 5, slow refill | Generous |
| Offline play | No | Yes |

One-time IAP: Level Packs ($2.99), Explorer Kit ($4.99), Extra Lives

## Go-To-Market
- App Store category: Health & Fitness (not Games)
- Facebook/Instagram ads targeting 38–65 with brain health interests
- Taglines: "Train your brain. Stay sharp." / "10 minutes a day. A sharper you."
- Partner with neurologists, senior wellness influencers
