---
date: 2026-06-24
slug: whatsapp-campaigns-broadcasts
title: WhatsApp Campaigns & Broadcasts
platform: WhatsApp
category: Core API
priority: high
source_url: https://developers.facebook.com/docs/whatsapp/cloud-api/messages/message-templates
last_verified: 2026-06-24
---

# WhatsApp Campaigns & Broadcasts

In WhatsApp, you cannot send arbitrary free-form promotional text to users whenever you want. Any business-initiated conversation must begin with an approved **Message Template**. This is the foundation of Broadcasts and Campaigns in SEEN V2.

## How Broadcasts Work

To send a broadcast to 1,000 users, SEEN V2 iterates over the list and fires the `/messages` API using a pre-approved template for each user. 

1. Create a template in Meta Business Manager (or via API).
2. Wait for approval (usually seconds to minutes).
3. Execute the campaign by sending the template to the audience.

## Template Categories (Pricing Impacts)

When creating templates, they must be assigned a category. Meta prices conversations based on this category.

- **Marketing:** Promotions, offers, newsletters. (Highest cost)
- **Utility:** Transaction updates, shipping alerts, account notifications.
- **Authentication:** OTPs, verification codes. (Lowest cost)

## Parameters & Fields (Sending a Template)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Set to `"template"` |
| `template.name` | string | Yes | The exact name of the approved template |
| `template.language.code` | string | Yes | e.g., `"en_US"`, `"ar"` |
| `template.components` | array | No | Variables/media mapped to the template placeholders |

### The Components Array

If your template has variables like `{{1}}` in the body, or requires an image in the header, you must pass them in `components`.

| Component Type | Sub-type | Description |
|----------------|----------|-------------|
| `"header"` | `image`, `video`, `document`, `text` | Fills the header placeholder |
| `"body"` | `text` | Replaces `{{1}}`, `{{2}}` sequentially |
| `"button"` | `payload`, `text` | Dynamic URLs or Quick Reply payloads |

## Validation Rules

| Rule | ❌ Gets REJECTED | ✅ Gets ACCEPTED |
|------|-----------------|-----------------|
| Variable Match | Template has 2 vars, you send 1 | Send exactly the number of vars expected |
| Language Code | `"en-us"` or `"EN"` | Exact match `"en_US"` |
| Template Status | Template is `REJECTED` or `PAUSED` | Template is `APPROVED` |
| 24-Hour Rule | *Not applicable for templates* | Templates bypass the 24-hour customer service window |

## Live Preview — What It Looks Like

<!-- preview:accepted -->
### ✅ Correct Usage — Sending a Marketing Broadcast

```json
POST /v19.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {ACCESS_TOKEN}

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "{{CUSTOMER_PHONE}}",
  "type": "template",
  "template": {
    "name": "summer_sale_2026",
    "language": {
      "code": "en_US"
    },
    "components": [
      {
        "type": "header",
        "parameters": [
          {
            "type": "image",
            "image": {
              "link": "https://seen-v2.com/promo.jpg"
            }
          }
        ]
      },
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Sarah" },
          { "type": "text", "text": "50%" }
        ]
      }
    ]
  }
}
```

**Why it works:** The template `summer_sale_2026` expects an image header and two body variables (Name and Discount). The payload maps these exactly.

<!-- preview:rejected -->
### ❌ Common Mistake — Missing Component Variables

```json
{
  "type": "template",
  "template": {
    "name": "order_update",
    "language": { "code": "en" }
  }
}
```

**Error:** `Error 100: Invalid parameter` — If `order_update` was approved with body text "Your order {{1}} is arriving on {{2}}", sending it without the `components` array will fail validation instantly.

## WhatsApp Quality Limits (The Penalty Box)

When executing massive campaigns, Meta monitors user feedback. If users block or report your broadcast:
1. **Tier Drop:** Your messaging limit (e.g., 10K/day) can be instantly downgraded to 1K/day.
2. **Template Pause:** Meta will flag the specific template as `PAUSED`. Sending it will return an error until it's unpaused.
3. **Number Ban:** Continuous low quality results in complete restriction.

## SEEN V2 Implementation Notes

- **Batching:** WhatsApp API restricts concurrency. For a 100K user campaign, SEEN V2 must implement rate limiting (max 80 requests per second) to avoid HTTP 429 Too Many Requests.
- **Failures:** Not all numbers have WhatsApp. SEEN V2 must gracefully handle `Error 131026: Message undeteliverable` and mark the contact accordingly so they are skipped in future broadcasts.

## QA Checklist

- [ ] Ensure SEEN V2 maps exactly the correct number of variables per component
- [ ] Enforce language code case sensitivity (`en_US` not `en-us`)
- [ ] Implement a queue system for large broadcasts to adhere to rate limits
- [ ] Read webhook statuses (`sent`, `delivered`, `read`, `failed`) to update campaign analytics in real-time\n\n
<!-- panel:comparison -->
**Sequential Sending vs Batch Processing**
- **Sequential (Looping):** Sending one message at a time. Very slow, blocks the server thread, prone to timeouts.
- **Batch Processing (Async):** Sending requests concurrently using Queues or asynchronous workers. Maximizes throughput.
<!-- endpanel -->
\n
<!-- panel:quiz -->
To maximize throughput without getting banned, you should:
- [ ] Send 10,000 requests per second blindly.
- [x] Throttle requests to match your phone number\'s Tier limit (e.g., 80 msgs/sec for Tier 1) and respect 429 errors.
- [ ] Send messages from a consumer WhatsApp app.
- [ ] Put all phone numbers in a single JSON array and send one request.
<!-- endpanel -->
\n