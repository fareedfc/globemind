# ThinkPop — Test Plan
Last updated: 2026-04-01

Run these tests on a physical device (iOS or Android) via Expo Go or a dev build. Each test has a **Steps** section and an **Expected** result. Mark ✅ Pass or ❌ Fail.

---

## 1. Onboarding

### OB-01 — First launch shows onboarding
**Precondition:** Fresh install or AsyncStorage cleared (`hasOnboarded` key absent)
1. Launch the app
**Expected:** Onboarding screen appears (not the Landing screen)

### OB-02 — Slide navigation
1. On slide 1, tap **Next →**
2. Tap **Next →** again
**Expected:** Slides advance to 2, then 3. Dot indicator updates. Slide 2 shows the 4 domain chips.

### OB-03 — Skip goes straight to Landing
1. On slide 1, tap **Skip**
**Expected:** Navigates directly to the Landing screen. `hasOnboarded` is set — restarting the app skips onboarding.

### OB-04 — Baseline animation
1. Advance through all 3 slides, tap **Set My Baseline**
**Expected:** Score card shown with 0. "Start Your Journey →" button visible.

### OB-05 — Completing onboarding lands on Landing
1. Complete the baseline step, tap **Start Your Journey →**
**Expected:** Navigates to the Landing screen. Reopening the app does NOT show onboarding again.

---

## 2. Landing & Auth

### LA-01 — Landing screen shows on app open
**Precondition:** Onboarding already completed
1. Open the app
**Expected:** Landing screen appears. ThinkPop logo is **centred** (not left-aligned). 4 SVG category cards (Pattern/Memory/Logic/Speed) visible in loose grid, slowly drifting. Light mint background.

### LA-02 — Play Now button goes to Journey
1. On the Landing screen, tap **Play Now →**
**Expected:** Navigates to the Journey tab.

### LA-03 — Track Progress goes to auth when not logged in
**Precondition:** User is not logged in (guest)
1. On the Landing screen, tap **Track Progress**
**Expected:** Navigates to the Auth screen.

### LA-04 — Track Progress goes to Brain tab when logged in
**Precondition:** User is logged in (authStore.isLoggedIn = true)
1. On the Landing screen, tap **Track Progress**
**Expected:** Navigates directly to the Brain tab.

### LA-05 — Sign up creates account
1. On the Auth screen, select **Sign Up**, enter valid email + password, tap **Sign Up**
**Expected:** Navigates to Brain tab. "Signed in as [email]" visible in account row.

### LA-06 — Login with wrong password shows error
1. On the Auth screen, enter valid email but wrong password, tap **Log In**
**Expected:** Shake animation plays. Error message shown. No navigation.

---

## 3. Journey Tab

### JO-01 — Path renders with 50 levels
1. Open the Journey tab, scroll the full path
**Expected:** 50 level nodes visible. Path is scrollable. 5 boss nodes (at levels 10, 20, 30, 40, 50) may be visually distinct. Decorative emoji scattered in background.

### JO-02 — Completed levels show stars
**Precondition:** At least one level completed
1. Open the Journey tab
**Expected:** Completed level nodes show gold bubble. Stars rendered below node (1–3 ⭐).

### JO-03 — Current level pulses and pops on load
1. Open the Journey tab
**Expected:** Current level node (Level 4 by default) bobs up/down with a pulsing ring. If first time loading, it springs in (pop animation from scale 0).

### JO-04 — Locked levels are non-interactive
1. Tap a dimmed/locked level node
**Expected:** No modal opens.

### JO-05 — Level modal opens on tap
1. Tap a completed or current level node
**Expected:** Bottom sheet slides up with level emoji, number, domain tag (coloured), description, Play Now button, Maybe later button.

### JO-06 — Modal dismisses correctly
1. Open a level modal, tap outside the modal or tap **Maybe later**
**Expected:** Modal slides back down.

### JO-07 — Play Now deducts a life
**Precondition:** Lives > 0
1. Open a level modal, tap **Play Now**
**Expected:** Life count decreases by 1. Game screen opens.

