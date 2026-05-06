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
1. **Explore** (🗺️) — Main Candy Crush-style scrolling path with 101 level nodes
2. **Stats** (📊) — Domain scores and weekly report

## Entry Flow
- New users: **Onboarding** (3 slides + baseline) → **Landing screen** (`/landing`)
- Returning users: open directly to **Landing screen**
- Landing: centred ThinkPop logo, 4 SVG category cards (slowly drifting), **Play Now →** → Journey, **Track Progress** → Stats tab directly (no auth wall)
- After winning a level: Win screen → **Level Transition screen** → Journey (with next level unlocked)

## The Level Path
- **Horizontal** scrolling map (not vertical), MAP_WIDTH = 16000px, 101 levels across 10 worlds
- Each world occupies 1600px of horizontal canvas; player scrolls left→right
- World background images tiled side by side at 90% opacity; `landing-background.png` scrim behind
- Level nodes are 80px bubbles; node positions stored as POS fractions in `data/levels.ts`
- Tapping a node opens a bottom sheet modal with level info + Play button
- **Stars (1–5)** shown under completed nodes (display ready; scoring awards up to 5)
- Current level: glowing pulse + bob animation; springs in on mount
- Boss levels at 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
- World themes: W1 Nature, W2 Ocean, W3 Animals, W4 Food, W5 Space, W6 Fruits, W7 Weather, W8 Sports, W9 Flags, W10 Symbols
- Road is multi-layered SVG: drop shadow → world-coloured road → white highlight → dashed centreline
- **Floating overlays** (non-scrolling): "YOUR JOURNEY · Level N of 101" pill (top-left); world name + subtitle pill (top-right, updates as player scrolls)
- All levels unlocked for dev testing via `isLocked = false` flag in `LevelNode.tsx` — revert before shipping

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
- Board scales: Level 1 = 3 pairs, Final Boss (L100) = 9 pairs
- Win: find all pairs

### 2. Odd One Out — Logic
- **3 rotating modes** (randomised per round, unlocked by level):
  - **Find Odd** (🤔) — 2×2 grid, tap the 1 item that doesn't belong (levels 1–20 only)
  - **Find It** (🔍) — 2×2 grid, category shown ("Find the FRUIT"), 1 correct + 3 wrong-category decoys (levels 21+)
  - **Find All** (🎯) — 2×3 grid, 2 odd ones from different categories, tap both to complete (levels 41+)
- **Timer scales with level**: 8s (1–30) → 6s (31–60) → 5s (61+)
- Hint shown after each round; "N / 2 found" progress counter for Find All mode
- 7 rounds per game; 4 wrong answers = fail
- Mode badge shown when not in default Find Odd mode

### 3. Speed Match — Speed
- **3 rotating mechanics** (randomised per round):
  - **Find this →** — target shown at top, find it in grid (original mechanic)
  - **Tap the odd one!** — grid has N-1 identical + 1 different, tap the odd one
  - **Don't tap this →** — target shown with 🚫, tap anything EXCEPT it; wrong tap = -5pts and advances
- **Themed emoji pools per world** (10 pools, one per world): Nature → Ocean → Animals → Food → Space → Fruits → Weather → Sports → Flags → Symbols
- **Grid size scales with level**: 2×2 (levels 1–20) → 2×3 (21–60) → 3×3 (61+)
- 30s timer: teal→gold→coral; combo multiplier for consecutive correct; wrong tap = -5pts + combo reset
- Don't Tap mode: any tap advances the round (correct = +pts, wrong = -5pts)
- Win: timer expires

### 4. Pattern Pulse — Pattern
- **4 rotating modes** (randomised per round, unlocked by level):
  - **Next** (👀) — classic: watch sequence, pick what comes next (all levels)
  - **Missing** (🧩) — ❓ hides a middle position, pick the missing piece (levels 21+)
  - **Flash** (⚡) — sequence animates then vanishes; answer from memory (levels 41+)
  - **Break It** (🔧) — wrong item planted at middle position (red border), pick what should replace it (levels 71+)
- **Sequence length scales**: 4 items shown (levels 1–20) → 5 items (levels 21+)
- For shorter sequences, answer = seq[4] with auto-generated choices (not round.ans)
- Mode badge shown for non-default modes; phase label changes per mode
- 8s answer timer; 7 rounds per game; 4 wrong answers = fail
- Choice buttons: NO flex:1 on Animated.View (caused invisible text bug on new arch) — use height:110 + justifyContent:center instead

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
- **Premium domain breakdown**: trend arrow (▲/▼/→ % change vs last week) + "N games this week" under each bar
- **Weekly Report card** (4 stats: days active, games played, pts earned, perfect ⭐):
  - Premium: full breakdown + most improved domain + most played game + "Perfect by domain" row + "So close! 🎯" section (top 2 sub-5-star levels, tappable → Journey)
  - Free: dimmed preview with lock overlay + "Unlock with Unlimited →" CTA (→ `/paywall?reason=stats`)
