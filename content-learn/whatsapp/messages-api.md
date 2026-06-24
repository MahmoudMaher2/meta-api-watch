---
title: Messages API (Send Messages)
slug: whatsapp-messages-api
platform: WhatsApp
category: Core API
priority: high
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/overview
last_verified: 2026-06-24
---

# Messages API (Send Messages)

The Messages API is how your business sends messages to users — text, media, templates, interactive messages, and more.

## Endpoint

```http
POST /v21.0/{phone-number-id}/messages
```

---

## Base Parameters (All Requests)

| Field | Type | Required | Valid Values |
|-------|------|----------|-------------|
| `messaging_product` | string | ✅ | `"whatsapp"` |
| `recipient_type` | string | ❌ | `"individual"` (default) or `"group"` |
| `to` | string | ✅ | Phone number with country code (no `+`) or group ID |
| `type` | string | ✅ | `text`, `image`, `video`, `audio`, `document`, `sticker`, `location`, `contacts`, `interactive`, `template`, `reaction` |
| `context` | object | ❌ | `{ "message_id": "wamid.xxx" }` — quotes/replies |
| `biz_opaque_callback_data` | string | ❌ | Max 512 chars — returned in status webhook |

---

## Message Types — Parameters & Validation

### TEXT

```json
{
  "messaging_product": "whatsapp",
  "to": "15551234567",
  "type": "text",
  "text": {
    "body": "Hello, how can I help you?",
    "preview_url": false
  }
}
```

| Field | Limit | Notes |
|-------|-------|-------|
| `text.body` | Max **4096** chars | Supports *italics*, **bold**, ~~strikethrough~~, `monospace` |
| `text.preview_url` | boolean | `true` = show link preview |

### Validation Rules for TEXT

| Rule | ❌ Rejected | ✅ Accepted |
|------|------------|------------|
| Body length | > 4096 chars | ≤ 4096 chars |
| Sending to non-customer | Business-initiated without open window and no template | Send template instead |
| HTML tags | `<b>text</b>` | `*text*` (WhatsApp markdown) |

---

### IMAGE / VIDEO / AUDIO / DOCUMENT

Media can be sent by `id` (uploaded to Meta) or `link` (direct URL):

```json
// ✅ By URL
{
  "type": "image",
  "image": {
    "link": "https://example.com/image.jpg",
    "caption": "This is a caption"
  }
}

// ✅ By ID (pre-uploaded)
{
  "type": "image",
  "image": {
    "id": "MEDIA_ID",
    "caption": "Caption here"
  }
}
```

### Media Limits

| Type | Max Size | Accepted Formats |
|------|---------|-----------------|
| Image | **5 MB** | JPEG, PNG |
| Video | **16 MB** | MP4, 3GPP |
| Audio | **16 MB** | AAC, MP4, MPEG, AMR, OGG |
| Document | **100 MB** | PDF, Word, Excel, PowerPoint, text |
| Sticker | **500 KB** | WebP (static), WebP animated |

### Media Validation Rules

| Rule | ❌ Rejected | ✅ Accepted |
|------|------------|------------|
| Image format | GIF, BMP, TIFF | JPEG, PNG |
| Video format | AVI, MOV, WMV | MP4, 3GPP |
| Media by URL | Private/auth-required URL | Publicly accessible HTTPS URL |
| Caption on audio | Adding `caption` to audio | Audio has no caption support |
| Caption on sticker | Adding `caption` to sticker | Sticker has no caption support |
| `id` and `link` together | Both fields in same object | Use one or the other |

---

### INTERACTIVE — List Messages

```json
{
  "type": "interactive",
  "interactive": {
    "type": "list",
    "header": { "type": "text", "text": "Choose an option" },
    "body": { "text": "Select from the list below:" },
    "footer": { "text": "Tap to choose" },
    "action": {
      "button": "View Options",
      "sections": [
        {
          "title": "Support",
          "rows": [
            { "id": "row_1", "title": "Billing Issue", "description": "Help with billing" },
            { "id": "row_2", "title": "Tech Support", "description": "Technical help" }
          ]
        }
      ]
    }
  }
}
```

### Interactive List Limits

| Element | Limit |
|---------|-------|
| Sections | Max **10** |
| Rows per section | Max **10** |
| Total rows | Max **10** |
| Button text | Max **20** chars |
| Section title | Max **24** chars |
| Row title | Max **24** chars |
| Row description | Max **72** chars |
| Row ID | Max **200** chars |
| Header text | Max **60** chars |
| Body text | Max **4096** chars |
| Footer text | Max **60** chars |

### INTERACTIVE — Reply Buttons

```json
{
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": { "text": "Choose an action:" },
    "action": {
      "buttons": [
        { "type": "reply", "reply": { "id": "btn_yes", "title": "Yes" } },
        { "type": "reply", "reply": { "id": "btn_no",  "title": "No" } }
      ]
    }
  }
}
```

| Element | Limit |
|---------|-------|
| Max buttons | **3** |
| Button title | Max **20** chars |
| Button ID | Max **256** chars, must be unique |

