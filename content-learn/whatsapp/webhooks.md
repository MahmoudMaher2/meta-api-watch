---
title: WhatsApp Webhooks
slug: whatsapp-webhooks
platform: WhatsApp
category: Webhooks
priority: high
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks
last_verified: 2026-06-24
---

# WhatsApp Webhooks

Webhooks are HTTP callbacks that Meta sends to your server when events occur — a message is received, a template status changes, a user's phone number changes, etc. You must verify your endpoint and handle each event type correctly.

## Setup Requirements

| Requirement | Value |
|------------|-------|
| Callback URL | HTTPS only (no HTTP) |
| Verification token | Any static string you define |
| Response time | Must respond `200 OK` within **5 seconds** |
| Signature header | `X-Hub-Signature-256` — HMAC-SHA256 of payload |
| Retry policy | Meta retries failed deliveries for up to **30 days** |

---

## Verification Flow (One-Time Setup)

When you save the webhook URL in your App Dashboard, Meta sends a `GET` request:

```http
GET https://your-server.com/webhook
  ?hub.mode=subscribe
  &hub.verify_token=YOUR_TOKEN
  &hub.challenge=CHALLENGE_STRING
```

### ✅ Correct Response

```http
HTTP 200
Body: CHALLENGE_STRING
```

### ❌ Wrong Responses

| Response | Result |
|---------|--------|
| Return anything other than the challenge | Verification fails |
| Return `200` with wrong body | Verification fails |
| Return `4xx` or `5xx` | Verification fails |
| Take more than 5 seconds | Timeout — verification fails |

---

## Signature Verification

Every webhook POST includes the header `X-Hub-Signature-256`. You **must** validate it to confirm the payload is from Meta:

```javascript
// ✅ Correct signature validation
const crypto = require('crypto');

function verifySignature(payload, signature, appSecret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(payload)   // raw Buffer — NOT parsed JSON
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

> **⚠️ Warning:** Use the raw request body for HMAC calculation — NOT `JSON.stringify(req.body)`. Body parsers may reformat the JSON.

---

## Webhook Fields — Subscription

Subscribe to fields in your App Dashboard or via API:

```json
POST /v21.0/{phone-number-id}/subscribed_apps
{
  "subscribed_fields": [
    "messages",
    "message_template_status_update",
    "phone_number_name_update",
    "account_update"
  ]
}
```

---

## Webhook Event Types

### `messages` — Inbound Messages

Fires when a user sends your business a message.

**Payload structure:**

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WABA_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15550123456",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "contacts": [{ "profile": { "name": "Alice" }, "wa_id": "15551234567" }],
        "messages": [{
          "from": "15551234567",
          "id": "wamid.xxx",
          "timestamp": "1700000000",
          "type": "text",
          "text": { "body": "Hello!" }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

### Message Types in Webhook

| Type | Description | Key fields |
|------|-------------|-----------|
| `text` | Plain text message | `text.body` |
| `image` | Image (JPEG/PNG) | `image.id`, `image.mime_type`, `image.url` |
| `video` | Video (MP4) | `video.id`, `video.url` |
| `audio` | Audio/voice message | `audio.id`, `audio.voice` (bool) |
| `document` | File attachment | `document.id`, `document.filename` |
| `sticker` | WhatsApp sticker | `sticker.id`, `sticker.animated` |
| `location` | GPS coordinates | `location.latitude`, `location.longitude` |
| `contacts` | vCard contact | `contacts[].name`, `contacts[].phones` |
| `button` | Quick reply tapped | `button.text`, `button.payload` |
| `interactive` | List/button reply | `interactive.type`, `interactive.list_reply` |
| `reaction` | Emoji reaction | `reaction.message_id`, `reaction.emoji` |
| `order` | Product order | `order.catalog_id`, `order.product_items` |
| `referral` | Click-to-WhatsApp ad | `referral.source_type`, `referral.source_id` |
| `unsupported` | Unsupported type | `errors[].code` |
| `system` | System event (number change) | `system.type`, `system.identity` |

---

### `statuses` — Message Status Updates

Fires when a message you sent changes status.

```json
{
  "statuses": [{
    "id": "wamid.xxx",
    "status": "delivered",
    "timestamp": "1700000001",
    "recipient_id": "15551234567",
    "conversation": {
      "id": "CONV_ID",
      "origin": { "type": "utility" }
    },
    "pricing": {
      "billable": true,
      "pricing_model": "CBP",
      "category": "utility"
    }
  }]
}
```

### Status Flow

```
sent → delivered → read
           ↓
         failed (if undeliverable)
