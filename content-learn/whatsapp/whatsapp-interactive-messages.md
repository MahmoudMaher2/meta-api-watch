---
slug: whatsapp-interactive-messages
title: WhatsApp Interactive Messages (Buttons & Lists)
platform: WhatsApp
category: Core API
priority: high
source_url: https://developers.facebook.com/docs/whatsapp/cloud-api/messages/interactive-messages
last_verified: 2026-06-24
---

# WhatsApp Interactive Messages

Interactive messages replace traditional text-based "Reply 1 for Yes" workflows with native UI elements. They reduce friction, eliminate typing errors, and improve conversion rates. For SEEN V2, interactive messages are core to the Flow Builder and Bot modules.

## Types of Interactive Messages

1. **Reply Buttons:** Up to 3 quick-reply buttons (e.g., "Yes", "No", "Talk to Sales").
2. **List Messages:** A menu of up to 10 rows (e.g., product categories, store locations).

## Parameters & Fields

### Reply Buttons

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Set to `"button"` |
| `body.text` | string | Yes | Main message text (max 1024 chars) |
| `action.buttons` | array | Yes | Array of up to 3 button objects |
| `button.type` | string | Yes | Must be `"reply"` |
| `button.reply.id` | string | Yes | Unique payload sent to webhook (max 256 chars) |
| `button.reply.title`| string | Yes | Button text shown to user (max 20 chars) |

### List Messages

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Set to `"list"` |
| `body.text` | string | Yes | Main message text (max 1024 chars) |
| `action.button` | string | Yes | Text on the button that opens the list (max 20 chars) |
| `action.sections` | array | Yes | Up to 10 sections max |
| `row.id` | string | Yes | Payload returned via webhook on selection |
| `row.title` | string | Yes | Row title (max 24 chars) |
| `row.description`| string | No | Subtext for the row (max 72 chars) |

## Validation Rules

| Rule | ❌ Gets REJECTED | ✅ Gets ACCEPTED |
|------|-----------------|-----------------|
| Buttons Count | 4 or more buttons | 1 to 3 buttons max |
| Button Title Length | `"Talk to a human representative now"` (34 chars) | `"Talk to Sales"` (20 chars max) |
| List Rows Count | 11 rows total across sections | 10 rows total max |
| Row Title Length | `"Schedule Appointment for Tomorrow"` (33 chars) | `"Book Tomorrow"` (24 chars max) |
| Button IDs | Duplicate IDs in the same message | Unique IDs per button/row |

## Live Preview — What It Looks Like

<!-- preview:accepted -->
### ✅ Correct Usage — Reply Buttons

```json
POST /v19.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {ACCESS_TOKEN}

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "{{CUSTOMER_PHONE}}",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "header": {
      "type": "text",
      "text": "Payment Confirmation"
    },
    "body": {
      "text": "Your order #12345 has been processed. Would you like a receipt?"
    },
    "footer": {
      "text": "SEEN V2 Bot"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "receipt_yes",
            "title": "Yes, please"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "receipt_no",
            "title": "No, thanks"
          }
        }
      ]
    }
  }
}
```

**Why it works:** Exactly 2 buttons, titles are under 20 chars, IDs are unique.

<!-- preview:rejected -->
### ❌ Common Mistake — Too Many Buttons

```json
{
  "action": {
    "buttons": [
      { "type": "reply", "reply": { "id": "1", "title": "Option 1" } },
      { "type": "reply", "reply": { "id": "2", "title": "Option 2" } },
      { "type": "reply", "reply": { "id": "3", "title": "Option 3" } },
      { "type": "reply", "reply": { "id": "4", "title": "Option 4" } }
    ]
  }
}
```

**Error:** `Error 100: Invalid parameter` — Maximum of 3 buttons allowed. For 4+ options, use a `list` message instead.

## Webhooks (Receiving the Response)

When a user clicks a button or selects a list row, Meta sends a webhook to SEEN V2.

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "1234567890",
          "type": "interactive",
          "interactive": {
            "type": "button_reply",
            "button_reply": {
              "id": "receipt_yes",
              "title": "Yes, please"
            }
          }
        }]
      }
    }]
  }]
}
```

**Important SEEN V2 implementation note:** The bot builder should match against the `interactive.button_reply.id` (not the title) for routing logic, as the ID is immutable while the title might change based on localization.

## QA Checklist

- [ ] Verify button titles do not exceed 20 characters
- [ ] Verify maximum 3 buttons per message
- [ ] Verify list rows do not exceed 10 across all sections combined
- [ ] Verify row titles do not exceed 24 characters
- [ ] Ensure `action.button` (for lists) is under 20 characters
- [ ] Map webhook `interactive.*.id` accurately to SEEN V2 Flow Builder triggers