---

### TEMPLATE

```json
{
  "type": "template",
  "template": {
    "name": "order_shipped",
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "header",
        "parameters": [
          { "type": "image", "image": { "link": "https://example.com/img.jpg" } }
        ]
      },
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Sarah" },
          { "type": "text", "text": "#ORD-1234" }
        ]
      },
      {
        "type": "button",
        "sub_type": "url",
        "index": "0",
        "parameters": [
          { "type": "text", "text": "ABC123" }
        ]
      }
    ]
  }
}
```

### Template Send Validation

| Rule | ❌ Rejected | ✅ Accepted |
|------|------------|------------|
| Variable count | Wrong number of `parameters` | Exact count matching template definition |
| Language code | `"en"` for `en_US` template | `"en_US"` exactly |
| Template status | Sending `REJECTED` or `PAUSED` template | `APPROVED` templates only |
| Variable type | `text` param for image header | `image` or `video` param for media header |
| Button index | Wrong `index` for button order | `"0"` for first, `"1"` for second button |
| Empty parameter | `"text": ""` | Non-empty string |

---

### REACTION

```json
{
  "type": "reaction",
  "reaction": {
    "message_id": "wamid.xxx",
    "emoji": "❤️"
  }
}
```

| Rule | ❌ Rejected | ✅ Accepted |
|------|------------|------------|
| Emoji | Non-emoji text, multiple emojis | Single emoji character |
| Remove reaction | Omitting `emoji` | `"emoji": ""` |
| Target message | Message from another WABA | Message in same conversation |

---

### LOCATION

```json
{
  "type": "location",
  "location": {
    "latitude": 30.0444,
    "longitude": 31.2357,
    "name": "Cairo, Egypt",
    "address": "Cairo, Egypt"
  }
}
```

---

## Messaging Windows (When You Can Send)

| Window Type | Duration | What you can send |
|-------------|----------|-------------------|
| **Customer Service** | 24h from last user message | Any message type |
| **Free Entry Point** | 72h from Click-to-WhatsApp ad | Any message type (free) |
| **Outside window** | After 24h of silence | Templates only |

---

## Rate Limits

| Limit | Value |
|-------|-------|
| Messages per second (per phone number) | **80 messages/sec** |
| Template messages to same user | **Marketing templates**: per-user limit enforced by Meta |
| Phone number tier | Scales with usage: 1K → 10K → 100K → unlimited/day |

---

## Response (Success)

```json
{
  "messaging_product": "whatsapp",
  "contacts": [{ "input": "15551234567", "wa_id": "15551234567" }],
  "messages": [{ "id": "wamid.HBgNMTU1NTEyMzQ1Njc..." }]
}
```

Save the `messages[0].id` — you'll need it to correlate with status webhooks.

---

## Error Codes Reference

| Code | Error | Cause | Fix |
|------|-------|-------|-----|
| `100` | Invalid parameter | Wrong field value or format | Check payload structure |
| `131000` | Generic error | Various | Check full error message |
| `131005` | Permission denied | Token lacks permission | Grant `whatsapp_business_messaging` |
| `131008` | Required parameter missing | Missing `to`, `type`, etc. | Add missing field |
| `131009` | Parameter value not valid | Invalid phone, invalid media | Validate input |
| `131021` | Invalid recipient | Phone number not on WhatsApp | Verify number |
| `131026` | Message undeliverable | User unreachable | No action — log and move on |
| `131047` | Re-engagement required | No open window | Send template |
| `131048` | Spam rate limit | Too many messages | Back off |
| `131049` | Marketing limit | User reached limit | Respect the limit |
| `131050` | User opted out | User unsubscribed | Respect opt-out |
| `131051` | Unsupported type | Can't send this type | Use different type |
| `130429` | Rate limit hit | Sending too fast | Throttle to 80/sec |
| `132000` | Template param count wrong | Wrong number of variables | Fix parameters array |
| `132001` | Template not found/approved | Wrong name/language | Use approved template |

---

## SEEN V2 Notes

| Feature | Notes |
|---------|-------|
| Broadcasts | Use `template` type. Always pass exact parameter count. |
| Customer replies | Handle `messages` webhook, parse by `type` |
| Reply/context | Set `context.message_id` to quote user's message |
| Media messages | Store `media.id` from webhook — don't re-download from URL (expires) |
| Status tracking | Store `messages[0].id` and track statuses in webhook |\n\n
<!-- panel:comparison -->
**Text Messages vs Template Messages**
- **Text Messages (Free-form):** Can only be sent if a 24-hour customer service window is open.
- **Template Messages:** Can be sent at any time, even outside the 24-hour window, to initiate a business conversation.
<!-- endpanel -->
\n
<!-- panel:quiz -->
Which property is REQUIRED when sending a message to a user\'s phone number via the Cloud API?
- [ ] "recipient_type": "individual"
- [x] "to": "<phone_number>"
- [ ] "messaging_product": "whatsapp"
- [ ] All of the above
<!-- endpanel -->
\n