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
1. **Explore** (🗺️) — Main Candy Crush-style scrolling path with 50 level nodes
2. **Stats** (📊) — Domain scores and weekly report

## Entry Flow
- New users: **Onboarding** (3 slides + baseline) → **Landing screen** (`/landing`)
- Returning users: open directly to **Landing screen**
- Landing: centred ThinkPop logo, 4 SVG category cards (slowly drifting), **Play Now →** → Journey, **Track Progress** → Stats tab directly (no auth wall)
- After winning a level: Win screen → **Level Transition screen** → Journey (with next level unlocked)

## The Level Path
- Winding organic path, PATH_HEIGHT = 6000px, 50 levels across 5 worlds
- Each world sweeps right then arcs back left — creates S-curve feel, not strict zigzag
- World zones have themed LinearGradient backgrounds + emoji decorations + world labels
- Level nodes are 64px bubbles; node positions stored as POS fractions in `data/levels.ts`
- Tapping a node opens a bottom sheet modal with level info + Play button
- Stars (1–3) shown under completed nodes
- Current level: glowing pulse + bob animation; springs in on mount
- Boss levels at 10, 20, 30, 40, 50
- World themes: W1 Forest (green), W2 Ocean (sky blue), W3 Desert (amber), W4 Mountain (purple), W5 Space (cyan-teal)
- Road is multi-layered SVG: drop shadow → world-coloured road → white highlight → dashed centreline

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
- Target symbol at top; 6 options in 3×2 grid
- 30s timer: teal→gold→coral; combo multiplier for consecutive correct
- Bouncy spring pop on tap; Light haptic correct / Medium haptic wrong
- Win: timer expires

### 4. Pattern Pulse — Pattern
- Sequence lights up one by one; player picks what comes next from 4 choices
- 8s answer timer; 7 rounds per game
- Choice buttons: NO flex:1 on Animated.View (caused invisible text bug on new arch) — use minHeight:64 + justifyContent:center instead
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
- Stats tab: "Total Score ⭐", weekly delta "↑ +N pts this week"
- NO miles (✈️) or passport branding in the score metric

## Stats Dashboard (was Brain tab)
- Tab name: **Stats** with 📊 icon (was Brain/🧠)
- Section title: **"Your Strengths"** (was "Brain Training Areas")
- Score total as large number; weekly delta; percentile rank vs age group
- 4 domain bars: Memory, Speed, Logic, Pattern
- Coach Tips: 32 tips total (8 per domain), rotating daily, motivational/positive tone — NOT tied to brain training language
- Guest users: "Save your progress · Sign In →" banner → `/auth`
- Logged-in users: "Signed in as [name]" + Log out

## Monetisation — Built
- `playerStore`: `isPremium` flag, `dailyLevelsPlayed` counter, `FREE_DAILY_LEVELS = 3`
- Journey play gate: premium skips all limits → free checks daily cap (3/day) → lives check
- Paywall (`app/paywall.tsx`): reason-aware (lives vs daily cap), feature comparison table, mock purchase → `setPremium(true)`, success screen, Restore Purchase stub
- Premium pill shown in Journey TopBar (👑 Premium replaces ❤️ lives)
- RevenueCat **NOT yet integrated** — purchase is currently mocked with `setPremium(true)`

## Backend — Supabase (LIVE)
- Project URL: `https://nfxxmhtzgyklxlzueztz.supabase.co`
- Anon key stored in `lib/supabase.ts`
- **3 tables**: `profiles` (1:1 with auth.users), `level_completions`, `brain_scores`
- Row-level security enabled on all tables
- Trigger: `on_auth_user_created` auto-creates profile + brain_scores rows on signup
- Site URL set to `thinkpop://` in Supabase dashboard
- Redirect URLs configured: `thinkpop://confirm`, `thinkpop://reset`

### Sync Architecture (no circular imports)
- `lib/userId.ts` — tiny singleton, avoids stores importing authStore
- `lib/sync.ts` — pure Supabase I/O, no store imports, push functions take data as params
- `lib/supabase.ts` — client with AsyncStorage session persistence
- `authStore` — owns hydration: calls `pullAll` → hydrates playerStore, progressStore, brainStore
- Stores call `getCurrentUserId()` + push functions on mutations (fire-and-forget)
- Guest users: local-only, no sync

