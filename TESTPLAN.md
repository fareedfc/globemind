# GlobeMind — Test Plan
Last updated: 2026-03-29

Run these tests on a physical device (iOS or Android) via Expo Go or a dev build. Each test has a **Steps** section and an **Expected** result. Mark ✅ Pass or ❌ Fail.

---

## 1. Onboarding

### OB-01 — First launch shows onboarding
**Precondition:** Fresh install or AsyncStorage cleared (`hasOnboarded` key absent)
1. Launch the app
**Expected:** Onboarding screen appears (not the Journey tab)

### OB-02 — Slide navigation
1. On slide 1, tap **Next →**
2. Tap **Next →** again
**Expected:** Slides advance to 2, then 3. Dot indicator updates. Slide 2 shows the 4 domain chips (🎴 ⚡ 🔤 🔮).

### OB-03 — Skip goes straight to Journey
1. On slide 1, tap **Skip**
**Expected:** Navigates directly to the Journey tab. `hasOnboarded` is set — restarting the app skips onboarding.

### OB-04 — Baseline animation
1. Advance through all 3 slides, tap **Set My Baseline**
**Expected:** Score counter animates from 0 → 742 over ~1.2s. "Start Your Journey →" button appears after animation completes.

### OB-05 — Completing onboarding lands on Journey
1. Complete the baseline step, tap **Start Your Journey →**
**Expected:** Navigates to Journey tab. Reopening the app does NOT show onboarding again.

---

## 2. Journey Tab

### JO-01 — Path renders correctly
1. Open the Journey tab
**Expected:** Zigzag path visible with level nodes. Top bar shows Brain Score pill (⚡), lives pill (❤️), streak pill (🔥). Vibe banner shows current level number.

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

## 3. Memory Match Game

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

## 4. Word Builder Game

### WB-01 — Game loads correctly
1. Start a Word Builder level
**Expected:** 7 letter tiles shown. Word display shows `_ _ _`. Found words counter shows 0/5.

### WB-02 — Tapping letters builds word
1. Tap 3+ letter tiles in sequence
**Expected:** Letters appear in the word display. Tapped tiles dim (used state). Word display border turns gold.

### WB-03 — Valid word accepted
1. Build a valid word from the tile set and tap **Submit ✓**
**Expected:** Word display flashes green (teal border). Word added to found list with points chip. Tiles reset.

### WB-04 — Invalid word shakes and clears
1. Build an invalid sequence (e.g. random consonants) and tap **Submit ✓**
**Expected:** Word display shakes with red border, then clears automatically.

### WB-05 — Duplicate word silently clears
1. Submit the same valid word twice
**Expected:** Second submission clears without adding to found list or showing error.

### WB-06 — Clear button resets attempt
1. Select 3+ letters, tap **Clear**
**Expected:** Word display resets to `_ _ _`, all tiles become active again.

### WB-07 — Win at 5 words
1. Find 5 valid words
**Expected:** Win screen appears. Stars reflect score (3⭐ ≥ 350pts, 2⭐ ≥ 200pts, 1⭐ otherwise).

---

## 5. Speed Match Game

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

## 6. Pattern Pulse Game

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

## 7. Win Screen

### WS-01 — Stars animate in
1. Complete any game
**Expected:** Win screen appears. 3 star positions animate in one by one with a spring + rotation effect. Filled stars (⭐) vs empty (☆) match the performance.

### WS-02 — Brain Score counter animates
1. Complete any game
**Expected:** Large number counts up from the previous score to the new score over ~1.2s. Gold "+N Brain Score" badge visible.

### WS-03 — Brain insight is domain-relevant
1. Complete a Memory Match game — check the insight card
2. Complete a Speed Match game — check the insight card
**Expected:** Insight text is relevant to the game's cognitive domain. Should vary between plays (4 possible insights per domain, randomly selected).

### WS-04 — +120 miles badge shown
1. Complete any game
**Expected:** "✈️ +120 air miles earned" badge visible below stat cards.

### WS-05 — Play Again replays the same level
1. On the win screen, tap **Play Again ↺**
**Expected:** Same game restarts from scratch (same level ID, fresh state).

### WS-06 — Back to Journey returns to path
1. On the win screen, tap **Back to Journey**
**Expected:** Navigates back to Journey tab. The completed level now shows stars on its node. The next level is now current (pulsing).

### WS-07 — Rewards fire exactly once
1. Note the Brain Score before completing a level
2. Complete the level, view win screen
3. Navigate back to Journey
4. Return to Brain tab — check score
**Expected:** Score increased exactly once. Playing Again and returning should NOT double-count.

---

## 8. Brain Dashboard

### BD-01 — Brain Score shows live value
1. Note score before playing
2. Complete a game
3. Open the Brain tab
**Expected:** Score matches the updated value shown on the win screen.

### BD-02 — Domain bars update after a game
1. Note the relevant domain % before playing (e.g. Working Memory before a Memory game)
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

### BD-05 — Attention & Focus shown as coming soon
1. Open the Brain tab
**Expected:** Attention & Focus row is dimmed with "Coming soon" label. No % shown.

### BD-06 — Streak card shows live streak
1. Complete a game (increments streak)
2. Open the Brain tab
**Expected:** Streak card shows the updated day count.

---

## 9. Lives System

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

## 10. Streak System

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

## 11. Paywall Screen

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

## 12. Persistence (AsyncStorage)

### PS-01 — Score persists across restarts
1. Complete a game, note the new Brain Score
2. Force-close and reopen the app
**Expected:** Brain Score on Journey top bar and Brain tab matches what was shown before close.

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
2. Complete a game (+120 miles)
3. Force-close and reopen
**Expected:** Miles tab shows the incremented total.

---

## 13. Navigation & General

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
**Expected:** All backgrounds are deep navy (#1a1a2e / #16213e). Gold, teal, coral accents used consistently. No white backgrounds.

---

## Test Execution Tracker

| Test ID | Description | Result | Notes |
|---|---|---|---|
| OB-01 | First launch shows onboarding | | |
| OB-02 | Slide navigation | | |
| OB-03 | Skip goes to Journey | | |
| OB-04 | Baseline animation | | |
| OB-05 | Completing onboarding | | |
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
| WB-01 | Word game loads | | |
| WB-02 | Building a word | | |
| WB-03 | Valid word accepted | | |
| WB-04 | Invalid word shakes | | |
| WB-05 | Duplicate clears | | |
| WB-06 | Clear button | | |
| WB-07 | Win at 5 words | | |
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
| WS-02 | Score counter animates | | |
| WS-03 | Brain insight is relevant | | |
| WS-04 | +120 miles badge | | |
| WS-05 | Play Again replays | | |
| WS-06 | Back to Journey | | |
| WS-07 | Rewards fire once only | | |
| BD-01 | Brain Score live | | |
| BD-02 | Domain bars update | | |
| BD-03 | Weekly delta accurate | | |
| BD-04 | Coach tip targets weakest | | |
| BD-05 | Focus domain coming soon | | |
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
| PS-01 | Score persists | | |
| PS-02 | Level progress persists | | |
| PS-03 | Domain scores persist | | |
| PS-04 | Miles persist | | |
| NA-01 | Tab switching | | |
| NA-02 | Back from game | | |
| NA-03 | No crash on rapid tap | | |
| NA-04 | Fonts render | | |
| NA-05 | Dark theme consistent | | |