### JO-08 — Play Now with 0 lives goes to paywall
**Precondition:** Lives = 0
1. Open a level modal, tap **Play Now**
**Expected:** Navigates to Paywall screen.

### JO-09 — Score and streak visible in top bar
1. Open the Journey tab
**Expected:** Top bar shows: ⭐ score pill (gold), ❤️ lives pill (red), 🔥 streak pill (teal).

---

## 4. Memory Match Game

### MM-01 — Game loads correctly
1. Start a Memory Match level
**Expected:** Grid of face-down cards rendered. Header shows level + domain. Pair pip indicators shown.

### MM-02 — Card flip reveals emoji
1. Tap a face-down card
**Expected:** Card flips to reveal emoji with spring pop animation.

### MM-03 — Match stays revealed + pop
1. Flip two cards with the same emoji
**Expected:** Both stay revealed. Pip lights teal. Pop animation + haptic on match.

### MM-04 — Mismatch flips back
1. Flip two non-matching cards
**Expected:** After ~900ms both flip back. Input locked during flip-back.

### MM-05 — Win condition triggers win screen
1. Match all pairs
**Expected:** Win screen appears. POP! splash fires first, then stars animate, then score counter.

### MM-06 — Board difficulty scales with level
1. Play Level 1 (Memory), then a higher Memory level
**Expected:** Level 1 has 3 pairs (6 cards); higher levels have more pairs.

---

## 5. Odd One Out Game (Logic)

### LG-01 — Game loads correctly
1. Start an Odd One Out level
**Expected:** 4 emoji in 2×2 grid. Round counter 1/7. Timer bar visible. 7 pip circles.

### LG-02 — Correct tap scores and advances
1. Tap the odd one out
**Expected:** Cell highlights teal. Pip green. Hint shown ("Not a fruit"). Light haptic. Next round loads.

### LG-03 — Wrong tap shows correct answer + haptic
1. Tap a non-odd emoji
**Expected:** Tapped cell highlights coral. Pip red. Correct answer highlighted. Medium haptic. Hint shown.

### LG-04 — Timer timeout counts as wrong
1. Let the 8-second timer expire
**Expected:** Treated as wrong. Pip red. Round advances.

### LG-05 — 7 rounds triggers win screen
1. Complete all 7 rounds
**Expected:** Win screen with POP! splash. Stars: 3⭐ ≥ 6/7, 2⭐ ≥ 4/7, 1⭐ otherwise.

---

## 6. Speed Match Game

### SM-01 — Game loads with Start button
1. Start a Speed Match level
**Expected:** Target symbol and 6-option grid visible. 6 option cards show correctly in 3×2 grid (full width, not narrow strips). **▶ Start Game** button shown.

### SM-02 — Cards are full width (not narrow strips)
1. Start any Speed Match level
**Expected:** Each of the 6 option cards fills approximately 1/3 of the available width. Cards are roughly square, showing the emoji clearly.

### SM-03 — Timer counts down on start
1. Tap **▶ Start Game**
**Expected:** Timer bar shrinks. Colour shifts: teal → gold → coral. Second counter decrements.

### SM-04 — Correct tap scores + pop animation
1. Tap the matching symbol
**Expected:** Green flash on tapped option + spring pop animation. Score increments. Combo text shows `✓ +10`. Light haptic.

### SM-05 — Combo multiplier builds
1. Tap correctly 3 times in a row
**Expected:** Combo text shows `🔥 x3 +20`.

### SM-06 — Wrong tap resets combo + haptic
1. Tap incorrectly
**Expected:** Red flash. Combo resets. Medium haptic.

### SM-07 — Timer expiry triggers win screen
1. Let the 30-second timer expire
**Expected:** Win screen with POP! splash. Stars: 3⭐ > 200pts, 2⭐ > 100pts, 1⭐ otherwise.

---

## 7. Pattern Pulse Game

