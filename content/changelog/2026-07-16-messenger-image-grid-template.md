---
title: "Messenger Platform: New Image Grid template launched"
date: 2026-07-16
source_slug: messenger-changelog
source_name: Messenger Platform Changelog
source_url: https://developers.facebook.com/docs/messenger-platform/changelog/
category: New Feature
sv2_modules: [Messenger]
tags: [messenger, templates, image-grid, send-api, new-feature]
summary_short: "Meta launched the Image Grid template for Messenger Platform. Send 2 to 6 images in a single grid layout with custom web_url/postback tap actions and action buttons."
learn_topic: messenger-image-grid-template
badge: NEW
audit_corrections: none
---

## Summary

On **June 30, 2026**, Meta launched the **Image Grid template** for the Messenger Platform. This is a new structured message template type allowing businesses to present multiple images in a grid layout within a single message.

---

## What Changed

- **Layout:** Displays between **2 and 6 images** in a single grid arrangement inside a single message bubble.
- **Tap Actions:** Each individual image in the grid supports its own default action:
  - `web_url`: Opens a URL when clicked.
  - `postback`: Fires a postback event to your webhook.
- **CTA Elements:** You can append an optional title, subtitle, and up to three buttons below the grid.

---

## Why it Matters for SV2

- Agents and marketing broadcasts in SV2 can now send rich multi-image grids to customers on Messenger instead of flooding the chat with separate image messages.
- The SV2 chat renderer must be updated to support rendering the new `image_grid` template attachment type in the conversation history UI.

## Suggested QA Action

1. **Review Learn Hub**: See the [Messenger Platform: Image Grid Template](../../../content-learn/messenger/messenger-image-grid-template.md) topic for configuration examples.
2. **Send Test Grids**: Trigger the Send API with 2, 4, and 6 images. Verify that the grid displays correctly on Messenger client apps.
3. **Webhook Verification**: Test that tapping on images with `postback` actions successfully fires postbacks to the SV2 webhook handler.

## Source Details

- **Source**: [Messenger Platform Changelog](https://developers.facebook.com/docs/messenger-platform/changelog/)
- **Original date**: June 30, 2026
- **Audit verified**: ✅ Confirmed live on developers.facebook.com
- **Learn Hub topic**: [messenger-image-grid-template](../../../content-learn/messenger/messenger-image-grid-template.md)
