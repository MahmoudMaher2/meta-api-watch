---
title: Added `hsm_ids` field to DELETE WhatsApp Business Account > Message Templates endpoint
date: 2025-12-17
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: New Feature
sv2_modules: [WhatsApp Templates]
summary_short: Added hsm_ids field to DELETE WhatsApp Business Account > Message Templates endpoint. Accepts an array of up to 100 template IDs to delete i
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

Added hsm_ids field to DELETE WhatsApp Business Account > Message Templates endpoint. Accepts an array of up to 100 template IDs to delete in a single request. Cannot be combined with the name or hsm_id parameters. See Delete templates by IDs.

## Why it Matters for SV2

Monitor WhatsApp Templates integration for any behavioural impact.

## Suggested QA Action

Informational — no immediate action required. Monitor in future test runs.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: December 18, 2025
- **Tags**: Business Management API

---
*Backfilled from snapshot on 2026-06-24.*
