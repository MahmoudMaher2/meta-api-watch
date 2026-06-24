---
title: * Messaging limits are now business portfolio-based instead of business phone number-based
date: 2025-10-07
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Pricing/Rate Limit
sv2_modules: [WhatsApp Templates, Broadcasts, Channel Integration/OAuth, Webhooks, Billing]
summary_short: * Messaging limits are now business portfolio-based instead of business phone number-based, and the initial increase via scaling path is now
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

* Messaging limits are now business portfolio-based instead of business phone number-based, and the initial increase via scaling path is now 2,000 instead of 1,000. To support this change, for version 24.0 and newer requests, a new whatsapp_business_manager_messaging_limit field has been added, which returns the owning business portfolio’s messaging limit. This field is available on the following 

## Why it Matters for SV2

Billing module may need to reflect updated rates. Verify cost assumptions in Broadcasts for affected markets.

## Suggested QA Action

Verify rate card assumptions in Billing module test cases.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: October 8, 2025
- **Tags**: Cloud API, Business Management API

---
*Backfilled from snapshot on 2026-06-24.*
