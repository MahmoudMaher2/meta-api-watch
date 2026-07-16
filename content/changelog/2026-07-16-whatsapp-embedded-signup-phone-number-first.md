---
title: "WhatsApp Embedded Signup: Phone Number First Flow rolls out to default flow"
date: 2026-07-16
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: New Feature
sv2_modules: [Channel Integration/OAuth]
tags: [whatsapp, embedded-signup, phone-verification, onboarding, new-feature]
summary_short: "Meta is beginning to roll out the Phone Number First flow in the default Embedded Signup flow. Business customers verify their phone number near the start of signup, surfacing eligibility issues earlier."
audit_corrections: none
---

## Summary

On **July 15, 2026**, Meta began rolling out the **Phone Number First flow** to a subset of business customers in the default **Embedded Signup** flow. This flow has been in public preview (v2, v3, and v4) for the past month and is now transitioning to the default onboarding path.

---

## What Changed

In this variant of the Embedded Signup flow, business customers are prompted to enter and verify their phone number near the start of the signup wizard:

- **Previous default flow:** Customers select or create Meta Business Accounts and WABA assets first, then verify their phone number at the very end.
- **New Phone Number First flow:** Phone number verification happens at the beginning, before assets are created.

This surfaces phone number eligibility, compliance, and verification issues much earlier in the onboarding flow, preventing businesses from creating empty or unusable assets.

---

## Why it Matters for SV2

- For SV2's user onboarding, if customers use the default Embedded Signup flow, they will now experience this new sequence.
- This is a positive change because any verification or eligibility issues will be exposed immediately at the beginning, reducing support queries regarding "stuck" signup flows.
- No integration code changes are required as this is managed entirely by Meta's Embedded Signup JS SDK wrapper.

## Suggested QA Action

1. **Verification**: Run a test signup using the default Embedded Signup flow in sandbox to observe the new Phone Number First flow sequence.
2. **Support alignment**: Update QA documentation and support team playbooks to reflect that users will now verify their phone numbers earlier in the process.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: July 15, 2026
- **Audit verified**: ✅ Confirmed live on developers.facebook.com
