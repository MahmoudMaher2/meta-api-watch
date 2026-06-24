---
title: "WhatsApp Manager: Broadcasts (Campaigns)"
date: "2026-06-24"
category: "whatsapp"
description: "Learn how to create, schedule, and send marketing campaigns (Broadcasts) natively from the WhatsApp Manager without using external APIs."
tags: ["UI", "Broadcasts", "Campaigns", "WhatsApp Manager"]
---

# Broadcasts in WhatsApp Manager

The **Broadcasts** feature in the WhatsApp Manager UI is a game-changer for businesses using the Cloud API. Previously, sending a marketing campaign required an API integration to iterate through a list of numbers and fire the `messages` endpoint. Now, Meta provides a built-in Campaign Builder.

This allows marketing teams to send mass communications (newsletters, promotions, alerts) directly from the Meta Business Suite.

## 1. Creating a Broadcast

To start a campaign, navigate to **WhatsApp Manager > Broadcasts** and click on "Create Broadcast."

### The 3-Step Process:
1. **Choose a Template:** You must select a pre-approved Message Template. You cannot send free-form text in a broadcast. If your template contains variables (e.g., `{{1}}`), you will be prompted to map these variables later.
2. **Select the Audience:** Here, you use the Tags (Labels) you created in the Contacts section. You can choose to send the broadcast to all contacts with a specific tag (e.g., `VIP_Customers`).
3. **Review & Send:** You can choose to send the broadcast **Immediately** or **Schedule** it for a later date and time.

<!-- panel:comparison -->
**Broadcasts UI vs. API Campaigns**
- **Broadcasts UI:** Visual, easy to use, and perfect for one-off scheduled campaigns. However, it lacks advanced variable mapping (like dynamically pulling user names from an external database).
- **API Campaigns:** Requires development but allows for highly personalized templates, dynamic product recommendations, and automated triggering (e.g., abandoned cart campaigns).
<!-- endpanel -->

---

## 2. Limits and Rate Limiting

When you click "Send" on a Broadcast, Meta handles the rate limiting automatically. However, you must still be aware of your **Messaging Tier Limit**.

- If you are in Tier 1 (1,000 unique users/day) and you try to send a broadcast to a Tag containing 5,000 contacts, Meta will throttle or reject the messages that exceed your daily limit.
- Your limits are determined by the phone number's quality rating and usage history. You can view your current limit in the WhatsApp Manager Overview.

<!-- panel:quiz -->
If I schedule a broadcast for tomorrow, which time zone does it use?
- [ ] Pacific Time (PT) always
- [ ] Coordinated Universal Time (UTC) strictly
- [x] The local time zone configured in your Meta Business account settings
- [ ] The customer's device time zone
<!-- endpanel -->

---

## 3. Tracking Broadcast Performance

Once a broadcast is sent, you can view its performance metrics directly in the Broadcasts tab.

### Key Metrics:
- **Sent:** The number of messages successfully dispatched by Meta.
- **Delivered:** The number of messages that reached the user's phone. (A large gap between Sent and Delivered might mean numbers are no longer active on WhatsApp).
- **Read:** The number of users who opened the message (Note: this depends on the user's read receipt privacy settings).
- **Failed:** The number of messages that failed to send.

### Common Failure Reasons:
- **User Blocked:** The user previously blocked your business number.
- **Opt-out:** The user is no longer opted-in.
- **Limit Exceeded:** You hit your daily messaging limit mid-campaign.

<!-- panel:example -->
**Campaign Example:**
**Goal:** Promote a Weekend Flash Sale.
1. **Template:** Select an approved `MARKETING` template with an image and a "Shop Now" button.
2. **Audience:** Select the `Newsletter_Subscribers` tag.
3. **Schedule:** Schedule for Friday at 10:00 AM.
4. **Analysis:** Check back on Monday to see the *Read* rate and compare it against the clicks on your website.
<!-- endpanel -->
