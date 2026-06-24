---
title: * Incoming media messages webhooks (image messages, video messages, etc
date: 2025-10-15
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: New Feature
sv2_modules: [Webhooks]
summary_short: * Incoming media messages webhooks (image messages, video messages, etc.) now include the incoming media asset’s media URL, which is assigne
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

* Incoming media messages webhooks (image messages, video messages, etc.) now include the incoming media asset’s media URL, which is assigned to the url property. * You can now designate an audio message as a voice message. Delivered voice messages appear in the WhatsApp client with a play icon, waveform graphic, profile image, and a microphone icon. If the recipient has enabled voice message tran

## Why it Matters for SV2

Monitor Webhooks integration for any behavioural impact.

## Suggested QA Action

Informational — no immediate action required. Monitor in future test runs.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: October 16, 2025
- **Tags**: Cloud API, Business Management API

---
*Backfilled from snapshot on 2026-06-24.*