### PP-01 — Sequence plays automatically
1. Start a Pattern Pulse level
**Expected:** Emoji symbols light up one by one (550ms each). "👀 Watch the sequence..." label shown.

### PP-02 — Symbols dim after sequence
1. Watch the full sequence
**Expected:** Symbols dim. "🤔 What comes next?" label. 4 choice buttons active. Answer timer starts.

### PP-03 — Correct answer + pop
1. Tap the correct choice
**Expected:** Button highlights teal + spring pop. Pip green. Light haptic. Next round starts after 1s.

### PP-04 — Wrong answer + haptic
1. Tap an incorrect choice
**Expected:** Button highlights coral. Pip red. Medium haptic. Correct answer highlighted.

### PP-05 — 7 rounds triggers win screen
1. Complete all 7 rounds
**Expected:** Win screen with POP! splash.

---

## 8. Win Screen

### WS-01 — POP! splash fires on arrival
1. Complete any game
**Expected:** "POP! 🎉" text springs in (scale 0→1), holds ~380ms, fades out. Win content (stars, score) appears after POP! fades.

### WS-02 — Stars animate in after POP!
1. Complete any game
**Expected:** 3 star positions animate in one by one with spring + rotation, after POP! fades. Filled ⭐ vs empty ☆ match performance.

### WS-03 — Score counter animates
1. Complete any game
**Expected:** Score number counts up from previous total to new total over ~1.2s. "+N pts ⭐" badge visible.

### WS-04 — Brain insight is domain-relevant
1. Complete a Memory game, check insight card
2. Complete a Speed game, check insight card
**Expected:** Insight text is relevant to the brain training area. Varies between plays.

### WS-05 — Confetti particles burst on win
1. Complete any game
**Expected:** 10 emoji particles animate outward from centre of win screen.

### WS-06 — Play Again replays same level
1. Tap **Play Again ↺**
**Expected:** Same game restarts from scratch.

### WS-07 — Back to Journey triggers transition screen
1. On the win screen (for any level except 50), tap **Back to Journey**
**Expected:** Navigates to the **Level Transition screen** — NOT directly to Journey.

### WS-08 — Rewards fire exactly once
1. Note score before completing a level
2. Complete the level, view win screen, navigate back
3. Check Brain tab score
**Expected:** Score increased exactly once. Playing Again and navigating back does NOT double-count.

---

## 9. Level Transition Screen

### LT-01 — Transition screen appears after Back to Journey
**Precondition:** Completed a level that is not the last (Level 50)
1. On win screen, tap **Back to Journey**
**Expected:** Level transition screen appears (not Journey directly).

### LT-02 — Mini path scene shows two nodes
1. On the transition screen
**Expected:** Two circular nodes visible — completed level (gold) and next level (teal) — connected by a dashed line. Nodes are positioned on left/right sides matching the actual journey zigzag.

### LT-03 — Star marker travels from node A to node B
1. Watch the transition animation
**Expected:** ⭐ marker appears at the completed level node and travels to the next level node over ~1.1 seconds with smooth easing.

### LT-04 — Next level pops open on marker arrival
1. Watch the transition animation reach node B
**Expected:** Haptic fires. Next level node springs in with scale burst (0→1.3→1). Glow pulse begins around the node.

### LT-05 — "Level N Unlocked!" appears
1. After marker arrives
**Expected:** "Level N Unlocked!" text animates in with domain name and description below it.

### LT-06 — Continue button appears and works
1. Tap **Continue to Journey →**
**Expected:** Navigates to the Journey tab. The next level is now current and pulsing.

### LT-07 — No transition on final level
**Precondition:** Complete Level 50 (final boss)
1. On win screen, tap **Back to Journey**
**Expected:** Navigates directly to Journey tab (no transition screen — there is no Level 51).

---

## 10. Brain Dashboard

### BD-01 — Score total shows live value
1. Note score before playing, complete a game, open Brain tab
**Expected:** Score total matches the updated value from the win screen.

### BD-02 — Domain bars update after a game
1. Note relevant domain % before playing, complete the game, open Brain tab
**Expected:** Matching domain bar has increased.

