---
title: "WhatsApp Cloud API Calling: Voicemail & SIP Call Webhooks"
date: "2026-06-28"
category: "whatsapp"
description: "Voicemail for WhatsApp Cloud API Calling is now GA. Configure announcement media, REJECT/TIMEOUT triggers, and receive recorded voicemails as inbound audio messages. SIP call webhooks now deliver call_created and terminate events."
tags: ["whatsapp", "calling-api", "voicemail", "sip", "webhooks", "cloud-api", "new-feature"]
badge: "NEW"
---

# WhatsApp Cloud API Calling: Voicemail & SIP Webhooks 🆕

Two major updates landed for the **WhatsApp Cloud API Calling** feature in late June 2026.

## 1. Voicemail — Generally Available (GA)

**Voicemail** for WhatsApp Cloud API Calling is now fully live for all businesses. Callers who aren't answered can leave a voice message, which your system receives as a standard **inbound audio message** through the existing `messages` webhook.

### What You Can Configure

| Option | Description |
|---|---|
| **Announcement media** | Play a custom audio message before the voicemail beep |
| **REJECT trigger** | Hang up the call instead of recording |
| **TIMEOUT trigger** | End the voicemail recording after a time limit |

### How Voicemails Arrive

<!-- preview -->
Voicemails arrive via the **existing `messages` webhook** as inbound audio messages — no new webhook subscription is needed. The payload looks like a standard audio message from the user.

<!-- preview -->
✅ No new webhook to subscribe to — but your backend must distinguish voicemail audio from regular user voice messages based on call context.

## 2. SIP Call Webhooks

For businesses with **SIP-enabled** phone numbers, webhook delivery for call lifecycle events is now available.

### Configuration

Enable webhook delivery via the `webhook_delivery` field in your SIP settings configuration.

### Events Delivered

| Event | Trigger |
|---|---|
| `call_created` | A new SIP call is initiated |
| `terminate` | The SIP call ends |

### Correlation with SIP

The `call_created` webhook includes the **WhatsApp Call ID (WACID)**, which can be correlated with the **SIP Call-ID header** for end-to-end call tracing and debugging.

<!-- panel:comparison -->
**Voicemail**
- Available to all businesses using Cloud API Calling
- No new webhook subscription needed
- Voicemails arrive as inbound audio in the `messages` webhook

**SIP Call Webhooks**
- Only for SIP-enabled phone numbers
- Must enable `webhook_delivery` in SIP settings
- Delivers `call_created` and `terminate` lifecycle events
<!-- endpanel -->

<!-- panel:quiz -->
How are voicemails delivered in the WhatsApp Cloud API?
- [ ] Via a new dedicated `voicemail` webhook field
- [x] As inbound audio messages via the existing `messages` webhook field
- [ ] Via a separate Voicemail API endpoint
- [ ] Via email notification
<!-- endpanel -->
