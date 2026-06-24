---
title: , *Webhooks*  The account_update webhook’s `PARTNER_REMOVED` event `disconnection_info` ob
date: 2026-04-19
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Deprecation
sv2_modules: [Channel Integration/OAuth, Webhooks]
summary_short: , *Webhooks*  The account_update webhook’s PARTNER_REMOVED event disconnection_info object now supports three additional reason values when 
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

, *Webhooks*  The account_update webhook’s PARTNER_REMOVED event disconnection_info object now supports three additional reason values when your client was using both the WhatsApp Business app and Cloud API  disconnection was due to a business downgrade or device inactivity. The object contains a reason  field (BUSINESS_DOWNGRADE, PRIMARY_INACTIVITY, or COMPANION_INACTIVITY) and an initiated_by  f

## Why it Matters for SV2

Check whether SEEN V2 relies on the deprecated feature. Plan migration before end-of-life.

## Suggested QA Action

Audit usage of deprecated API/feature in SEEN V2 codebase.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: April 20, 2026
- **Tags**: Cloud API

---
*Backfilled from snapshot on 2026-06-24.*