- Coach Tips: 32 tips total (8 per domain), rotating daily, motivational/positive tone — NOT tied to brain training language
- Guest users: "Save your progress · Sign In →" banner → `/auth`
- Logged-in users: "Signed in as [name]" + Log out

## Monetisation — Built
- `playerStore`: `isPremium` flag, `dailyLevelsPlayed` counter, `FREE_DAILY_LEVELS = 10`, `MAX_LIVES = 10`, `DAILY_START_LIVES = 5`, `REFILL_MS = 15min`, `MAX_DAILY_REFILLS = 5`
- **Lives system**: daily reset to 5 lives each new day + refill timer starts immediately (+1 life every 15 min, max 5 refills/day = 10 total daily lives). Premium bypasses entirely. `checkDailyLivesReset()` called on mount via `useLives` hook.
- Journey play gate: premium skips all limits → free checks daily cap (10/day) → lives check
- Paywall (`app/paywall.tsx`): reason-aware (lives vs daily cap), feature comparison table (4 rows: Daily levels, Lives, Strengths, Weekly Report — no Ads row), real RevenueCat purchase flow, success screen, Restore Purchase
- Premium pill shown in Journey TopBar (👑 Premium replaces ❤️ lives)
- **Premium Stats features** (gated by `isPremium`): domain trend arrows + weekly games count; full Weekly Report (days active, games, pts, perfect ⭐, most improved, most played, perfect by domain, "So close!" replay nudge for top sub-5-star levels)
- `brainStore` tracks: `weeklyGamesPlayed` (per domain), `weeklyPlayDays` (days active this week), `prevDomains` (snapshot at week start for trend calculation) — all reset on new week
- **Daily cap now enforced** in journey modal: free users blocked after 3 levels/day → `/paywall?reason=daily`; `incrementDailyLevels()` called on each play
- **Paywall reason-aware headers** — 4 contexts: `lives` ("Keep Your Streak Alive"), `daily` ("You're On a Roll!"), `stats` ("Unlock Your Full Picture"), `upgrade` ("Unlock Unlimited Play")
- **Score badge** on Journey map: changed from ⭐ star icon to 💎 diamond emoji to avoid conflict with level node stars
- **Level node stars**: now use `icon-star.png` asset (14px) at full/25% opacity instead of emoji ⭐/☆
- **Level modal**: completed levels show star rating + contextual message ("So close!" / "Beat your score" / "Perfect score! 🌟") + button text changes to "Beat your score" for sub-5-star levels
- **Paywall full redesign**: landing-background.png + white scrim; animated crown hero (`icon-crown-hero.png`) with double glow rings + pulse; 4 benefit rows using app icon assets (icon-explore, icon-heart, icon-speed, icon-chart); sparkle particles; urgency line; contextual trigger pill; plan cards swap size on selection (selected = larger); purple gradient CTA with breathing pulse + glow; "Start Free & Play Unlimited ⚡"; all accent colours unified to purple + gold
- RevenueCat **fully wired on both platforms** — SDK in `app/paywall.tsx`, iOS key (`appl_AgVACahWeoGFdeGJBqcHqHqxyCQ`) + Android key (`goog_cFhSuvMVroPfGsGWVGDYevhwEJR`) in `_layout.tsx`. Android: service account validated, `thinkpop_unlimited_monthly` + `thinkpop_unlimited_annual` products created in Play Console + attached to RC entitlement + offerings.

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
- **Logout wipes all local stores** (playerStore, progressStore, brainStore reset to defaults) → on next login `hydrateStores` pulls from Supabase → progress restored
- **Account deletion**: Supabase Edge Function `delete-account` — deletes brain_scores, level_completions, profiles, then auth user. Called from Settings → Delete Account.

### Auth Flow
- `signUp` → Supabase → if no session (email unconfirmed) → returns `needsConfirmation: true`
- Password reset deep link: `thinkpop://reset` → `app/reset.tsx` (catch screen) → `_layout.tsx` handleUrl detects `reset` in URL → routes to `/reset-password`. Both PKCE (`?code=`) and implicit (`#access_token=`) flows handled.
- Auth screen shows "Check your inbox 📬" state with resend button (30s cooldown)
- `login` → if "Email not confirmed" error → friendly message shown
- Deep links handled in `_layout.tsx` via `Linking.addEventListener` + `Linking.getInitialURL`
- Email confirmation: `thinkpop://confirm#access_token=...` → `setSession` → `initSession` → Journey
- Password reset: `thinkpop://reset#access_token=...&type=recovery` → `/reset-password` screen
- `app/reset-password.tsx`: enter new password + confirm → `updatePassword` → success → Login
- `initSession` called on cold start to restore existing session

