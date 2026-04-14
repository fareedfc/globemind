# ThinkPop — Launch Plan

Two parallel tracks: **iOS App Store** and **Google Play**. They share most setup steps (RevenueCat, EAS, assets) but have separate store accounts and submission flows.

---

## Track A — Accounts & Services (Do First, Blocks Everything Else)

| Step | Task | Status | Notes |
|------|------|--------|-------|
| A1 | Apple Developer account | ⏳ Pending | developer.apple.com — $99/yr. Approval takes 24–48hrs |
| A2 | Google Play Developer account | ✅ Done | Account active, payments merchant profile set up with bank details |
| A3 | RevenueCat account | ✅ Done | Account created, Android app added, service account JSON uploaded (subscriptions API warning — will clear within 36hrs) |
| A4 | RevenueCat iOS product | ⬜ Todo | Requires A1. Create subscription in App Store Connect first, then add to RevenueCat |
| A5 | RevenueCat Android product | ⏳ In progress | Service account linked. Need to: create subscription in Play Console (blocked until AAB uploaded), then set up entitlements + offerings in RevenueCat dashboard |

---

## Track B — Code Changes (Can Start Now)

| Step | Task | Status | Notes |
|------|------|--------|-------|
| B1 | Android config in `app.json` | ✅ Done | Intent filters added; package name + adaptiveIcon were already set |
| B2 | Adaptive icon asset | ✅ Done | 1024×1024 PNG with alpha — copied to `app/assets/adaptive-icon.png` |
| B3 | Wire RevenueCat in `app/paywall.tsx` | ✅ Done | Real RC calls already in place. Just swap API key placeholders in `_layout.tsx` when account is ready |
| B4 | Status bar config for Android | ✅ Done | `<StatusBar style="dark" translucent={false} />` added to `_layout.tsx` |
| B5 | Re-lock levels | ✅ Done | Reverted `isLocked` + `isInteractive` in `LevelNode.tsx` |
| B6 | EAS project init | ✅ Done | Project ID `1c166a86-761b-4071-90d2-e4e35a7cc4d2` linked, owner `fareedfc` |

---

## Track C — Store Assets

| Step | Task | Status | Notes |
|------|------|--------|-------|
| C1 | iOS screenshots | ✅ Done | Taken — 6.7" (iPhone 15 Pro Max) + 6.5" (iPhone 11 Pro Max) |
| C2 | App icon 1024×1024 PNG | ⬜ Todo | No alpha channel (Apple rejects transparent icons) |
| C3 | Android screenshots | ⬜ Todo | Same screenshots work — Play Store uses phone frame overlays |
| C4 | App preview video (optional) | ⬜ Todo | 15–30s screen recording on iPhone — boosts conversion significantly |
| C5 | Feature graphic (Android) | ⬜ Todo | 1024×500px banner — shown at top of Play Store listing |

---

## Track D — iOS Submission

*Requires: A1, B3, B5, B6, C1, C2*

| Step | Task | Status | Notes |
|------|------|--------|-------|
| D1 | Create app in App Store Connect | ⬜ Todo | appstoreconnect.apple.com — set bundle ID, name, SKU |
| D2 | Create subscription products | ⬜ Todo | Monthly: `thinkpop_premium_monthly` $3.99/mo · Annual: `thinkpop_premium_annual` $24.99/yr · 7-day trial on both |
| D3 | Set up tax & banking | ⬜ Todo | Required before any paid app can go live |
| D4 | Production build | ⬜ Todo | `npx eas build --platform ios --profile production` |
| D5 | Upload to App Store Connect | ⬜ Todo | `npx eas submit --platform ios` or upload via Transporter |
| D6 | Fill out listing | ✅ Ready | Copy finalised in `store-listing.md` — category Health & Fitness, keywords, description, free trial copy |
| D7 | Add Privacy Policy + T&C + Support URLs | ✅ Ready | All 3 URLs live and in settings.tsx + store-listing.md |
| D8 | Age rating questionnaire | ⬜ Todo | Answer questions in App Store Connect — expect 4+ rating |
| D9 | Submit for review | ⬜ Todo | Apple review: 1–3 days typically |

---

## Track E — Android Submission

*Requires: A2, B1, B2, B3, B5, B6, C3, C5*

| Step | Task | Status | Notes |
|------|------|--------|-------|
| E1 | Create app in Google Play Console | ✅ Done | App created, package `com.thinkpop.app` |
| E2 | Create subscription products | ⏳ Blocked | Waiting for AAB upload (E4) before Play Console allows subscription creation. Product ID: `thinkpop_premium_monthly` $3.99/mo |
| E3 | Set up tax & banking | ✅ Done | Google Payments merchant account set up with bank details |
| E4 | Android preview build | ⏳ Building | `eas build --platform android --profile preview` — queued on EAS (~160 min free tier). AAB needed to unblock E2 |
| E5 | Upload AAB to Play Console | ⬜ Todo | Upload preview build to Internal Testing track to unlock subscription creation |
| E6 | Fill out listing | ✅ Ready | Google Play copy finalised in `store-listing.md` — includes short description, full description, tags |
| E7 | Content rating questionnaire | ⬜ Todo | IARC questionnaire in Play Console |
| E8 | Data safety form | ⬜ Todo | Declare what data is collected (email, usage data via Supabase) |
| E9 | Submit for review | ⬜ Todo | Google review: 1–7 days for first submission |

---

## Track F — Testing (Run Before Any Submission)

| Step | Task | Status | Notes |
|------|------|--------|-------|
| F1 | TestFlight build (iOS) | ⬜ Todo | Internal testing — `eas build --profile preview --platform ios` |
| F2 | Android test APK | ⏳ Building | `eas build --profile preview --platform android` — queued, ~160 min |
| F3 | Full play-through on iOS device | ⬜ Todo | All 4 games, win/fail/transition, auth, paywall |
| F4 | Full play-through on Android device | ⬜ Todo | Focus on shadows, status bar, back button, keyboard |
| F5 | Haptics test on real device | ⬜ Todo | Simulator doesn't do haptics |
| F6 | Purchase flow test | ⬜ Todo | Sandbox purchase — Apple & Google both have sandbox environments |
| F7 | Deep link test | ⬜ Todo | Email confirm + password reset links on real device |

---

## Recommended Order

```
Now (no accounts needed):
  B1 → B2 → B4 → B5

When Google Play account ready (A2):
  E1 → E2 → A5 → B3 (Android side of RevenueCat)

When Apple Developer approved (A1):
  A3 → A4 → B6 → D1 → D2 → D3

Build & test:
  F1 → F2 → F3 → F4 → F5 → F6 → F7

Submit:
  D4 → D5 → D6 → D8 → D9  (iOS)
  E4 → E5 → E6 → E7 → E8 → E9  (Android)
```

---

## Key Decisions Still Needed

| Decision | Notes |
|----------|-------|
| Bundle ID / Package name | iOS: `com.thinkpop.thinkapp` · Android: `com.thinkpop.app` — confirmed, can't change after submission |
| Pricing in other regions | App Store Connect auto-converts — worth reviewing key markets |
| Launch iOS first or both together? | iOS first is lower risk; Android 1–2 weeks later is common |
| Pricing | **Finalised: $3.99/mo** · Annual: $24.99/yr (launch price — raise monthly to $4.99 after 500+ reviews) |
| Free trial? | 7-day free trial on both plans — no charge until trial ends |
| Annual product ID | `thinkpop_premium_annual` — create alongside monthly in App Store Connect + Play Console |
