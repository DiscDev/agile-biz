# Stakeholder Project Prompt - Mobile Fitness App Example

*This is a filled example for a consumer mobile fitness tracking application*

---

## Project Information

**Project Name**: FitFlow  
**Date Prepared**: 2025-01-30  
**Prepared By**: Marcus Johnson (Founder), Elena Rodriguez (Fitness Expert), David Kim (Technical Advisor)  
**Project Type**: [X] New Project  [ ] Existing Project Enhancement

---

## 1. Project Vision* (Required)

### What are we building? (one sentence)
FitFlow is a personalized fitness app that uses phone sensors and AI to create adaptive workout plans that adjust in real-time based on user performance and fatigue levels.

### Why does this need to exist?
Generic workout apps don't adapt when users are tired, injured, or progressing faster than expected, leading to poor results and high dropout rates (87% quit within 3 months).

### What problem does it solve?
Users waste months on ineffective workouts because apps can't detect when they're overtraining, undertraining, or need program adjustments based on actual performance data.

### What's the vision 3 years from now?
FitFlow becomes the trusted AI fitness coach for 10M+ users, known for preventing injuries and delivering 3x better results than static workout programs.

---

## 2. Boundaries - What This Is NOT* (Critical - Minimum 5 items)

- This is NOT a social fitness platform (no feeds, likes, or social features)
- This will NOT include meal planning or nutrition tracking
- This is NOT for professional athletes or bodybuilders
- This will NOT require wearables or external devices (phone only)
- This is NOT a live coaching or personal trainer marketplace
- This will NOT have video workouts or exercise libraries
- This is NOT a gym finder or class booking app
- This will NOT track medical conditions or provide medical advice

---

## 3. Target Users* (Required)

### Primary User Persona
**Name/Title**: "Busy Beth" - Marketing Manager with fitness goals  
**Demographics**: 28-40 years old, urban professionals, smartphone savvy  
**Goals**: Get fit without spending hours researching workouts, see consistent progress  
**Pain Points**: No time to plan workouts, doesn't know if she's doing too much/too little, loses motivation when not seeing results  
**Day in the Life**: Opens FitFlow during lunch break, sees today's 20-minute workout already adjusted based on yesterday's performance and her reported energy level, completes workout with real-time form feedback, gets recovery recommendation

### Secondary Users
- **Fitness Returners**: Previously fit, getting back after break
- **Beginners**: Never worked out consistently before
- **Home Workout Enthusiasts**: Prefer exercising at home

### User Problems We're Solving
1. "I don't know if I'm pushing too hard or not hard enough"
2. "My workout app doesn't know I'm exhausted today"
3. "I keep getting injured following these preset programs"

---

## 4. Success Metrics* (Required)

### Launch Success Criteria
- [ ] 10,000 downloads in first 60 days
- [ ] 40% users complete first week (industry avg: 23%)
- [ ] Motion tracking accuracy >85%
- [ ] App crash rate <0.5%

### 6-Month Goals
- 100,000 active users
- $250K revenue ($8.99/month subscription)
- 65% three-month retention (industry avg: 13%)
- 4.6+ App Store rating

### Growth Metrics
- Daily active users: 60% open rate
- Workout completion: 75% start-to-finish
- Subscription conversion: 30% after free trial

### Quality Metrics
- Form detection accuracy: 85%+
- Adaptation satisfaction: 80%+ say workouts feel "just right"
- Injury reduction: 50% fewer reported vs. static programs

---

## 5. Technical Preferences

### Preferred Technology Stack
- Frontend: React Native (cross-platform)
- Backend: Node.js with GraphQL
- Database: PostgreSQL + Redis
- Hosting: AWS with CloudFront CDN

### Must-Have Integrations
- Apple HealthKit (iOS fitness data)
- Google Fit (Android fitness data)
- Stripe (subscription payments)
- Mixpanel (analytics)

### Performance Requirements
- App launch time: <2 seconds
- Motion tracking: 30 FPS minimum
- Offline mode: Full workout functionality

### Security Requirements
- Authentication: Biometric + email
- Data encryption: All health data encrypted
- Compliance: GDPR, CCPA compliant

### Scalability Needs
- Expected user growth: 10x year 1
- Data growth: 5GB per 1000 users/month
- Geographic distribution: US + EU initially

---

## 6. Business Model

