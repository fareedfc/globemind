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

### 1. Memory Match — Working Memory
- Classic card flip-and-match
- Cards show emoji on reveal
- Pip indicators track pairs found
- Board size scales with level difficulty (3 pairs → 6 pairs)
- Win: find all pairs

### 2. Word Builder — Verbal Fluency
- Letter tiles laid out in a grid
- Tap letters to build words
- Submit to validate against word list
- Clear button to reset current attempt
- Win: find 5 valid words
- Letters: curated sets (TRAVELS, WORLDS, JOURNEY etc.)

### 3. Speed Match — Processing Speed
- Target symbol shown at top
- 6 options shown in 3x2 grid below
- Tap the matching symbol as fast as possible
- 30 second timer with colour-shifting bar (teal→gold→coral)
- Combo multiplier for consecutive correct answers
- Win: timer runs out (score based)

### 4. Pattern Pulse — Pattern Recognition
- Sequence of emoji lights up one by one
- Then goes dim — player must remember
- 4 choices shown: pick what comes next
- 8 second answer timer
- 7 rounds per game, various pattern types (AB, AAB, ABC repeat, odd-one-out)
- Win: complete all 7 rounds (score = correct answers)

## Cognitive Domains Tracked
1. 🧩 Working Memory
2. ⚡ Processing Speed
3. 🔤 Verbal Fluency
4. 🔮 Pattern Recognition
5. 🎯 Attention & Focus (planned, not yet built)

Each completed game updates the player's Brain Score and domain percentages.

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

## What Has Been Prototyped
A fully working HTML prototype exists (`globemind.html`) with:
- All 4 games playable end-to-end
- Scrolling zigzag level path (15 levels)
- Bottom sheet level modal
- Win screen with brain insight
- Brain tab with domain bars
- Miles tab with passport stamps
- Brain score updates live after each game
- Candy Crush-style visual feel

The prototype is a single HTML file with vanilla JS — no framework, no build step.

## Tech Stack Decision (TBD)
The prototype is vanilla HTML/CSS/JS. For production, recommend:
- **React Native** or **Expo** for cross-platform mobile (iOS + Android)
- OR **Capacitor** wrapping a React/Vue web app for faster iteration
- Backend: Firebase or Supabase for auth, scores, streaks
- Consider keeping web-first with PWA for faster MVP

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
