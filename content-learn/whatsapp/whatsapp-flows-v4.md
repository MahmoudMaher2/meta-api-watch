---
slug: whatsapp-flows-v4
title: WhatsApp Flows v4 — Interactive Forms
platform: WhatsApp
category: Core API
priority: high
new: true
new_since: 2026-06-24
changelog_article: 2026-06-24
source_url: https://developers.facebook.com/docs/whatsapp/flows
last_verified: 2026-06-24
---

# WhatsApp Flows v4 — Interactive Forms

WhatsApp Flows v4 introduces native interactive forms inside WhatsApp conversations, letting businesses collect structured data without redirecting users to external links.

## Overview

Flows v4 enables businesses to build multi-screen form experiences that run natively inside WhatsApp. Users answer questions, select options, and submit data — all without leaving the chat. For SEEN V2, this is directly relevant to lead capture, onboarding, and survey workflows in the Broadcasts module.

## How It Works

- Business sends a Flow message via the Messages API
- WhatsApp renders the interactive screens on the user's device
- User submits the form — a webhook payload arrives with the collected data
- SEEN V2 maps the payload to a contact record or conversation

## Parameters & Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `flow_id` | string | Yes | Unique ID of the published Flow |
| `flow_action` | enum | Yes | `navigate` or `data_exchange` |
| `flow_action_payload` | object | No | Data passed to the flow on open |
| `flow_token` | string | No | Unique token per conversation for tracking |

## Validation Rules

| Rule | ❌ Gets REJECTED | ✅ Gets ACCEPTED |
|------|-----------------|-----------------|
| Flow status | Sending a `DRAFT` flow | Only `PUBLISHED` flows can be sent |
| flow_action value | `"open"`, `"start"` (invalid) | `"navigate"` or `"data_exchange"` |
| flow_token length | More than 64 characters | 64 chars or fewer, alphanumeric |

## Live Preview — What It Looks Like

<!-- preview:accepted -->
### ✅ Correct Usage

```json
POST /v19.0/{PHONE_NUMBER_ID}/messages

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "{{CUSTOMER_PHONE}}",
  "type": "interactive",
  "interactive": {
    "type": "flow",
    "header": { "type": "text", "text": "Complete your profile" },
    "body": { "text": "Please fill in your details below." },
    "footer": { "text": "Takes less than 2 minutes" },
    "action": {
      "name": "flow",
      "parameters": {
        "flow_message_version": "3",
        "flow_token": "AQAAAAACS5FpgQ_cAAAAAD0QI3s",
        "flow_id": "991881656454398",
        "flow_cta": "Open Form",
        "flow_action": "navigate",
        "flow_action_payload": {
          "screen": "WELCOME",
          "data": { "name": "Sarah" }
        }
      }
    }
  }
}
```

**Why it works:** Flow is `PUBLISHED`, `flow_action` is `navigate`, token is valid length, all required fields present.

<!-- preview:rejected -->
### ❌ Common Mistake

```json
{
  "action": {
    "name": "flow",
    "parameters": {
      "flow_id": "991881656454398",
      "flow_action": "open",
      "flow_token": "this-token-is-way-too-long-and-exceeds-the-maximum-allowed-64-character-limit-xyz"
    }
  }
}
```

**Error:** `Error 100: Invalid parameter` — `flow_action` must be `navigate` or `data_exchange`, and `flow_token` exceeds 64 characters.

## Comparison: Before vs After This Feature

| Aspect | Before This Feature | After This Feature |
|--------|--------------------|--------------------|
| Data collection | Redirect to external web form | Native in-chat form |
| Drop-off rate | High (leaves WhatsApp) | Low (stays in chat) |
| Webhook payload | Text message only | Structured JSON with all form fields |

## Code Example — Full Working Request

```json
POST /v19.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {ACCESS_TOKEN}

{
  "messaging_product": "whatsapp",
  "to": "{{CUSTOMER_PHONE}}",
  "type": "interactive",
  "interactive": {
    "type": "flow",
    "body": { "text": "Hi {{1}}, complete your onboarding in 60 seconds!" },
    "action": {
      "name": "flow",
      "parameters": {
        "flow_message_version": "3",
        "flow_id": "{{YOUR_FLOW_ID}}",
        "flow_token": "{{UNIQUE_SESSION_TOKEN}}",
        "flow_cta": "Start Onboarding",
        "flow_action": "navigate"
      }
    }
  }
}
```

## SEEN V2 — Impact & Notes

| Module | Impact |
|--------|--------|
| Broadcasts | Can send Flow messages as part of campaigns — use for lead forms |
| Webhooks | New `flow_completion` webhook event delivers submitted form data |
| Channel Integration/OAuth | Flow ID must be associated with the connected WABA |

> **📋 Linked Changelog Article:** This feature was detected on 2026-06-24.
> See: [Changelog entry for 2026-06-24](https://developers.facebook.com/docs/whatsapp/flows)

## QA Checklist

- [ ] Verify Flow is in `PUBLISHED` state before sending
- [ ] Test the ✅ accepted example — confirm interactive message renders in WhatsApp
- [ ] Test the ❌ rejected example — confirm error 100 for invalid `flow_action`
- [ ] Verify webhook receives structured payload on flow completion
- [ ] Test with `flow_token` exactly 64 chars — confirm it works