### Revenue Model
- [X] Subscription (SaaS)
- [ ] One-time purchase
- [X] Freemium
- [ ] Transaction fees
- [ ] Advertising
- [ ] Other

### Pricing Strategy
- Free: 7-day trial with 3 workouts/week
- Premium: $8.99/month or $79/year
- No ads ever (ruins workout experience)
- Family plan: $14.99/month (up to 4 people)

### Cost Considerations
- Development budget: $200K
- Ongoing operational budget: $5K/month
- Time to market: MVP in 4 months

### Market Positioning
- Target market size: 67M fitness app users in US
- Our unique position: Only app that truly adapts to daily performance

---

## 7. Constraints & Risks

### Timeline Constraints
- Must launch by May 2025 (summer fitness season)
- Beta must start March 2025

### Budget Limitations
- Total budget: $200K (includes marketing)
- Must reach profitability within 12 months

### Technical Constraints
- Must work on: iPhone 11+ and equivalent Android
- Cannot use: External sensors or wearables
- Platform limitations: iOS 14+ and Android 10+

### Known Risks
1. Motion tracking accuracy varies by phone - mitigation: device-specific calibration
2. Apple/Google policy changes - mitigation: stay compliant, have web backup
3. User privacy concerns - mitigation: local processing, minimal data collection

### Compliance Requirements
- App Store/Play Store guidelines
- Health data privacy regulations
- Subscription billing regulations

---

## 8. Competition & Differentiation

### Direct Competitors
1. **Nike Training Club**
   - What they do well: Great exercise library, free
   - Where they fall short: No real adaptation, generic programs
   
2. **Freeletics**
   - What they do well: AI coaching, bodyweight focus
   - Where they fall short: Expensive, doesn't use phone sensors
   
3. **Sworkit**
   - What they do well: Customizable workouts
   - Where they fall short: No performance tracking or adaptation

### How We're Different
- Key differentiator #1: Real-time adaptation using phone sensors
- Key differentiator #2: Prevents overtraining/injury proactively
- Key differentiator #3: No equipment or wearables needed

### Market Gaps We're Filling
Current apps are either static programs or require expensive wearables. We use just your phone to deliver truly personalized, adaptive training.

### Our Competitive Advantages
- Patent-pending motion analysis algorithm
- Fitness expert co-founder (Elena - 50K Instagram followers)
- Lower price point than adaptive competitors

---

## Mobile App Specific Section

### Platform Priority
- [X] iOS first [ ] Android first [ ] Both simultaneously
- iOS represents 65% of fitness app revenue
- Android follows 2 months after iOS launch

### Offline Capabilities
- Full workout execution offline
- Sync when connected
- Download weekly programs in advance

### Device Features Needed
- [X] Camera (form checking)
- [X] Accelerometer (rep counting)
- [X] Gyroscope (movement tracking)
- [X] Haptic feedback (form cues)
- [ ] GPS
- [X] Push notifications (workout reminders)

### App Store Strategy
- Launch with 100 beta testers for reviews
- Featured workout of the week for engagement
- Seasonal campaigns (New Year, Summer)
- ASO optimization for "adaptive fitness" keywords

---

## Additional Context

### Existing Materials
- [ ] We have a PRD we can share
- [X] We have design mockups
- [ ] We have technical specifications
- [X] We have user research data
- [X] Other: Motion tracking prototype

### Team Information
- Team size: 6 people (2 developers, 1 designer, 1 fitness expert, 2 business)
- Key stakeholders: Founder (Marcus), Fitness Expert (Elena), Lead Developer (David)
- Decision maker: Marcus (CEO)

### Previous Attempts
Built a basic workout timer app in 2023 but realized the market needed intelligence, not just timers. Learned that adaptation is the key differentiator.

### Inspirations
- Strava's achievement system
- Headspace's gentle progression
- Tesla's over-the-air improvements

### Open Questions
1. Should we add Apple Watch support in v2?
2. How much historical data needed for good adaptations?
3. Gamification elements - helpful or distracting?

---

## Prompt Quality Self-Assessment

Before submitting, check:
- [X] All required sections are filled out
- [X] "What This Is NOT" has at least 5 specific items
- [X] Success metrics are measurable
- [X] User personas are detailed
- [X] Technical requirements are clear
- [X] Business model is defined

---

*This example shows how to complete the template for a consumer mobile application with clear boundaries and measurable goals.*