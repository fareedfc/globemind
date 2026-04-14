# ThinkPop — Store Listings

---

## iOS App Store

### App Name
ThinkPop

### Subtitle (30 chars max)
Brain Training That Feels Fun

### Category
**Health & Fitness** (primary) — NOT Games. This is critical for discoverability with the 30–70 demographic searching for brain health apps.

### Age Rating
4+

### Description (4000 chars max)

ThinkPop is the brain training game that actually feels like a game.

No homework. No lectures. Just satisfying, pop-worthy challenges that keep your mind sharp — in as little as 10 minutes a day.

── 4 GAME TYPES, ENDLESS VARIETY ──

🧠 Memory Match — flip cards and find the pairs before time runs out
⚡ Speed Match — tap the right symbol faster than your brain says you can
🔍 Odd One Out — spot what doesn't belong and trust your instincts
🌀 Pattern Pulse — read the sequence and predict what comes next

Each game has multiple modes that unlock as you progress, so no two sessions feel the same.

── YOUR JOURNEY, YOUR PACE ──

101 levels across 10 stunning worlds — Forest, Ocean, Animals, Food, Space, Fruits, Weather, Sports, Flags, and the Cosmic Finale. Boss levels every 10 stages. Stars to earn. New worlds to unlock.

It's the kind of progress that keeps you coming back.

── THE POP FEELING ──

Every correct answer. Every level cleared. Every star earned. ThinkPop celebrates every win — big and small — with spring animations and satisfying haptic feedback. You'll feel it as much as see it.

── TRACK YOUR STRENGTHS ──

Your Stats dashboard tracks your performance across Memory, Speed, Logic, and Pattern. Watch your scores grow week by week. A fresh coach tip every day keeps you motivated without the pressure.

── NO LOGIN WALL ──

Start playing instantly as a guest. Sign in when you're ready to save your progress and sync across devices. No account required to enjoy the full game.

── FREE TO PLAY ──

ThinkPop is free. Optional Premium removes ads and unlocks unlimited daily play, full stats breakdown, and detailed weekly reports.

$3.99/month or $24.99/year (save 48%). Start with a 7-day free trial — no charge until the trial ends.

ThinkPop is designed for fun, mental engagement, and daily wellbeing.

### Keywords (100 chars max)
brain training,memory game,mental fitness,daily puzzle,logic,mind workout,pattern,speed,brain game

### Support URL
https://fareedfc.github.io/thinkpop-legal/support.html
*(update to https://thinkpop.app/support once domain is pointed)*

### Privacy Policy URL
https://www.iubenda.com/privacy-policy/14041250

### Terms & Conditions URL
https://fareedfc.github.io/thinkpop-legal/terms.html

### What's New (first release)
Welcome to ThinkPop! Train your brain across 4 game types, 101 levels, and 10 worlds. Every win feels like a pop. 🎉

---

## Google Play Store

### App Name
ThinkPop: Brain Training Games

### Short Description (80 chars max)
Daily brain games that feel like fun, not homework.

### Full Description (4000 chars max)

ThinkPop is the brain training game that actually feels like a game.

No homework. No lectures. Just satisfying, pop-worthy challenges that keep your mind sharp — in as little as 10 minutes a day.

4 GAME TYPES, ENDLESS VARIETY

🧠 Memory Match — flip cards and find the pairs before time runs out
⚡ Speed Match — tap the right symbol faster than your brain says you can
🔍 Odd One Out — spot what doesn't belong and trust your instincts
🌀 Pattern Pulse — read the sequence and predict what comes next

Each game has multiple modes that unlock as you progress, so no two sessions feel the same.

YOUR JOURNEY, YOUR PACE

101 levels across 10 stunning worlds — Forest, Ocean, Animals, Food, Space, Fruits, Weather, Sports, Flags, and the Cosmic Finale. Boss levels every 10 stages. Stars to earn. New worlds to unlock.

THE POP FEELING

Every correct answer, every level cleared, every star earned — ThinkPop celebrates every win with spring animations and satisfying haptic feedback.

TRACK YOUR STRENGTHS

Your Stats dashboard tracks performance across Memory, Speed, Logic, and Pattern. Watch your scores grow week by week. A fresh daily coach tip keeps you motivated.

NO LOGIN WALL

Start playing instantly as a guest. Sign in when ready to save progress and sync across devices.

FREE TO PLAY

ThinkPop is free. Optional Premium removes ads and unlocks unlimited daily play, full stats breakdown, and detailed weekly reports. $3.99/mo or $24.99/yr. Start with a 7-day free trial.

### Category
Health & Fitness

### Content Rating
Everyone

### Tags (Play Store allows 5)
brain training, memory games, puzzle, mental fitness, mind games

### Feature Graphic
1024 × 500px — See `UI assets/` for source files

---

## Shared Assets

### App Icon
- iOS: 1024 × 1024px PNG, no transparency, no rounded corners
- Android: `assets/adaptive-icon.png` — foreground logo on transparent bg, 1024×1024px (⚠️ current file needs transparent bg)

### Screenshots Needed
| Screen | iOS sizes | Android sizes |
|--------|-----------|---------------|
| Journey map | 6.7" + 6.5" | Phone + 7" tablet |
| Game in progress | 6.7" + 6.5" | Phone |
| Win screen | 6.7" + 6.5" | Phone |
| Stats dashboard | 6.7" + 6.5" | Phone |
| Level transition | 6.7" + 6.5" | Phone |

---

## What to Fill In Before Submitting

### eas.json
- `YOUR_APPLE_ID@email.com` — your Apple ID email
- `YOUR_APP_STORE_CONNECT_APP_ID` — numeric ID from App Store Connect app URL
- `YOUR_APPLE_TEAM_ID` — found at developer.apple.com under Membership

### app.json
- `YOUR_EAS_PROJECT_ID` — run `npx eas init` in terminal

### app/_layout.tsx
- `REVENUECAT_IOS_API_KEY_PLACEHOLDER` — from RevenueCat dashboard → Apps → iOS
- `REVENUECAT_ANDROID_API_KEY_PLACEHOLDER` — from RevenueCat dashboard → Apps → Android

### app/paywall.tsx
- `PREMIUM_MONTHLY_ID = 'thinkpop_premium_monthly'` — must match product ID in App Store Connect + Google Play exactly

---

## Build & Submit Commands

### iOS
```bash
# Link to EAS (run once after Apple account active)
npx eas init

# TestFlight build (internal testing)
npx eas build --platform ios --profile preview

# Production build
npx eas build --platform ios --profile production

# Submit to App Store
npx eas submit --platform ios
```

### Android
```bash
# Test APK (install directly on device/emulator)
npx eas build --platform android --profile preview

# Production AAB (Play Store requires .aab not .apk)
npx eas build --platform android --profile production

# Submit to Google Play
npx eas submit --platform android
```