### BD-03 — Weekly delta is accurate
1. Note "↑ +N pts this week", complete a game, return to Brain tab
**Expected:** Weekly delta increases by score earned.

### BD-04 — Coach Tip targets weakest domain
1. Open the Brain tab
**Expected:** Coach Tip references the domain with the lowest % bar.

### BD-05 — Sign-in banner shown for guest users
**Precondition:** Not logged in
1. Open the Brain tab
**Expected:** Gradient "Save your progress · Sign In →" banner visible. Tapping navigates to `/auth`.

### BD-06 — Only 2 tabs in nav bar
1. Look at the bottom tab bar
**Expected:** Only 2 tabs visible: Journey (🗺️) and Brain (🧠).

---

## 11. Lives System

### LV-01 — Lives deducted on play
1. Note lives count; play any level
**Expected:** Lives decremented by 1 when Play Now is tapped.

### LV-02 — Refill timer in top bar
**Precondition:** Lives < 5
1. Open Journey tab
**Expected:** Lives pill shows `❤️ N · MM:SS` with live countdown.

### LV-03 — Life refills after timer
*(Temporarily set `REFILL_MS = 60_000` in playerStore.ts for this test)*
1. Wait for timer to reach 0:00
**Expected:** Lives increments by 1. Timer resets or clears if back to full.

### LV-04 — 0 lives shows paywall
1. Use all lives, tap Play Now
**Expected:** Paywall screen, not the game.

### LV-05 — Lives persist across app restarts
1. Use 2 lives, note countdown; close and reopen app
**Expected:** Lives still at 3. Countdown continues approximately where it left off.

---

## 12. Streak System

### ST-01 — Streak increments on first play of the day
**Precondition:** `lastPlayedDate` is yesterday (or null)
1. Complete any game
**Expected:** Streak counter increments by 1.

### ST-02 — No double-increment same day
1. Complete two games in the same calendar day
**Expected:** Streak only increments once.

### ST-03 — Streak persists across restarts
1. Note streak value; close and reopen app
**Expected:** Same streak value shown.

---

## 13. Paywall Screen

### PW-01 — Hearts display correctly
1. Navigate to the Paywall screen
**Expected:** Hearts shown matching current lives count.

### PW-02 — Countdown timer ticks
**Precondition:** Lives < 5 and refill timer running
1. Open Paywall screen
**Expected:** "Next free life in X:XX" countdown ticks live.

### PW-03 — Back button works
1. Tap **← Back**
**Expected:** Returns to Journey tab.

---

## 14. Persistence (AsyncStorage)

### PS-01 — Score persists across restarts
1. Complete a game; force-close and reopen
**Expected:** Score on Journey top bar and Brain tab matches pre-close value.

### PS-02 — Level progress persists
1. Complete a level; force-close and reopen
**Expected:** Completed levels still show stars. Same current level pulsing.

### PS-03 — Domain scores persist
1. Note domain % in Brain tab; force-close and reopen
**Expected:** Domain bars show same percentages.

---

## 15. Navigation & General

### NA-01 — Tab switching works
1. Tap Journey (🗺️) and Brain (🧠) tabs
**Expected:** Each tab loads. No crashes. Only 2 tabs in nav bar.

### NA-02 — Back from game returns to Journey
1. Start any game, tap ← in header
**Expected:** Returns to Journey tab. Life already deducted (no refund).

### NA-03 — No crash on rapid tapping
1. During Memory Match, tap cards as fast as possible
**Expected:** No crash. Input locking prevents double-flip bugs.

### NA-04 — Fonts render correctly
1. Open every screen
**Expected:** All text uses Nunito (rounded). Headings bold/black weight.

### NA-05 — Light theme consistent across all screens
1. Open every screen
**Expected:** Light mint/cream backgrounds. Orange/teal/coral accents. No dark backgrounds.

---

## Test Execution Tracker

