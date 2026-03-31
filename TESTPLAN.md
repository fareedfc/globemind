# ThinkPop — Test Plan
Last updated: 2026-03-30

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
**Expected:** Slides advance to 2, then 3. Dot indicator updates. Slide 2 shows the 4 domain chips (🎴 ⚡ 🔤 🔮).

### OB-03 — Skip goes straight to Landing
1. On slide 1, tap **Skip**
**Expected:** Navigates directly to the Landing screen. `hasOnboarded` is set — restarting the app skips onboarding.

### OB-04 — Baseline animation
1. Advance through all 3 slides, tap **Set My Baseline**
**Expected:** Score counter animates from 0 → 742 over ~1.2s. "Start Your Journey →" button appears after animation completes.

### OB-05 — Completing onboarding lands on Landing
1. Complete the baseline step, tap **Start Your Journey →**
**Expected:** Navigates to the Landing screen. Reopening the app does NOT show onboarding again.

---

## 2. Landing & Auth

### LA-01 — Landing screen shows on app open
**Precondition:** Onboarding already completed
1. Open the app
**Expected:** Landing screen appears with animated globe, "Train your brain. Travel the world." headline, and game chips (Memory, Speed, Logic, Pattern).

### LA-02 — Play button goes to Journey
1. On the Landing screen, tap **Play**
**Expected:** Navigates to the Journey tab.

### LA-03 — Track Progress goes to auth when not logged in
**Precondition:** User is not logged in (guest)
1. On the Landing screen, tap **Track Progress**
**Expected:** Navigates to the Auth screen (`/auth`).

### LA-04 — Track Progress goes to Brain tab when logged in
**Precondition:** User is logged in (authStore.isLoggedIn = true)
1. On the Landing screen, tap **Track Progress**
**Expected:** Navigates directly to the Brain tab, not the Auth screen.

### LA-05 — Sign up creates account and goes to Brain tab
1. On the Auth screen, select **Sign Up** mode
2. Enter a valid email and password, tap **Sign Up**
**Expected:** Account created (stored in authStore). Navigates to the Brain tab. "Signed in as [name/email]" visible in account row.

### LA-06 — Login with correct credentials goes to Brain tab
**Precondition:** Account exists
1. On the Auth screen, select **Log In** mode
2. Enter correct email and password, tap **Log In**
**Expected:** Navigates to the Brain tab. Account row shows correct name/email.

### LA-07 — Login with wrong password shows error
1. On the Auth screen, enter a valid email but wrong password, tap **Log In**
**Expected:** Shake animation plays on the form. Error message shown. No navigation occurs.

---

## 3. Journey Tab

### JO-01 — Path renders correctly
1. Open the Journey tab
**Expected:** Zigzag path visible with level nodes (80px bubbles). Top bar shows miles pill (✈️), lives pill (❤️), streak pill (🔥). Vibe banner shows current level number.

### JO-02 — Completed levels show stars
**Precondition:** At least one level completed
1. Open the Journey tab
**Expected:** Completed level nodes show gold/gradient bubble. Stars rendered below completed nodes (1–3 ⭐).

### JO-03 — Current level pulses
1. Open the Journey tab
**Expected:** The current level node bobs up/down and has a pulsing ring animation.

### JO-04 — Locked levels are non-interactive
1. Tap a dimmed/locked level node
**Expected:** No modal opens. Node does not respond to tap.

### JO-05 — Level modal opens on tap
1. Tap a completed or current level node
**Expected:** Bottom sheet slides up with level emoji, number, domain tag (coloured), description, Play Now button, and Maybe later button.

### JO-06 — Modal dismisses correctly
1. Open a level modal
2. Tap outside the modal (overlay)
**Expected:** Modal slides back down and disappears.
3. Open the modal again, tap **Maybe later**
**Expected:** Same dismissal behaviour.

### JO-07 — Play Now deducts a life
**Precondition:** Lives > 0
1. Open a level modal, tap **Play Now**
**Expected:** Life count in the top bar decreases by 1. Game screen opens.

### JO-08 — Play Now with 0 lives goes to paywall
**Precondition:** Lives = 0 (use all lives or manually set in store)
1. Open a level modal, tap **Play Now**
**Expected:** Navigates to the Paywall screen, not the game.

