---
title: * On September 8th, 2025, we’re launching a new “MM Lite ToS signed” webhook, which will b
date: 2025-09-02
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Deprecation
sv2_modules: [WhatsApp Templates, Broadcasts, Channel Integration/OAuth, Webhooks]
summary_short: * On September 8th, 2025, we’re launching a new “MM Lite ToS signed” webhook, which will be sent whenever a business signs the MM Lite ToS v
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

* On September 8th, 2025, we’re launching a new “MM Lite ToS signed” webhook, which will be sent whenever a business signs the MM Lite ToS via any method (e.g. Embedded Signup, or in WhatsApp Manager). The webhook will have a more descriptive name than the existing AD_ACCOUNT_LINKED webhook. The older webhook will be deprecated by Jan 1, 2026. * Conversion metrics will now also be available in Wha

## Why it Matters for SV2

Check whether SEEN V2 relies on the deprecated feature. Plan migration before end-of-life.

## Suggested QA Action

Audit usage of deprecated API/feature in SEEN V2 codebase.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: September 3, 2025
- **Tags**: MM Lite API

---
*Backfilled from snapshot on 2026-06-24.*
