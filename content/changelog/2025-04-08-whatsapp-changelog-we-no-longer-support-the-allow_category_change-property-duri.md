---
title: We no longer support the `allow_category_change` property during template creation
date: 2025-04-08
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: New Feature
sv2_modules: [WhatsApp Templates]
summary_short: We no longer support the allow_category_change property during template creation. Previously, if set to true in a template creation request,
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

We no longer support the allow_category_change property during template creation. Previously, if set to true in a template creation request, this allowed us to update a template’s category to marketing, if we determined marketing to be its category per its content and our guidelines. This is now the default behavior.

## Why it Matters for SV2

Monitor WhatsApp Templates integration for any behavioural impact.

## Suggested QA Action

Informational — no immediate action required. Monitor in future test runs.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: April 9, 2025
- **Tags**: Template Categorization

---
*Backfilled from snapshot on 2026-06-24.*