### JO-09 — Lives countdown shows in top bar
**Precondition:** Lives < 5
1. Open the Journey tab
**Expected:** Lives pill shows `❤️ 3 · 12:44` format with a live countdown ticking down.

---

## 4. Memory Match Game

### MM-01 — Game loads correctly
1. Start a Memory Match level
**Expected:** Grid of face-down cards rendered. Header shows level number and domain. Pair pip indicators shown at bottom (empty circles).

### MM-02 — Card flip reveals emoji
1. Tap a face-down card
**Expected:** Card flips to reveal emoji with a spring pop animation.

### MM-03 — Match stays revealed
1. Flip two cards with the same emoji
**Expected:** Both cards stay revealed (slightly dimmed to indicate matched). A pip lights up teal.

### MM-04 — Mismatch flips back
1. Flip two cards that don't match
**Expected:** After ~900ms both cards flip face-down again. Input is locked during the flip-back animation (tapping other cards does nothing).

### MM-05 — Win condition triggers win screen
1. Match all pairs
**Expected:** Win screen appears after a short delay (~500ms). Stars reflect performance (3⭐ for zero wrong flips, 2⭐ for ≤ totalPairs wrong, 1⭐ otherwise).

### MM-06 — Board difficulty scales with level
1. Play a low-numbered Memory level (e.g. Level 1)
2. Play a higher-numbered Memory level (e.g. Level 7)
**Expected:** Level 1 has 3 pairs (6 cards), higher levels have more pairs (up to 6 pairs / 12 cards).

---

## 5. Odd One Out Game (Logic)

### LG-01 — Game loads correctly
1. Start an Odd One Out (Logic) level
**Expected:** 4 emoji shown in a 2×2 grid. Round counter shows 1/7. Answer timer bar visible. Pip row shows 7 empty circles.

### LG-02 — Answer timer starts immediately
1. Start an Odd One Out level
**Expected:** The 8-second timer bar begins shrinking as soon as the round loads. No tap required to start.

### LG-03 — Correct tap scores and advances
1. Tap the emoji that is the odd one out
**Expected:** Tapped cell highlights teal. Pip for this round lights green. Brief hint shown (e.g. "Not a fruit"). Next round loads after ~1s.

### LG-04 — Wrong tap shows correct answer
1. Tap an emoji that is NOT the odd one out
**Expected:** Tapped cell highlights coral/red. Pip lights red. The actual odd one out is highlighted teal. Hint shown. Next round loads after ~1s.

### LG-05 — Timer timeout counts as wrong
1. Let the 8-second timer expire without tapping
**Expected:** Treated as wrong answer. Pip lights red. Correct answer highlighted. Round advances.

### LG-06 — 7 rounds complete triggers win screen
1. Complete all 7 rounds
**Expected:** Win screen appears. Stars reflect correct count (3⭐ ≥ 6/7, 2⭐ ≥ 4/7, 1⭐ otherwise).

---

## 6. Speed Match Game

### SM-01 — Game loads with Start button
1. Start a Speed Match level
**Expected:** Target symbol and 6-option grid visible but greyed/disabled. Large **▶ Start Game** button shown. Timer bar at 100%.

### SM-02 — Timer counts down on start
1. Tap **▶ Start Game**
**Expected:** Timer bar starts shrinking. Colour shifts: teal (>50%) → gold (25–50%) → coral (<25%). Second counter decrements.

### SM-03 — Correct tap scores points
1. Tap the symbol that matches the target
**Expected:** Brief green flash on the tapped option. Score increments. New round generates immediately (180ms). Combo text shows `✓ +10`.

### SM-04 — Combo multiplier builds
1. Tap correctly 3 times in a row
**Expected:** Combo text shows `🔥 x3 +20`. Points per correct tap increase.

### SM-05 — Wrong tap resets combo
1. Tap incorrectly
**Expected:** Brief red flash on the tapped option. Combo resets. Combo text clears.

### SM-06 — Timer expiry triggers win screen
1. Let the 30-second timer expire
**Expected:** Win screen appears. Stars reflect score (3⭐ > 200pts, 2⭐ > 100pts, 1⭐ otherwise).

---

## 7. Pattern Pulse Game

### PP-01 — Sequence plays automatically
1. Start a Pattern Pulse level
**Expected:** Emoji symbols light up one by one (550ms each) with a teal border. "👀 Watch the sequence..." label shown.