## What Has Been Built
A fully working React Native (Expo SDK 54) app in `app/` with:
- All 4 games playable end-to-end with **multi-mode variety systems**
- **101 levels** across 10 worlds, horizontal scrolling map, world background images, boss levels at 10/20/.../100
- **55 Odd One Out puzzle sets**, **90 Pattern sets**, **18 themed Memory emoji sets**, **10 themed Speed emoji pools**
- POP! animations and haptics across all 4 games
- Fail screens (deflating bubble), Win screen (POP! splash, confetti, score counter, "+N pts ⭐" badge)
- Level transition screen (marker travel + next level unlock); "Continue to Journey" button in purple (#8B3FD9)
- Stats tab: 4 domains + premium trend arrows + weekly games count, Weekly Report card (premium full / free locked), guest banner, account row, 32 rotating coach tips
- Lives system (5 hearts, 30-min refill, premium bypass), day streak tracking
- Daily level cap (3 free/day), paywall with feature table
- Supabase auth + real-time sync to cloud (profiles, completions, brain scores)
- Email confirmation flow + password reset flow with deep link handling
- Landing screen (centred logo, SVG card grid, drift/glow animation)
- Auth screen (email login/signup, shake on error, forgot password, continue as guest)
- Onboarding (3 slides + baseline reveal → Landing)

Key files:
- `data/levels.ts` — 101 levels + POS entries (horizontal map)
- `data/oddOneSets.ts` — 55 puzzle sets (used by Logic game)
- `data/patternSets.ts` — 90 pattern rounds (used by Pattern game)
- `data/memoryEmojis.ts` — 18 themed emoji sets (used by Memory game)
- `constants/config.ts` — MAP_WIDTH=16000, NODE_SIZE=80
- `app/(tabs)/journey.tsx` — horizontal map, floating overlays, world banner
- `app/transition.tsx` — level transition screen (purple CTA + purple strength bar)
- `app/paywall.tsx` — monetisation gate (mock purchase)
- `app/reset-password.tsx` — password reset screen
- `app/game/speed.tsx` — Speed game with 3 modes + 10 themed pools + dynamic grid
- `app/game/logic.tsx` — Logic game with 3 modes + timer scaling
- `app/game/pattern.tsx` — Pattern game with 4 modes + sequence length scaling
- `components/games/WinScreen.tsx` — POP! + score counter + transition routing
- `components/games/FailScreen.tsx` — deflating bubble fail state
- `components/path/LevelNode.tsx` — 80px nodes, 5-star display, all unlocked for dev
- `components/path/PathSVG.tsx` — world-coloured SVG road
- `lib/supabase.ts` — Supabase client
- `lib/sync.ts` — push/pull functions (pure I/O, no store imports)
- `lib/userId.ts` — userId singleton (breaks circular import chains)
- `stores/authStore.ts` — Supabase auth + store hydration
- `metro.config.js` — Metro bundler config: custom resolveRequest fixes package boundary issue caused by expo-router v6 requiring `app/app/package.json`
- `app/app/package.json` — required by expo-router v6 (ConfigError otherwise); metro.config.js prevents it from being treated as a Metro package boundary

## Tech Stack
- **React Native + Expo (SDK 54)** — iOS + Android
- **expo-router v6** — file-based navigation; requires `app/app/package.json` (stub, no fields); `metro.config.js` custom `resolveRequest` prevents this from breaking Metro's relative imports
- **Zustand + AsyncStorage** — local state persistence
- **React Native built-in `Animated`** — all animations (no Reanimated)
- **expo-haptics** — tactile feedback
- **@supabase/supabase-js** — backend auth + database sync
- **react-native-url-polyfill** — required for Supabase in React Native
- Backend: Supabase (LIVE — auth, scores, progress)
- Subscriptions: RevenueCat (fully wired iOS + Android)

## Remaining App Store Blockers
1. **EAS project ID** — run `npx eas init` (Apple Developer account now active), update app.json
2. **RevenueCat iOS** — iOS products now approvable; wire real purchase in `app/paywall.tsx` once products approved in App Store Connect
3. **App Store assets** — 1024×1024 icon PNG, screenshots (6.7" + 6.5" displays)
4. **Production build + submit** — `npx eas build --platform ios --profile production` then `npx eas submit`
5. **App Store Connect** — add Privacy Policy URL (iubenda) + T&C URL (fareedfc.github.io/thinkpop-legal/terms.html)

**Done:**
- Apple Developer account ✅
- Privacy Policy: https://www.iubenda.com/privacy-policy/14041250 ✅
- T&C: https://fareedfc.github.io/thinkpop-legal/terms.html ✅ (contact email updated to support@thinkpop.app)
- Android closed testing in progress ✅
- RevenueCat Android fully wired ✅

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
| Feature | Free | Premium ($3.99/mo) |
|---|---|---|
| Daily levels | 3 | Unlimited |
| Game modes | All 4 | All 4 + future |
| Brain Score | Basic | Full breakdown |
| Weekly Report | Summary | Detailed |
| Lives | 5, slow refill | Generous |
| Offline play | No | Yes |

One-time IAP: Level Packs ($2.99), Explorer Kit ($4.99), Extra Lives

## Go-To-Market
- App Store category: **Games** (Brain Games / Puzzle subcategory)
- Support email: support@thinkpop.app
- Facebook/Instagram ads targeting 38–65 with brain health interests
- Taglines: "Train your brain. Stay sharp." / "10 minutes a day. A sharper you."
- Partner with neurologists, senior wellness influencers
