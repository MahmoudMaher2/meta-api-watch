---
title: Instagram Comments Automation & Private Replies
date: 2026-06-24
category: messenger
description: Guide to Instagram Comments Automation, focusing on private replies limits, the 7-day rule, and text-only constraints.
tags: [instagram, api, limitations, comments, automation]
---

# Instagram Comments Automation & Private Replies

The Instagram Graph API allows businesses to send private messages (DMs) to users who comment on their posts. This feature is highly restricted to prevent spam and ensure a high-quality user experience.

## The 7-Day Limitation

You have a strict window to respond privately to a user's comment.

- **7-Day Rule:** A private reply can only be sent within 7 days of the exact timestamp the comment was created.
- **One Reply Per Comment:** You are only allowed to send a single private reply to each individual comment.

<!-- preview -->
✅ Valid: Sending a private DM 2 days after a user comments on your post.
❌ Invalid: Attempting to send a private DM 8 days after the user commented.

## Text-Only Rules and UI Limitations

When initiating a private reply to a comment, there are strict content constraints.

- **Text-Only First Message:** The initial private reply must be text-only. You cannot include rich media (images, videos, or templates) in this initial outreach message. The message typically includes a link back to the original post automatically.
- **Subsequent Messages:** Once the user responds to your initial text-only private reply, a standard 24-hour messaging window opens. During this window, you can send rich media and interact normally.
- **Instagram Live Exceptions:** For comments made during an Instagram Live broadcast, private replies are only permitted *during* the live session itself. Once the broadcast ends, the window closes immediately.

<!-- preview -->
✅ Valid: Sending a simple text message saying "Thanks for commenting! How can we help?" as the first reply.
❌ Invalid: Sending an image of a product discount code as the very first private reply to a comment.