### PP-02 — Symbols dim after sequence
1. Watch the full sequence
**Expected:** All symbols dim. "🤔 What comes next?" label appears. 4 choice buttons become active. Answer timer bar starts.

### PP-03 — Correct answer lights green pip
1. Tap the correct choice
**Expected:** Choice button highlights teal. Pip for this round lights green. Brief full-sequence reveal. Next round starts after 1s.

### PP-04 — Wrong answer lights red pip
1. Tap an incorrect choice
**Expected:** Choice button highlights coral. Pip lights red. Correct answer is highlighted teal. Next round starts after 1s.

### PP-05 — Answer timer timeout counts as wrong
1. Let the 8-second answer timer expire without tapping
**Expected:** Treated as wrong answer. Pip lights red. Round advances.

### PP-06 — 7 rounds complete triggers win screen
1. Complete all 7 rounds
**Expected:** Win screen appears. Stars reflect correct count (3⭐ ≥ 6/7, 2⭐ ≥ 4/7, 1⭐ otherwise).

---

## 8. Win Screen

### WS-01 — Stars animate in
1. Complete any game
**Expected:** Win screen appears. 3 star positions animate in one by one with a spring + rotation effect. Filled stars (⭐) vs empty (☆) match the performance.

### WS-02 — Miles counter animates
1. Complete any game
**Expected:** Large miles number counts up from the previous total to the new total over ~1.2s. "+N Miles ✈️" badge visible.

### WS-03 — Brain insight is domain-relevant
1. Complete a Memory Match game — check the insight card
2. Complete a Speed Match game — check the insight card
**Expected:** Insight text is relevant to the game's brain training area. Should vary between plays (4 possible insights per domain, randomly selected).

### WS-04 — "+N Miles" badge shown
1. Complete any game
**Expected:** "+N Miles ✈️" badge visible below stat cards, showing the exact miles earned for that performance (150, 300, or 500 depending on stars).

### WS-05 — Play Again replays the same level
1. On the win screen, tap **Play Again ↺**
**Expected:** Same game restarts from scratch (same level ID, fresh state).

### WS-06 — Back to Journey returns to path
1. On the win screen, tap **Back to Journey**
**Expected:** Navigates back to Journey tab. The completed level now shows stars on its node. The next level is now current (pulsing).

### WS-07 — Rewards fire exactly once
1. Note the miles total before completing a level
2. Complete the level, view win screen
3. Navigate back to Journey
4. Return to Brain tab — check miles
**Expected:** Miles increased exactly once. Playing Again and returning should NOT double-count.

### WS-08 — Confetti particles burst on win
1. Complete any game
**Expected:** 10 emoji confetti particles animate outward/downward from the centre of the win screen on arrival.

---

## 9. Brain Dashboard

### BD-01 — Miles total shows live value
1. Note miles total before playing
2. Complete a game
3. Open the Brain tab
**Expected:** Miles total matches the updated value shown on the win screen.

### BD-02 — Domain bars update after a game
1. Note the relevant domain % before playing (e.g. Memory before a Memory game)
2. Complete the game
3. Open the Brain tab
**Expected:** The matching domain bar has increased (+3/+6/+10 depending on stars earned).

### BD-03 — Weekly delta is accurate
1. Note the "↑ +N pts this week" value
2. Complete a game
3. Return to Brain tab
**Expected:** Weekly delta increases by the score delta earned in the game.

### BD-04 — Coach Tip targets weakest domain
1. Open the Brain tab
**Expected:** Coach Tip text references the domain with the lowest % bar. As you improve a domain, the tip should shift to the next weakest.

### BD-05 — Sign-in banner shown for guest users
**Precondition:** User is not logged in (authStore.isLoggedIn = false)
1. Open the Brain tab
**Expected:** Gradient "Save your progress · Sign In →" banner visible. Tapping it navigates to `/auth`.

### BD-06 — Streak card shows live streak
1. Complete a game (increments streak)
2. Open the Brain tab
**Expected:** Streak card shows the updated day count.

---

## 10. Lives System

### LV-01 — Lives deducted on play
1. Note lives count in the Journey top bar
2. Play any level
**Expected:** Lives decremented by 1 when Play Now is tapped.

