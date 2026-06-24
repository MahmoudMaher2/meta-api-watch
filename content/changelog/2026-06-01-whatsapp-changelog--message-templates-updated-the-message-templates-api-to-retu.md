---
title: , *Message Templates*  Updated the Message Templates API to return detailed response objec
date: 2026-06-01
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: New Feature
sv2_modules: [WhatsApp Templates]
summary_short: , *Message Templates*  Updated the Message Templates API to return detailed response objects when archiving or unarchiving templates, instea
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

, *Message Templates*  Updated the Message Templates API to return detailed response objects when archiving or unarchiving templates, instead of {"success": true}. Archiving now returns archived_templates (successfully archived IDs) and failed_templates (per-template error messages). Unarchiving returns unarchived_templates and failed_templates in the same format. This enables callers to handle pa

## Why it Matters for SV2

Monitor WhatsApp Templates integration for any behavioural impact.

## Suggested QA Action

Informational — no immediate action required. Monitor in future test runs.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: June 2, 2026
- **Tags**: Cloud API

---
*Backfilled from snapshot on 2026-06-24.*
