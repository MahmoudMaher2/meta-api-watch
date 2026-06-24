---
title: "Messenger 24-Hour Policy & Message Tags"
date: "2026-06-24"
category: "messenger"
description: "Understanding the Messenger 24-hour messaging window, UI limitations, and API error validations."
tags: ["messenger", "policy", "error-codes", "message-tags"]
---

# Messenger 24-Hour Policy & Message Tags

The Messenger Platform enforces a strict 24-hour "customer service window" for businesses to respond to users. Understanding this policy is crucial to prevent API errors and ensure a seamless user experience.

## The 24-Hour Window

Businesses have up to 24 hours to respond to a user interaction (e.g., when a user sends a message, clicks a CTA, or interacts with a plugin). Within this window, businesses can send both standard and promotional messages.

## Message Tags

To send messages outside of the 24-hour window, businesses must use specific **Message Tags**. 
The most common tag is `HUMAN_AGENT`, which allows human agents to respond to inquiries within 7 days. Note that many legacy tags (like `CONFIRMED_EVENT_UPDATE` and `POST_PURCHASE_UPDATE`) have been deprecated for this use case.

## UI Limitations and Validations

When sending messages outside the 24-hour window, the API enforces strict validations. If a bot attempts to send a standard message after 24 hours, the user's UI does not change, but the backend API request will fail, meaning the message is never delivered. In severe cases of policy violation, Facebook may temporarily block the Page from sending any messages.

### API Error Codes for Limitation

If you violate the policy, the API returns specific error codes:
- **Code 10, Subcode 2018278**: This message is sent outside of the allowed conversation window.
- **Code 10, Subcode 2534022**: This message is sent outside of the allowed conversation window.
- **Code 100**: Unsupported message tag (if using a deprecated tag).

## Examples

<!-- preview -->
✅ Valid: Sending a promotional message 5 hours after the user's last message.
❌ Invalid: Sending a promotional message 25 hours after the user's last message without a valid message tag (Triggers Error Code 10).

<!-- preview -->
✅ Valid: Using the `HUMAN_AGENT` tag to reply manually 48 hours after the user's last interaction.
❌ Invalid: Using the `HUMAN_AGENT` tag for an automated, non-human promotional blast.\n\n
<!-- panel:comparison -->
**Standard Messaging vs Message Tags**
- **Standard Window (24h):** Allows promotional and non-promotional content within 24 hours of the user\'s last interaction.
- **Message Tags:** Allows sending non-promotional updates (e.g. POST_PURCHASE_UPDATE) outside the 24h window.
<!-- endpanel -->
\n
<!-- panel:quiz -->
Which of the following is ALLOWED outside the 24-hour standard messaging window without a tag?
- [ ] Sending a discount code.
- [ ] Sending a daily newsletter.
- [ ] Asking the user to buy a product.
- [x] None of the above. You must use a Message Tag or Sponsored Message outside 24h.
<!-- endpanel -->
\n