### LV-02 — Refill timer starts after first life lost
**Precondition:** Was at full lives (5)
1. Lose 1 life (play a level)
**Expected:** Lives pill shows `❤️ 4 · 29:59` with a countdown ticking in real time.

### LV-03 — Life refills after 30 minutes
**Precondition:** Lives < 5 and refill timer running
*(For testing, temporarily change `REFILL_MS` in `playerStore.ts` to `60_000` — 1 minute)*
1. Wait for the timer to reach 0:00
**Expected:** Lives increments by 1. Timer resets to 30:00 (or clears if back to full).

### LV-04 — 0 lives shows paywall
1. Use all 5 lives
2. Tap Play Now on any level
**Expected:** Navigates to Paywall screen, not the game.

### LV-05 — Lives persist across app restarts
1. Use 2 lives, note the refill countdown
2. Close and reopen the app
**Expected:** Lives count is still 3 (not reset to 5). Countdown continues from approximately where it left off.

---

## 11. Streak System

### ST-01 — Streak increments on first play of the day
**Precondition:** `lastPlayedDate` is yesterday (or null)
1. Complete any game
**Expected:** Streak counter increments by 1. Visible in Brain tab and Journey top bar.

### ST-02 — Streak does not double-increment same day
1. Complete two games in the same calendar day
**Expected:** Streak only increments once, not twice.

### ST-03 — Streak resets after missing a day
**Precondition:** `lastPlayedDate` is 2+ days ago
*(Simulate by editing store or waiting)*
1. Complete a game
**Expected:** Streak resets to 1, not `streak + 1`.

### ST-04 — Streak persists across app restarts
1. Note streak value
2. Close and reopen the app
**Expected:** Same streak value shown.

---

## 12. Paywall Screen

### PW-01 — Hearts display correctly
1. Navigate to the Paywall screen
**Expected:** 5 heart icons shown. Filled hearts (❤️) match current lives count. Empty slots show 🖤 dimmed.

### PW-02 — Countdown timer ticks in real time
**Precondition:** Lives < 5 and refill timer running
1. Open the Paywall screen
**Expected:** "Next free life in X:XX" countdown ticks down live every second.

### PW-03 — Premium CTA is visible and tappable
1. Open the Paywall screen, tap **Get Premium — $6.99/mo**
**Expected:** Button is tappable (no crash). Currently a no-op placeholder — verify no error thrown.

### PW-04 — Back button works
1. Open the Paywall screen, tap **← Back**
**Expected:** Navigates back to the Journey tab.

### PW-05 — "Go play" appears when lives refill while on screen
**Precondition:** On paywall with 0 lives, 1-minute refill timer
*(Temporarily set `REFILL_MS = 60_000` for this test)*
1. Stay on the paywall screen until the timer expires
**Expected:** "You have 1 life!" message appears with a "Go play →" link. Tapping it returns to Journey.

---

## 13. Persistence (AsyncStorage)

### PS-01 — Miles persist across restarts
1. Complete a game, note the new miles total
2. Force-close and reopen the app
**Expected:** Miles total on Journey top bar and Brain tab matches what was shown before close.

### PS-02 — Level progress persists
1. Complete a level, note which level is now "current" on the path
2. Force-close and reopen the app
**Expected:** Journey path shows the same progression — completed levels still show stars, same current level pulsing.

### PS-03 — Domain scores persist
1. Complete a game, note the domain % in the Brain tab
2. Force-close and reopen the app
**Expected:** Domain bars show the same percentages as before close.

### PS-04 — Miles persist
1. Note air miles on Miles tab
2. Complete a game
3. Force-close and reopen
**Expected:** Miles tab shows the incremented total.

---

## 14. Navigation & General

### NA-01 — Tab switching works
1. Tap each of the 3 tabs (Journey 🗺️, Brain 🧠, Miles ✈️)
**Expected:** Each tab loads its screen. No crashes. Active tab icon highlighted.

### NA-02 — Back navigation from game
1. Start any game, tap the ← back button in the header
**Expected:** Returns to the Journey tab. Life was already deducted (no refund on back).

### NA-03 — No crash on rapid tapping
1. During a Memory Match game, tap cards as fast as possible
**Expected:** No crash. Input locking prevents double-flip bugs.