```

| Status | Meaning |
|--------|---------|
| `sent` | Message sent from Meta servers |
| `delivered` | Received on user's device |
| `read` | User opened the message |
| `failed` | Delivery failed — check `errors[]` |
| `deleted` | User deleted the message |
| `played` | Voice message was played |

---

### `message_template_status_update`

Fires when a template's review status changes.

```json
{
  "value": {
    "event": "APPROVED",
    "message_template_id": 123456,
    "message_template_name": "hello_world",
    "message_template_language": "en_US",
    "reason": null
  }
}
```

| Event | Meaning |
|-------|---------|
| `APPROVED` | Template is ready to use |
| `REJECTED` | Template failed Meta's review — `reason` field explains why |
| `FLAGGED` | Quality concerns — may be paused soon |
| `PAUSED` | Template paused due to low quality |
| `DISABLED` | Template permanently disabled |
| `REINSTATED` | Template re-approved after appeal |

---

### `account_update`

Fires when WABA-level changes occur.

```json
{
  "value": {
    "phone_number": "15550000000",
    "event": "ACCOUNT_UPDATE",
    "banner_type": "BUSINESS_INITIATED_DISABLED"
  }
}
```

| Event | Meaning |
|-------|---------|
| `PHONE_NUMBER_NAME_UPDATE` | Display name approved/rejected |
| `PHONE_NUMBER_QUALITY_UPDATE` | Quality score change |
| `PHONE_NUMBER_BANNED` | Number banned |
| `ACCOUNT_VIOLATION` | Policy violation flagged |
| `PARTNER_REMOVED` | Business disconnected from BSP |

---

## Validation Rules

| Rule | ❌ Rejected | ✅ Accepted |
|------|------------|------------|
| **Response time** | > 5 seconds | < 5 seconds |
| **Response code** | `4xx`, `5xx`, or timeout | `200` |
| **Signature check** | Wrong or missing | Valid `X-Hub-Signature-256` |
| **Callback URL** | `http://` | `https://` |
| **Deduplication** | Processing same `id` twice (causes bugs) | Check `message.id` before processing |
| **Ordering** | Assuming messages arrive in order | Messages can arrive out of order |

---

## Error Codes in Status Webhooks

| Code | Error | Fix |
|------|-------|-----|
| `131026` | Message undeliverable | User may be offline or number invalid |
| `131047` | Re-engagement message | Cannot message user — no open window |
| `131048` | Spam rate limit | Too many messages to this user |
| `131051` | Unsupported message type | Don't send this type to this user |
| `131052` | Media download error | Media expired or inaccessible |
| `131053` | Media upload error | Problem with uploaded media |
| `130429` | Rate limit exceeded | Throttle your sending rate |
| `131000` | Generic send error | Check payload |

---

## SEEN V2 Notes

| Feature | Notes |
|---------|-------|
| Inbound messages | Route to the right SEEN V2 conversation thread |
| Status updates | `delivered` / `read` → update message state in UI |
| Template status | `APPROVED` → unlock template for use in Broadcasts |
| Deduplication | Store processed `wamid` to avoid double-processing |
| Signature | Must verify in production — never skip in a real app |\n\n
<!-- panel:comparison -->
**Messages Webhook vs Statuses Webhook**
- **Messages Event:** Triggered when a user sends an incoming message (text, image, button click) to your business.
- **Statuses Event:** Triggered when the delivery status of your OUTGOING message changes (sent, delivered, read).
<!-- endpanel -->
\n
<!-- panel:quiz -->
How do you verify the authenticity of a webhook request from Meta?
- [ ] Check the IP address of the request.
- [x] Validate the X-Hub-Signature-256 header using your App Secret.
- [ ] Send a GET request to Meta API to confirm.
- [ ] Check for a "verified: true" boolean in the JSON payload.
<!-- endpanel -->
\n