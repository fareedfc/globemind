# ThinkPop — Launch Plan

Pricing finalised: **$3.99/mo · $24.99/yr** · 7-day free trial on both  
Bundle IDs: iOS `com.thinkpop.thinkapp` · Android `com.thinkpop.app`

---

## iOS Launch Readiness

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Apple Developer account | ✅ Done | Approved |
| 2 | App Store Connect — create app | ⬜ Todo | Bundle ID: `com.thinkpop.thinkapp`, SKU: `thinkpop` |
| 3 | App Store Connect — subscription products | ⬜ Todo | Create subscription group `ThinkPop Unlimited` → Monthly `thinkpop_premium_monthly` $3.99 · Annual `thinkpop_premium_annual` $24.99 · 7-day trial on both → attach to RC entitlement |
| 4 | App Store Connect — tax & banking | ⬜ Todo | Required before any paid app goes live |
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
| 15 | iOS production build | ⬜ Todo | `eas build --platform ios --profile production` |
| 16 | Upload to App Store Connect | ⬜ Blocked | `eas submit --platform ios` — requires build + ASC app created |
| 17 | Age rating questionnaire | ⬜ Todo | In App Store Connect — expect 4+ rating |
| 18 | TestFlight internal test | ✅ Done | Preview build on iPhone via ad-hoc distribution. Device registered, credentials configured |
| 19 | Sandbox purchase test | ⬜ Todo | Test subscription flow end-to-end before submitting — blocked on ASC products |
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

## Beta Bug Fixes Shipped (Apr 16–17)

- ✅ Guest progress preserved on signup — local state pushed to Supabase instead of being overwritten
- ✅ Fresh installs now start at level 1 (was hardcoded to level 4 with 3 fake completions)
- ✅ Lives gate enforced — 0 lives → redirects to paywall instead of allowing play
- ✅ "Sign In" hidden on landing page for already logged-in users
- ✅ "Premium" renamed to "Unlimited" across all UI (settings, paywall, journey pill)
- ✅ Unlimited badge shown next to name in settings for paid users
- ✅ Paywall plan order fixed — monthly left, annual (SAVE 48%) right
- ✅ Out-of-lives paywall redesigned — timer, OR divider, "Never wait again" callout
- ✅ Duplicate email on signup now detected via `identities[]` check — shows "already exists, try logging in" error instead of "check your inbox"
- ✅ Signup with existing email auto-switches to login tab with email pre-filled
- ✅ "Forgot password?" highlights in gold when login error is shown
- ✅ Reset password + confirm signup emails redesigned to match ThinkPop brand (dark bg, gold CTA, game chips)

## Immediate Next Steps

**Android:**
- Run `eas update --branch preview --message "Beta fixes Apr 16"` to push all JS fixes to testers
- Full play-through + sandbox purchase test on Android device
- Closed testing ends ~Apr 29 → submit for review

**iOS (Apple Dev account approved):**
- Create app in App Store Connect (Bundle ID: `com.thinkpop.thinkapp`, SKU: `thinkpop`)
- Create subscription products in ASC → attach to RC entitlement
- Complete tax & banking in ASC
- Run production build → submit for review

---

## Observability & Growth (Post-Beta)

### B. Observability — Error & Auth Monitoring

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Fix email deliverability via Resend SMTP | ✅ Done | Resend account created, `thinkpop.app` domain verified. SMTP wired into Supabase: host `smtp.resend.com`, port 465, sender `noreply@thinkpop.app` |
| 2 | Sentry crash monitoring | ⬜ Todo | `@sentry/react-native` — captures crashes, errors, breadcrumbs. Free tier: 5k errors/mo. Gives full stack trace + device info when users report issues |
| 3 | Supabase Auth logs | ✅ Available | Supabase Dashboard → Logs → Auth — shows every signup/login attempt with status. Use this to debug individual user auth issues today |

### C. KPI Dashboard — Growth Metrics

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | PostHog analytics | ⬜ Todo | Open source, React Native SDK, free up to 1M events/mo. Tracks MAU/DAU, conversion funnel (signup → first game → premium), retention curves, feature usage |
| 2 | Basic KPIs to instrument | ⬜ Todo | Key events: `app_open`, `signup_completed`, `level_completed`, `paywall_shown`, `purchase_completed`. These 5 events give MAU, conversion %, and funnel |
| 3 | Supabase queries for quick KPIs | ✅ Available | Query `profiles` table for total users + signups by week. Query `level_completions` for engagement. No setup needed — data already there |

**Priority order:** Resend (fixes live user issue) → Sentry (catch crashes proactively) → PostHog (growth KPIs once user base grows)