| Test ID | Description | Result | Notes |
|---|---|---|---|
| OB-01 | First launch shows onboarding | | |
| OB-02 | Slide navigation | | |
| OB-03 | Skip goes to Landing | | |
| OB-04 | Baseline animation | | |
| OB-05 | Completing onboarding lands on Landing | | |
| LA-01 | Landing screen — centred logo, SVG cards | | |
| LA-02 | Play Now → Journey | | |
| LA-03 | Track Progress → auth when guest | | |
| LA-04 | Track Progress → Brain when logged in | | |
| LA-05 | Sign up creates account | | |
| LA-06 | Login wrong password shows error | | |
| JO-01 | Path renders 50 levels | | |
| JO-02 | Completed levels show stars | | |
| JO-03 | Current level pulses + pops on load | | |
| JO-04 | Locked levels non-interactive | | |
| JO-05 | Level modal opens | | |
| JO-06 | Modal dismisses | | |
| JO-07 | Play Now deducts life | | |
| JO-08 | Play Now with 0 lives → paywall | | |
| JO-09 | Score and streak in top bar | | |
| MM-01 | Memory game loads | | |
| MM-02 | Card flip | | |
| MM-03 | Match stays + pop | | |
| MM-04 | Mismatch flips back | | |
| MM-05 | Win condition | | |
| MM-06 | Difficulty scales | | |
| LG-01 | Logic game loads | | |
| LG-02 | Correct tap + haptic | | |
| LG-03 | Wrong tap + haptic | | |
| LG-04 | Timer timeout = wrong | | |
| LG-05 | 7 rounds wins | | |
| SM-01 | Speed game loads | | |
| SM-02 | Cards are full width (not strips) | | |
| SM-03 | Timer counts down | | |
| SM-04 | Correct tap + pop animation | | |
| SM-05 | Combo multiplier | | |
| SM-06 | Wrong tap resets combo | | |
| SM-07 | Timer expiry wins | | |
| PP-01 | Sequence plays | | |
| PP-02 | Symbols dim after sequence | | |
| PP-03 | Correct answer + pop | | |
| PP-04 | Wrong answer + haptic | | |
| PP-05 | 7 rounds wins | | |
| WS-01 | POP! splash fires first | | |
| WS-02 | Stars animate after POP! | | |
| WS-03 | Score counter animates | | |
| WS-04 | Brain insight relevant | | |
| WS-05 | Confetti burst | | |
| WS-06 | Play Again replays | | |
| WS-07 | Back to Journey → transition screen | | |
| WS-08 | Rewards fire once only | | |
| LT-01 | Transition screen appears | | |
| LT-02 | Mini path shows two nodes | | |
| LT-03 | Star marker travels A→B | | |
| LT-04 | Next level pops open on arrival | | |
| LT-05 | "Level N Unlocked!" appears | | |
| LT-06 | Continue button works | | |
| LT-07 | No transition on final level | | |
| BD-01 | Score total live | | |
| BD-02 | Domain bars update | | |
| BD-03 | Weekly delta accurate | | |
| BD-04 | Coach tip targets weakest | | |
| BD-05 | Sign-in banner for guests | | |
| BD-06 | Only 2 tabs in nav bar | | |
| LV-01 | Lives deducted on play | | |
| LV-02 | Refill timer in top bar | | |
| LV-03 | Life refills after timer | | |
| LV-04 | 0 lives → paywall | | |
| LV-05 | Lives persist | | |
| ST-01 | Streak increments | | |
| ST-02 | No double-increment | | |
| ST-03 | Streak persists | | |
| PW-01 | Hearts display | | |
| PW-02 | Countdown ticks | | |
| PW-03 | Back button | | |
| PS-01 | Score persists | | |
| PS-02 | Level progress persists | | |
| PS-03 | Domain scores persist | | |
| NA-01 | Tab switching (2 tabs) | | |
| NA-02 | Back from game | | |
| NA-03 | No crash on rapid tap | | |
| NA-04 | Fonts render | | |
| NA-05 | Light theme consistent | | |
