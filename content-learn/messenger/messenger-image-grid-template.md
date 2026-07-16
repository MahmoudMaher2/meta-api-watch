---
title: "Messenger Platform: Image Grid Template"
date: "2026-07-16"
category: "messenger"
description: "How to configure and send the new Image Grid message template on the Messenger Platform. Display 2 to 6 images with custom tap actions and buttons."
tags: ["messenger", "templates", "image-grid", "send-api", "new-feature"]
badge: "NEW"
---

# Messenger Platform: Image Grid Template 🆕

Meta launched the **Image Grid template** for the Messenger Platform on June 30, 2026. This new message template type allows businesses to send between 2 and 6 images arranged in a clean grid layout inside a single message bubble.

---

## Key Features

- **Multi-Image Presentation:** Send 2 to 6 images together in a single message.
- **Custom Tap Actions:** Each image in the grid can support its own default action:
  - `web_url`: Opens a specific URL when tapped.
  - `postback`: Sends a developer-defined postback payload to your webhook.
- **Bottom Call-to-Action:** You can specify an optional title, subtitle, and up to three buttons below the image grid.

---

## Sending an Image Grid

Use the Send Messages API with the following structure:

<!-- preview -->
```json
{
  "recipient": { "id": "<PSID>" },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "image_grid",
        "elements": [
          {
            "image_url": "https://example.com/img1.jpg",
            "default_action": {
              "type": "web_url",
              "url": "https://example.com/detail1"
            }
          },
          {
            "image_url": "https://example.com/img2.jpg",
            "default_action": {
              "type": "postback",
              "payload": "GRID_IMAGE_2_CLICKED"
            }
          }
        ],
        "title": "Stunning Grid Layout",
        "subtitle": "Discover our collection",
        "buttons": [
          {
            "type": "postback",
            "title": "View All",
            "payload": "VIEW_ALL_COLLECTION"
          }
        ]
      }
    }
  }
}
```

---

## Tap Action Behaviors

<!-- panel:comparison -->
**web_url Tap Action**
- Opens the specified URL in the in-app browser.
- Best for product detail pages or external links.

**postback Tap Action**
- Fires a postback event to your webhook.
- Best for conversational flows or triggers in your backend.
<!-- endpanel -->

---

## Quick Quiz

<!-- panel:quiz -->
What is the minimum and maximum number of images supported by the Image Grid template?
- [ ] 1 to 5 images
- [x] 2 to 6 images
- [ ] 2 to 4 images
- [ ] Unlimited images
<!-- endpanel -->
