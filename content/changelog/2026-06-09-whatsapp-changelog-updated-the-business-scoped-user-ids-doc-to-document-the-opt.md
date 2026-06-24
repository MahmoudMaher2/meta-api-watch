---
title: Updated the Business-scoped user IDs doc to document the optional `transfer_action` reques
date: 2026-06-09
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Bug Fix/Clarification
sv2_modules: [WhatsApp Templates]
summary_short: Updated the Business-scoped user IDs doc to document the optional transfer_action request parameter (none, force_transfer) on the set-userna
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

Updated the Business-scoped user IDs doc to document the optional transfer_action request parameter (none, force_transfer) on the set-username endpoint, used to transfer a username from another business phone number within the same business portfolio to this phone number, along with the new 147005 “Username transfer required” error code returned when a transfer is required but transfer_action was 

## Why it Matters for SV2

Monitor WhatsApp Templates integration for any behavioural impact.

## Suggested QA Action

Informational — no immediate action required. Monitor in future test runs.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: June 10, 2026
- **Tags**: Cloud API

---
*Backfilled from snapshot on 2026-06-24.*
