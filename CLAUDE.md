# GlobeMind — Claude Code Context

## What is GlobeMind?
A mobile-first cognitive training game targeting **30–70 year olds**. Think Candy Crush meets brain training — but without the patronising "homework" feel of Lumosity or BrainHQ. The game is free-flowing, visually beautiful, and emotionally engaging. Players feel like world travellers, not students.

## The Core Insight
The 30–70 demographic is massively underserved in mobile gaming. They have:
- High disposable income
- Real motivation to stay cognitively sharp
- Daily phone habits but few games made *for* them
- Willingness to pay if the value feels legitimate

Existing brain training apps (Lumosity, BrainHQ) feel like homework. GlobeMind feels like Candy Crush but makes you smarter.

## Theme & Aesthetic
- **World travel** — the visual backdrop is a beautiful illustrated world map / journey
- The theme is **loose and atmospheric**, NOT rigid city-to-lesson mapping
- Players are on a "journey" — not enrolled in a geography class
- Dark, premium aesthetic: deep navy background (#1a1a2e), gold accents (#FFD166), teal highlights (#06D6A0)
- Font: Nunito (rounded, friendly, readable for older users)
- NO flashing, NO chaos, NO EDM music — calm but engaging

## Navigation Structure
3 tabs:
1. **Journey** (🗺️) — The main Candy Crush-style scrolling path with level nodes
2. **Brain** (🧠) — Cognitive domain scores and weekly report
3. **Miles** (✈️) — Passport stamps and air miles rewards

## The Level Path
- Zigzag scrolling path (like Candy Crush), NOT a world map with pinned cities
- Level nodes are colourful bubbles with emoji
- Tapping a node opens a bottom sheet modal with level info + Play button
- Levels rotate across all 4 game types — no rigid topic locking per level
- Stars (1–3) shown under completed nodes
- Current level has a glowing pulsing animation
- Locked levels are dimmed and non-interactive

## The 4 Game Modes

### 1. Memory Match — Memory
- Classic card flip-and-match
- Cards show emoji on reveal
- Pip indicators track pairs found
- Board size scales with level difficulty (3 pairs → 6 pairs)
- Win: find all pairs

### 2. Odd One Out — Logic
- 4 emoji shown in a 2×2 grid
- 3 belong to a group, 1 is the odd one out
- Tap the one that doesn't belong before the 8 second timer runs out
- Brief hint shown after each round ("Not a fruit")
- 7 rounds per game
- Win: complete all 7 rounds (score = correct answers)

### 3. Speed Match — Speed
- Target symbol shown at top
- 6 options shown in 3x2 grid below
- Tap the matching symbol as fast as possible
- 30 second timer with colour-shifting bar (teal→gold→coral)
- Combo multiplier for consecutive correct answers
- Win: timer runs out (score based)

### 4. Pattern Pulse — Pattern
- Sequence of emoji lights up one by one
- Then goes dim — player must remember
- 4 choices shown: pick what comes next
- 8 second answer timer
- 7 rounds per game, various pattern types (AB, AAB, ABC repeat)
- Win: complete all 7 rounds (score = correct answers)

## Brain Training Areas Tracked
1. 🧩 Memory
2. ⚡ Speed
3. 🔤 Logic
4. 🔮 Pattern
5. 🎯 Focus (planned, not yet built)

Each completed game updates the player's Brain Score and training area percentages.

**Important:** We never use the word "cognitive" in the product. We frame GlobeMind as a brain training / wellness tool. Regulators scrutinise cognitive ability claims for computer games — our language stays warm and wellness-oriented ("sharpen your mind", "mental fitness", "brain workout").

## Brain Score System
- Composite score across all 5 domains
- Shown as a single number (e.g. 742)
- Radar/bar breakdown per domain
- Weekly delta shown ("↑ +38 pts this week")
- Percentile rank vs age group ("Sharper than 71% your age")
- Coach Tip: personalised advice based on weakest domain

## Rewards & Progression
- **Air Miles**: earned per completed level (+120 miles)
- **Brain Points**: earned per game (+varies by performance)
- **Passport Stamps**: milestone rewards (Explorer, Wordsmith, Speedster etc.)
- **Day Streak**: daily play tracked with fire emoji counter
- Lives system (5 hearts, refill over time) — Candy Crush monetisation hook

## Monetisation Plan
| Feature | Free | Premium ($6.99/mo) |
|---|---|---|
| Daily levels | 3 | Unlimited |
| Game modes | All 4 | All 4 + future modes |
| Brain Score | Basic | Full breakdown |
| Weekly Report | Summary | Detailed |
| Lives | 5, slow refill | Generous |
| Offline play | No | Yes |
| Secret destinations | No | Yes |

One-time IAP: Continent Packs ($2.99), Explorer Kit ($4.99), Extra Lives

## What Has Been Built
A fully working React Native (Expo) app exists in `app/` with:
- All 4 games playable end-to-end (Memory Match, Odd One Out, Speed Match, Pattern Pulse)
- Scrolling zigzag level path (15 levels)
- Bottom sheet level modal
- Win screen with brain insight
- Brain tab with training area bars
- Miles tab with passport stamps
- Brain score updates live after each game
- Lives system with refill timer
- Day streak tracking
- Local persistence via AsyncStorage (Zustand)
- Onboarding flow with animated baseline reveal

A legacy HTML prototype also exists (`globemind_prototype.html`) — single file, vanilla JS, for reference only.

## Tech Stack
- **React Native + Expo (SDK 54)** — cross-platform mobile (iOS + Android)
- **expo-router** — file-based navigation
- **Zustand + AsyncStorage** — local state persistence
- **React Native built-in `Animated`** — animations (no Reanimated dependency)
- Backend (planned): Supabase for auth/scores, RevenueCat for subscriptions

## Key Design Principles
1. **Never make the player feel dumb** — frame difficulty as "brain warming up"
2. **Start every session with an easy win**
3. **Celebrate improvement, not just success**
4. **No panic timers** — gentle pressure only
5. **Sessions should be 5–10 minutes** — fits a morning coffee ritual
6. **Large text, high contrast, accessible UI** — this audience needs it
7. **No reflexes required** — skill and memory, not twitch speed

## Target User
- Age 30–70, skewing 40–60
- Motivated by cognitive health / fear of decline
- Has disposable income
- Uses Facebook/Instagram (not TikTok)
- Plays games casually during commutes, coffee breaks, evenings
- Responds to "mental fitness" framing, not "game" framing
- Influenced by health/wellness content creators and doctors

## Go-To-Market
- Position as **mental fitness app**, not a game
- App Store category: Health & Fitness (not Games)
- Facebook/Instagram ads targeting 38–65 with travel + brain health interests
- Tagline options:
  - "Explore the world. Sharpen your mind."
  - "10 minutes a day keeps cognitive decline away."
  - "The travel app for your brain."
- Partner with neurologists, senior wellness influencers
- Referral: share passport stamp on social ("Can you beat my score?")
