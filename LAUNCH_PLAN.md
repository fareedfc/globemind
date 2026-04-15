# ThinkPop — Launch Plan

Pricing finalised: **$3.99/mo · $24.99/yr** · 7-day free trial on both  
Bundle IDs: iOS `com.thinkpop.thinkapp` · Android `com.thinkpop.app`

---

## iOS Launch Readiness

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Apple Developer account | ⏳ Pending | developer.apple.com — $99/yr, 24–48hr approval |
| 2 | App Store Connect — create app | ⬜ Blocked | Requires Apple Dev account. Bundle ID: `com.thinkpop.thinkapp` |
| 3 | App Store Connect — subscription products | ⬜ Blocked | Monthly `thinkpop_premium_monthly` $3.99 · Annual `thinkpop_premium_annual` $24.99 · 7-day trial on both |
| 4 | App Store Connect — tax & banking | ⬜ Blocked | Required before any paid app goes live |
| 5 | RevenueCat — iOS app created | ✅ Done | App added to RC dashboard |
| 6 | RevenueCat — entitlement | ✅ Done | `ThinkPop Unlimited` entitlement created |
| 7 | RevenueCat — offerings | ✅ Done | `default` offering with Monthly + Yearly packages configured |
| 8 | RevenueCat — iOS products attached | ✅ Done | Monthly + Annual iOS products linked to entitlement and packages |
| 9 | Wire RevenueCat SDK in `app/paywall.tsx` | ✅ Done | Real RC purchase + restore flow in place. iOS key `appl_AgVACahWeoGFdeGJBqcHqHqxyCQ` confirmed in `_layout.tsx` |
| 10 | App icon 1024×1024 PNG (no alpha) | ⬜ Todo | Apple rejects transparent icons |
| 11 | iOS screenshots | ✅ Done | 6.7" (iPhone 15 Pro Max) + 6.5" (iPhone 11 Pro Max) taken |
| 12 | Store listing copy | ✅ Done | Finalised in `store-listing.md` — category: Games (Brain/Puzzle), keywords, description, free trial copy |
| 13 | Privacy Policy + T&C + Support URLs | ✅ Done | All 3 URLs live and in `settings.tsx` + `store-listing.md` |
| 14 | EAS project init | ✅ Done | Project ID `1c166a86-761b-4071-90d2-e4e35a7cc4d2`, owner `fareedfc` |
| 15 | iOS production build | ⬜ Blocked | `eas build --platform ios --profile production` — requires Apple Dev account |
| 16 | Upload to App Store Connect | ⬜ Blocked | `eas submit --platform ios` — requires build + ASC app created |
| 17 | Age rating questionnaire | ⬜ Todo | In App Store Connect — expect 4+ rating |
| 18 | TestFlight internal test | ⬜ Todo | `eas build --profile preview --platform ios` — test all flows on real device |
| 19 | Sandbox purchase test | ⬜ Todo | Test subscription flow end-to-end before submitting |
| 20 | Submit for review | ⬜ Blocked | Apple review: 1–3 days. Requires all above done |

---

## Android Launch Readiness

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Google Play Developer account | ✅ Done | Account active |
| 2 | Google Payments merchant account | ✅ Done | Bank details added |
| 3 | Create app in Play Console | ✅ Done | Package: `com.thinkpop.app` |
| 4 | Android config in `app.json` | ✅ Done | Package name, adaptive icon, intent filters, edgeToEdge |
| 5 | Adaptive icon asset | ✅ Done | 1024×1024 PNG with alpha at `assets/adaptive-icon.png` |
| 6 | Status bar config | ✅ Done | `<StatusBar style="dark" translucent={false} />` in `_layout.tsx` |
| 7 | EAS project init | ✅ Done | Shared with iOS — same project ID |
| 8 | RevenueCat — Android app created | ✅ Done | App added to RC dashboard |
| 9 | RevenueCat — service account | ✅ Done | Google Cloud service account created, JSON uploaded. Subscriptions API warning — clears within 36hrs |
| 10 | RevenueCat — entitlement | ✅ Done | Reusing `ThinkPop Unlimited` entitlement (shared with iOS) |
| 11 | RevenueCat — offerings | ✅ Done | Reusing `default` offering (shared with iOS) |
| 12 | Android production build | ✅ Done | `eas build --platform android --profile production` — AAB produced |
| 13 | Upload AAB to Play Console internal testing | ✅ Done | AAB uploaded, internal testing track live |
| 14 | Create subscription products in Play Console | ✅ Done | `thinkpop_unlimited_monthly` $3.99/mo + `thinkpop_unlimited_annual` $24.99/yr · 7-day free trial on both |
| 15 | Attach Android products to RC entitlement | ✅ Done | Both products attached to ThinkPop Unlimited entitlement + default offering |
| 16 | Wire RevenueCat SDK in `app/paywall.tsx` | ✅ Done | Real RC purchase + restore flow in place. Android key `goog_cFhSuvMVroPfGsGWVGDYevhwEJR` confirmed in `_layout.tsx` |
| 17 | Feature graphic | ✅ Done | 1024×500px banner created and saved to UI assets/ |
| 18 | Android screenshots | ✅ Done | Uploaded to Play Store listing |
| 19 | Store listing copy | ✅ Done | App name, short + full description, icon, feature graphic, screenshots all uploaded to Play Console |
| 20 | Content rating questionnaire (IARC) | ✅ Done | ESRB: Everyone · PEGI: 3+ · USK: 0 · IARC: 3+ |
| 21 | Data safety form | ✅ Done | Email, name, app interactions, crash logs declared. All 8 policy declarations completed |
| 22 | Full play-through on Android device | ⬜ Todo | Focus on status bar, back button, shadows, keyboard |
| 23 | Sandbox purchase test | ⬜ Todo | Google Play sandbox — test subscription flow end-to-end |
| 24 | Closed testing — 12 testers for 14 days | ⏳ In progress | Need 12 testers to opt in via link. 14-day clock starts on opt-in. Target: production eligible ~Apr 29 |
| 25 | Submit for review | ⬜ Blocked | Requires closed test (#24). Google review: 1–7 days |

---

## Immediate Next Steps

**Android:**
- Get 12 friends to click the closed testing opt-in link (just click "Become a tester" — no download needed)
- 14-day clock starts on opt-in → production eligible ~Apr 29
- Full play-through + sandbox purchase test on Android device
- Submit for review once closed test criteria met

**iOS (blocked on Apple Dev account):**
- Apply for Apple Developer account if not done
- Once approved: create app in ASC → subscription products (`thinkpop_unlimited_monthly` + `thinkpop_unlimited_annual`) → tax & banking → production build → submit
