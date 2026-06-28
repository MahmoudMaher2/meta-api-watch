---
title: "WhatsApp Cloud API Calling: Voicemail Now GA & SIP Call Webhooks Support Added"
date: 2026-06-28
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: New Feature / API Update
sv2_modules: [WhatsApp, Webhooks, Cloud API]
tags: [whatsapp, calling-api, voicemail, sip, webhooks, cloud-api]
summary_short: "WhatsApp Cloud API Calling now supports Voicemail (GA) and SIP call webhooks. Businesses can configure announcement media, REJECT/TIMEOUT triggers, and receive recorded voicemails as inbound audio messages."
learn_topic: whatsapp-calling-voicemail
badge: NEW
---

## Summary

Two significant updates landed for the **WhatsApp Cloud API Calling** feature between June 25–26, 2026:

1. **Voicemail is now Generally Available (GA)** for WhatsApp Cloud API Calling.
2. **SIP call webhooks** are now supported for SIP-enabled business phone numbers.

---

## What Changed

### 1. Voicemail for WhatsApp Cloud API Calling — GA (June 25, 2026)

| Field | Detail |
|---|---|
| **Feature** | Voicemail for Cloud API Calling |
| **Status** | Generally Available (GA) |
| **Webhook field** | Existing `messages` webhook field (inbound audio messages) |
| **New capabilities** | Configure announcement media, REJECT triggers, TIMEOUT triggers |
| **Voicemail delivery** | Recorded voicemails arrive as **inbound audio messages** via the `messages` webhook |

**What you can configure:**
- **Announcement media** — play a custom message before recording
- **REJECT trigger** — hang up instead of recording
- **TIMEOUT trigger** — end recording after a time limit

### 2. SIP Call Webhooks (June 26, 2026)

| Field | Detail |
|---|---|
| **Feature** | Webhook delivery for SIP call lifecycle events |
| **Requirement** | SIP must be enabled on the business phone number |
| **New field** | `webhook_delivery` in SIP settings configuration |
| **Events delivered** | `call_created`, `terminate` |
| **Correlation** | `call_created` webhook includes **WhatsApp Call ID (WACID)** — correlatable with SIP Call-ID headers |

---

## Why it Matters for SV2

### Voicemail (GA)
- If SV2 uses the WhatsApp Calling API, voicemails will now arrive via the **existing `messages` webhook** as `audio` type messages.
- **No new webhook subscription needed** — but the backend must handle the new voicemail audio context correctly (distinguish from regular voice messages).
- The `messages` webhook handler should be reviewed to ensure voicemail audio is routed to the correct conversation thread.

### SIP Call Webhooks
- If SV2 supports SIP-enabled phone numbers, the new `webhook_delivery` configuration must be set to receive call lifecycle events.
- The `call_created` event's **WACID** can be used to correlate WhatsApp calls with SIP Call-ID headers for logging/debugging purposes.

## Suggested QA Action

1. **Voicemail**: Trigger an inbound call on a SV2-connected WhatsApp number → let it go to voicemail → verify the audio arrives in the conversation via the `messages` webhook.
2. **SIP webhooks**: If SIP is enabled, verify `call_created` and `terminate` events are received and logged after a call.
3. Check that voicemail audio is not misclassified as a regular voice message in the UI.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **June 25 entry**: Voicemail for WhatsApp Cloud API Calling — GA
- **June 26 entry**: SIP call webhooks support
- **Audit verified**: ✅ Confirmed live on developers.facebook.com/documentation/business-messaging/whatsapp/changelog

---
*Detected by Meta API Explain pipeline on 2026-06-28.*
