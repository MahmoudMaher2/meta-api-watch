---
title: , *Pricing*  Added an ISO Country Code column to the country calling codes table on the pr
date: 2026-05-26
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Pricing/Rate Limit
sv2_modules: [Billing]
summary_short: , *Pricing*  Added an ISO Country Code column to the country calling codes table on the pricing page. The new column displays ISO 3166 Alpha
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

, *Pricing*  Added an ISO Country Code column to the country calling codes table on the pricing page. The new column displays ISO 3166 Alpha-2 country codes (for example, US, GB, IN) alongside the existing country calling codes, supporting the migration to Business Scoped User ID (BSUID).

## Why it Matters for SV2

Billing module may need to reflect updated rates. Verify cost assumptions in Broadcasts for affected markets.

## Suggested QA Action

Verify rate card assumptions in Billing module test cases.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: May 27, 2026
- **Tags**: Cloud API

---
*Backfilled from snapshot on 2026-06-24.*
