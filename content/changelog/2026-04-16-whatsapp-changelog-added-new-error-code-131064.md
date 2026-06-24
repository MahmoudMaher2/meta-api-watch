---
title: Added new error code 131064
date: 2026-04-16
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Bug Fix/Clarification
sv2_modules: [WhatsApp Templates]
summary_short: Added new error code 131064. The API returns this error when a WhatsApp Business account has exceeded its messaging limit due to template cl
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

Added new error code 131064. The API returns this error when a WhatsApp Business account has exceeded its messaging limit due to template classification violations. This applies to both template messages and direct send messages. The restriction is automatically lifted after the enforcement period.

## Why it Matters for SV2

Monitor WhatsApp Templates integration for any behavioural impact.

## Suggested QA Action

Informational — no immediate action required. Monitor in future test runs.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: April 17, 2026
- **Tags**: Cloud API

---
*Backfilled from snapshot on 2026-06-24.*
