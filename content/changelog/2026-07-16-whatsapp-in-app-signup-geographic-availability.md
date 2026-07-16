---
title: "WhatsApp In-App Signup API: Geographic availability documented"
date: 2026-07-16
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Policy/Compliance
sv2_modules: [Channel Integration/OAuth]
tags: [whatsapp, in-app-signup, geographic-availability, policy, compliance]
summary_short: "Meta documented geographic restrictions for the In-App Signup API: it is available in all markets except EEA, UK, Brazil, Japan, South Korea, Nigeria, South Africa, and Turkey due to local regulations."
audit_corrections: none
---

## Summary

On **July 3, 2026**, Meta updated the **In-App Signup** documentation to specify the geographic availability and restrictions for the In-App Signup API.

---

## What Changed

The In-App Signup API is available globally in all markets **except** the following regions:

- **European Economic Area (EEA)**
- **United Kingdom (UK)**
- **Brazil**
- **Japan**
- **South Korea**
- **Nigeria**
- **South Africa**
- **Turkey**

These geographic exclusions are due to Meta policy and/or local compliance regulations.

---

## Why it Matters for SV2

- If SV2 plans to use or currently uses the In-App Signup API for onboarding new clients, it will fail for clients located in the restricted regions.
- Onboarding for clients in EEA, UK, Brazil, Japan, South Korea, Nigeria, South Africa, and Turkey must continue using the standard web-based **Embedded Signup** flow.

## Suggested QA Action

1. **Verify Onboarding Logic**: Ensure the system routes users in restricted countries to Embedded Signup instead of In-App Signup.
2. **Error Handling**: Verify that if an onboarding request fails from these countries, appropriate error messages are shown indicating country restrictions.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: July 3, 2026
- **Audit verified**: ✅ Confirmed live on developers.facebook.com