### Auth Flow
- `signUp` → Supabase → if no session (email unconfirmed) → returns `needsConfirmation: true`
- Auth screen shows "Check your inbox 📬" state with resend button (30s cooldown)
- `login` → if "Email not confirmed" error → friendly message shown
- Deep links handled in `_layout.tsx` via `Linking.addEventListener` + `Linking.getInitialURL`
- Email confirmation: `thinkpop://confirm#access_token=...` → `setSession` → `initSession` → Journey
- Password reset: `thinkpop://reset#access_token=...&type=recovery` → `/reset-password` screen
- `app/reset-password.tsx`: enter new password + confirm → `updatePassword` → success → Login
- `initSession` called on cold start to restore existing session

## What Has Been Built
A fully working React Native (Expo SDK 54) app in `app/` with:
- All 4 games playable end-to-end
- **50 levels** across 5 worlds, winding organic path, world zone backgrounds, boss levels at 10/20/30/40/50
- **55 Odd One Out puzzle sets**, **90 Pattern sets**, **18 themed Memory emoji sets**
- POP! animations and haptics across all 4 games
- Fail screens (deflating bubble), Win screen (POP! splash, confetti, score counter, "+N pts ⭐" badge)
- Level transition screen (marker travel + next level unlock)
- Stats tab: 4 domains, guest banner, account row, 32 rotating coach tips
- Lives system (5 hearts, 30-min refill, premium bypass), day streak tracking
- Daily level cap (3 free/day), paywall with feature table
- Supabase auth + real-time sync to cloud (profiles, completions, brain scores)
- Email confirmation flow + password reset flow with deep link handling
- Landing screen (centred logo, SVG card grid, drift/glow animation)
- Auth screen (email login/signup, shake on error, forgot password, continue as guest)
- Onboarding (3 slides + baseline reveal → Landing)

Key files:
- `data/levels.ts` — 50 levels + 50 POS entries (PATH_HEIGHT=6000)
- `data/oddOneSets.ts` — 55 puzzle sets
- `data/patternSets.ts` — 90 pattern rounds
- `data/memoryEmojis.ts` — 18 themed emoji sets
- `constants/config.ts` — PATH_HEIGHT=6000, NODE_SIZE=64
- `app/transition.tsx` — level transition screen
- `app/paywall.tsx` — monetisation gate (mock purchase)
- `app/reset-password.tsx` — password reset screen
- `components/games/WinScreen.tsx` — POP! + score counter + transition routing
- `components/games/FailScreen.tsx` — deflating bubble fail state
- `components/path/PathSVG.tsx` — world-coloured SVG road
- `lib/supabase.ts` — Supabase client
- `lib/sync.ts` — push/pull functions (pure I/O, no store imports)
- `lib/userId.ts` — userId singleton (breaks circular import chains)
- `stores/authStore.ts` — Supabase auth + store hydration

## Tech Stack
- **React Native + Expo (SDK 54)** — iOS + Android
- **expo-router** — file-based navigation
- **Zustand + AsyncStorage** — local state persistence
- **React Native built-in `Animated`** — all animations (no Reanimated)
- **expo-haptics** — tactile feedback
- **@supabase/supabase-js** — backend auth + database sync
- **react-native-url-polyfill** — required for Supabase in React Native
- Backend: Supabase (LIVE — auth, scores, progress)
- Subscriptions: RevenueCat (TODO — currently mocked)

## Remaining App Store Blockers
1. **RevenueCat** — wire real purchase flow in `app/paywall.tsx` (replace `setPremium(true)` mock)
2. **Privacy Policy URL** — generated via iubenda (in progress)
3. **Terms & Conditions URL** — generated via termsfeed.com (in progress)
4. **EAS Build setup** — production build pipeline for iOS
5. **App Store assets** — 1024×1024 icon, screenshots (6.5" + 5.5"), description, keywords
6. **Apple Developer account** — $99/year needed if not already active

## Key Design Principles
1. **Never make the player feel dumb** — frame difficulty as "brain warming up"
2. **Start every session with an easy win**
3. **Celebrate improvement, not just success** — POP! for every correct answer
4. **No panic timers** — gentle pressure only
5. **Sessions 5–10 minutes** — fits a morning coffee ritual
6. **Large text, high contrast** — this audience needs it
7. **"Cognitive" is banned** — wellness language only ("brain workout", "mental fitness", "sharpen your mind")
8. **No login wall** — users play immediately as guest, auth is optional (Candy Crush model)

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