### NA-04 — Fonts render correctly
1. Open every screen
**Expected:** All text uses Nunito (rounded, not system default serif/sans). Headings are bold/black weight.

### NA-05 — Dark theme consistent across all screens
1. Open every screen
**Expected:** All backgrounds are deep ocean blue (#0B1D3A / #1A3A5C). Gold gradient, teal, coral accents used consistently. No white backgrounds.

---

## Test Execution Tracker

| Test ID | Description | Result | Notes |
|---|---|---|---|
| OB-01 | First launch shows onboarding | | |
| OB-02 | Slide navigation | | |
| OB-03 | Skip goes to Landing | | |
| OB-04 | Baseline animation | | |
| OB-05 | Completing onboarding lands on Landing | | |
| LA-01 | Landing screen shows on app open | | |
| LA-02 | Play button goes to Journey | | |
| LA-03 | Track Progress → auth when guest | | |
| LA-04 | Track Progress → Brain tab when logged in | | |
| LA-05 | Sign up creates account → Brain tab | | |
| LA-06 | Login with correct credentials → Brain tab | | |
| LA-07 | Login with wrong password shows error | | |
| JO-01 | Path renders | | |
| JO-02 | Completed levels show stars | | |
| JO-03 | Current level pulses | | |
| JO-04 | Locked levels non-interactive | | |
| JO-05 | Level modal opens | | |
| JO-06 | Modal dismisses | | |
| JO-07 | Play Now deducts life | | |
| JO-08 | Play Now with 0 lives → paywall | | |
| JO-09 | Lives countdown in top bar | | |
| MM-01 | Memory game loads | | |
| MM-02 | Card flip | | |
| MM-03 | Match stays revealed | | |
| MM-04 | Mismatch flips back | | |
| MM-05 | Win condition | | |
| MM-06 | Difficulty scales | | |
| LG-01 | Odd One Out game loads | | |
| LG-02 | Answer timer starts immediately | | |
| LG-03 | Correct tap scores and advances | | |
| LG-04 | Wrong tap shows correct answer | | |
| LG-05 | Timer timeout = wrong | | |
| LG-06 | 7 rounds wins | | |
| SM-01 | Speed game loads | | |
| SM-02 | Timer counts down | | |
| SM-03 | Correct tap scores | | |
| SM-04 | Combo multiplier | | |
| SM-05 | Wrong tap resets combo | | |
| SM-06 | Timer expiry wins | | |
| PP-01 | Sequence plays | | |
| PP-02 | Symbols dim after sequence | | |
| PP-03 | Correct answer | | |
| PP-04 | Wrong answer | | |
| PP-05 | Timeout = wrong | | |
| PP-06 | 7 rounds wins | | |
| WS-01 | Stars animate | | |
| WS-02 | Miles counter animates | | |
| WS-03 | Brain insight is relevant | | |
| WS-04 | +N Miles badge shown | | |
| WS-05 | Play Again replays | | |
| WS-06 | Back to Journey | | |
| WS-07 | Rewards fire once only | | |
| WS-08 | Confetti particles burst | | |
| BD-01 | Miles total live | | |
| BD-02 | Domain bars update | | |
| BD-03 | Weekly delta accurate | | |
| BD-04 | Coach tip targets weakest | | |
| BD-05 | Sign-in banner shown for guests | | |
| BD-06 | Streak card live | | |
| LV-01 | Lives deducted on play | | |
| LV-02 | Refill timer starts | | |
| LV-03 | Life refills after timer | | |
| LV-04 | 0 lives → paywall | | |
| LV-05 | Lives persist | | |
| ST-01 | Streak increments | | |
| ST-02 | No double-increment | | |
| ST-03 | Streak resets | | |
| ST-04 | Streak persists | | |
| PW-01 | Hearts display | | |
| PW-02 | Countdown ticks | | |
| PW-03 | Premium CTA tappable | | |
| PW-04 | Back button | | |
| PW-05 | Go play on refill | | |
| PS-01 | Miles persist across restarts | | |
| PS-02 | Level progress persists | | |
| PS-03 | Domain scores persist | | |
| PS-04 | Miles persist | | |
| NA-01 | Tab switching | | |
| NA-02 | Back from game | | |
| NA-03 | No crash on rapid tap | | |
| NA-04 | Fonts render | | |
| NA-05 | Dark theme consistent | | |
