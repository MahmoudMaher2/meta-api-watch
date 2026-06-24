---
title: Added partner-initiated WABA creation to replace the On-Behalf-Of (“OBO”) account ownershi
date: 2025-03-19
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Deprecation
sv2_modules: [WhatsApp Templates]
summary_short: Added partner-initiated WABA creation to replace the On-Behalf-Of (“OBO”) account ownership model, which is being deprecated. Starting Septe
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

Added partner-initiated WABA creation to replace the On-Behalf-Of (“OBO”) account ownership model, which is being deprecated. Starting September 30, 2025, WABAs can no longer be onboarded to the OBO model.

## Why it Matters for SV2

Check whether SEEN V2 relies on the deprecated feature. Plan migration before end-of-life.

## Suggested QA Action

Audit usage of deprecated API/feature in SEEN V2 codebase.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: March 20, 2025
- **Tags**: Cloud API

---
*Backfilled from snapshot on 2026-06-24.*
