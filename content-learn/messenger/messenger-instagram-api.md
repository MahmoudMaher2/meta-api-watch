---
slug: messenger-instagram-api
title: Messenger & Instagram Messaging API
platform: Messenger
category: Core API
priority: medium
source_url: https://developers.facebook.com/docs/messenger-platform
last_verified: 2026-06-24
---

# Messenger & Instagram Messaging API

The Messenger Platform powers both Facebook Messenger and Instagram Direct. Unlike WhatsApp, which is heavily template-driven and monetized per conversation, Messenger and Instagram rely on a **24-hour standard messaging window**.

## The 24-Hour Messaging Window

When a user sends a message to your Facebook Page or Instagram Professional Account, a 24-hour timer starts.

- **Within 24 hours:** You can send standard messages, media, and interactive elements (like generic templates) for free.
- **After 24 hours:** You can **only** send messages if they qualify for specific Message Tags (e.g., `CONFIRMED_EVENT_UPDATE`, `POST_PURCHASE_UPDATE`, `ACCOUNT_UPDATE`). Promotional messages outside the 24-hour window are strictly prohibited unless sent as Sponsored Messages (Ads).

## Shared Features (Messenger & Instagram)

| Feature | Messenger | Instagram | Description |
|---------|-----------|-----------|-------------|
| **Text & Media** | ✅ | ✅ | Standard text, images, audio, video, files. |
| **Ice Breakers** | ✅ | ✅ | Quick-tap FAQs shown when a user first opens the chat. |
| **Generic Template** | ✅ | ✅ | A horizontal scrollable carousel of cards (image, title, subtitle, buttons). |
| **Quick Replies** | ✅ | ✅ | Up to 13 buttons (Messenger) or 13 buttons (Instagram) that disappear after tapping. |

## Instagram-Specific Features

| Feature | Description | SEEN V2 Use Case |
|---------|-------------|------------------|
| **Story Mentions** | Triggers a webhook when a user @mentions the brand in their Story. | Auto-reply to mentions thanking the user and sending a discount code. |
| **Story Replies** | Triggers a webhook when a user replies to the brand's Story. | Capture leads based on specific Story content. |
| **Product Templates** | Send Instagram Shop products natively in chat. | abandoned cart recovery within the 24-hour window. |

## Parameters & Fields (Sending a Generic Template)

The Generic Template (Carousel) is the most common rich UI element across both platforms.

```json
POST /v19.0/{PAGE_ID}/messages
Authorization: Bearer {PAGE_ACCESS_TOKEN}

{
  "recipient": {
    "id": "{{PSID_OR_IGSID}}"
  },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [
          {
            "title": "Welcome to SEEN V2",
            "image_url": "https://seen-v2.com/hero.jpg",
            "subtitle": "The ultimate omnichannel platform.",
            "default_action": {
              "type": "web_url",
              "url": "https://seen-v2.com",
              "webview_height_ratio": "tall"
            },
            "buttons": [
              {
                "type": "web_url",
                "url": "https://seen-v2.com",
                "title": "View Website"
              },
              {
                "type": "postback",
                "title": "Start Chatting",
                "payload": "START_PAYLOAD"
              }
            ]
          }
        ]
      }
    }
  }
}
```

## Validation Rules

| Rule | ❌ Gets REJECTED | ✅ Gets ACCEPTED |
|------|-----------------|-----------------|
| Carousel Cards | 11+ elements | Up to 10 elements |
| Quick Replies | 14+ quick replies | Up to 13 quick replies |
| Outside 24h Window | Standard message with no tag | Message with valid `message_tag` |
| IG Story Mention | Replying 8 days later | Replying within 7 days |

## Webhooks

Messenger and Instagram webhooks share the exact same format and are delivered to the same endpoint.

**Crucial SEEN V2 Note:** Because the payloads look identical, you must check the `messaging.message.is_echo` flag to ignore messages the bot itself sent, and look for `standby` vs `messaging` events if using the Handover Protocol (passing control between Bot and Human agent).

## QA Checklist

- [ ] Ensure SEEN V2 tracks the 24-hour window timer for every active conversation per user (PSID/IGSID).
- [ ] Prevent agents or automated broadcasts from sending untagged messages after 24 hours.
- [ ] Implement support for Instagram Story Mention webhook payloads natively in the Flow Builder.\n\n
<!-- panel:comparison -->
**Messenger API vs Instagram Messaging API**
- **Messenger API:** Uses Facebook Page ID. Supports features like generic templates, receipts, and persistent menu.
- **Instagram Messaging API:** Uses IG Professional Account ID. Supports story replies, ice breakers, and product templates.
<!-- endpanel -->
\n
<!-- panel:quiz -->
Can you use the exact same payload to send an Interactive Button template on both Messenger and Instagram?
- [ ] Yes, the APIs are 100% identical.
- [x] Generally yes for basic buttons, but some advanced templates (like Receipt) are only supported on Messenger.
- [ ] No, Instagram uses XML instead of JSON.
- [ ] No, Instagram does not support buttons at all.
<!-- endpanel -->
\n