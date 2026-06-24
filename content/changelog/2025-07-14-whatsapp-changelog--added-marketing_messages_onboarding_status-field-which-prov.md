---
title: * Added marketing_messages_onboarding_status field which provides more granular eligibilit
date: 2025-07-14
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Deprecation
sv2_modules: [WhatsApp Templates, Broadcasts, Channel Integration/OAuth]
summary_short: * Added marketing_messages_onboarding_status field which provides more granular eligibility status data. The field will be a replacement for
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

* Added marketing_messages_onboarding_status field which provides more granular eligibility status data. The field will be a replacement for marketing_messages_api_status field which will be deprecated in version 24.0. * Fixed the marketing_messages_lite_api_status field to correct a bug which was erroneously returning ELIGIBLE when it should have returned ONBOARDED. This field will be deprecated 

## Why it Matters for SV2

Check whether SEEN V2 relies on the deprecated feature. Plan migration before end-of-life.

## Suggested QA Action

Audit usage of deprecated API/feature in SEEN V2 codebase.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: July 15, 2025
- **Tags**: MM Lite API

---
*Backfilled from snapshot on 2026-06-24.*
