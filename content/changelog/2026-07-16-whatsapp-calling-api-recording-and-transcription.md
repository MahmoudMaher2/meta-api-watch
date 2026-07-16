---
title: "WhatsApp Calling API: Call Recording & Call Transcription added"
date: 2026-07-16
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: New Feature
sv2_modules: [Broadcasts, Webhooks]
tags: [whatsapp, calling-api, call-recording, call-transcription, new-feature]
summary_short: "Meta added Call Recording and Call Transcription guides to the WhatsApp Business Calling API. Both work on business-initiated and user-initiated calls. Consent announcements are mandatory."
learn_topic: whatsapp-calling-recording-transcription
badge: NEW
audit_corrections: none
---

## Summary

On **June 30, 2026**, Meta added official guides and support for **Call Recording** and **Call Transcription** to the **WhatsApp Business Calling API**. This expansion follows the calling API's initial release earlier in June.

---

## What Changed

- **Call Recording:** Guides are now available for recording voice calling API sessions. This works for both business-initiated and user-initiated calls.
- **Call Transcription:** Guides are available for programmatically converting the call recording audio into text transcripts.
- **Consent Rule:** Meta mandates that before starting recording or transcription, businesses must play a customer announcement notifying them that the call is being recorded and/or transcribed.

---

## Why it Matters for SV2

- If SV2 plans to implement calling features via the WhatsApp Calling API, the backend can now support call archiving and AI-based transcription for support agent reviews.
- Compliance team must ensure the audio announcement is played first to comply with Meta's policy and protect the WABA from suspension.

## Suggested QA Action

1. **Review Learn Hub**: Check out the [WhatsApp Cloud API Calling: Call Recording & Call Transcription](../../../content-learn/whatsapp/whatsapp-calling-recording-transcription.md) topic for implementation details.
2. **Compliance Test**: If calling is active, verify that a customer announcement plays successfully before any recording or transcription hook is triggered.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: June 30, 2026
- **Audit verified**: ✅ Confirmed live on developers.facebook.com
- **Learn Hub topic**: [whatsapp-calling-recording-transcription](../../../content-learn/whatsapp/whatsapp-calling-recording-transcription.md)
