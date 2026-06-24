---
title: , *Webhooks*  The account_update webhook’s `PARTNER_REMOVED` event now includes a `disconn
date: 2026-04-02
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Deprecation
sv2_modules: [Channel Integration/OAuth, Webhooks]
summary_short: , *Webhooks*  The account_update webhook’s PARTNER_REMOVED event now includes a disconnection_info object when your client was using both th
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

, *Webhooks*  The account_update webhook’s PARTNER_REMOVED event now includes a disconnection_info object when your client was using both the WhatsApp Business app and Cloud API and the disconnection was due to a business downgrade or device inactivity. The object contains a reason field (BUSINESS_DOWNGRADE, PRIMARY_INACTIVITY, or COMPANION_INACTIVITY) and an initiated_by field (USER or SYSTEM). T

## Why it Matters for SV2

Check whether SEEN V2 relies on the deprecated feature. Plan migration before end-of-life.

## Suggested QA Action

Audit usage of deprecated API/feature in SEEN V2 codebase.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: April 3, 2026
- **Tags**: Cloud API

---
*Backfilled from snapshot on 2026-06-24.*
