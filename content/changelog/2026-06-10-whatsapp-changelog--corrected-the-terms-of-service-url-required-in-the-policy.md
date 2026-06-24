---
title: * Corrected the Terms of Service URL required in the `policy
date: 2026-06-10
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Bug Fix/Clarification
sv2_modules: [WhatsApp Templates, Channel Integration/OAuth]
summary_short: * Corrected the Terms of Service URL required in the policy.tos field when you create your first signup with the In-App Signup API. The appr
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

* Corrected the Terms of Service URL required in the policy.tos field when you create your first signup with the In-App Signup API. The approved URL is https://www.facebook.com/legal/ads-manager-marketing-messages-terms. Create requests that send a different URL fail with error code 2494177 (SIGNUP_TOS_URL_NOT_ALLOWED). * Updated the template analytics and template group analytics limitations to r

## Why it Matters for SV2

Monitor WhatsApp Templates, Channel Integration/OAuth integration for any behavioural impact.

## Suggested QA Action

Informational — no immediate action required. Monitor in future test runs.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: June 11, 2026
- **Tags**: Business Management API

---
*Backfilled from snapshot on 2026-06-24.*
