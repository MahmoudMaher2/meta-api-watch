---
date: 2026-06-24
slug: whatsapp-quality-limits
title: WhatsApp Quality Rating & Messaging Limits
platform: WhatsApp
category: Core API
priority: high
source_url: https://developers.facebook.com/docs/whatsapp/messaging-limits
last_verified: 2026-06-24
---

# WhatsApp Quality Rating & Messaging Limits

Meta enforces a strict quality control system to prevent spam on WhatsApp. This system relies heavily on **user feedback** (blocks, reports, low engagement).
The quality system in WhatsApp Business is divided into two interconnected parts: **Phone Number Quality** and **Message Template Quality**.

---

## 1. Phone Number Quality

Your business phone number's quality rating is evaluated based on the messages sent over the past 7 days.

### Quality Levels:
- **High (GREEN):** High quality. Block and report rates are very low.
- **Medium (YELLOW):** Warning. There is a noticeable increase in negative user feedback (blocks/reports). You should review your message content and target your audience more precisely.
- **Low (RED):** Danger. Quality is very low, which will lead to a change in your phone number status.

### Phone Number Status & "Flagged" Penalty:
- \`CONNECTED\`: The normal status of the number.
- \`FLAGGED\`: If the number's quality drops to **Low (RED)**, its status changes to Flagged.
  - **Penalty:** You cannot upgrade your messaging tier to a higher level.
  - **Grace Period:** If the quality does not improve within 7 days, your messaging limit will be **downgraded** (e.g., from 100,000 down to 10,000).
- \`RESTRICTED\`: The number is restricted if it reaches its messaging limit while having a low quality rating.
- \`OFFLINE\`: The number is permanently banned or unavailable.

---

## 2. Message Template Quality

To protect phone numbers from quickly dropping to the "RED" state, Meta introduced a specific rating for each individual message template.

### Template Quality Levels:
- **Active (GREEN):** The template works normally, and user engagement is positive or neutral.
- **Active - Warning (YELLOW):** The template is receiving more negative feedback than usual. (You will receive a warning to change the content).
- **Paused (RED):** If the template's quality drops to a very low level, it is **automatically paused**.
  - This template cannot be sent to any new customer (any API request will be met with \`Error 100\`).
  - The pause is enacted to protect your phone number from dropping in overall rating.
  - The pause duration increases progressively:
    - 1st time: Paused for 3 hours.
    - 2nd time: Paused for 6 hours.
    - 3rd time: \`DISABLED\` (permanently disabled).

<!-- panel:comparison -->
**Relationship Between Template Quality and Phone Number Quality**
- **Template Quality:** The first line of defense. It stops a specific annoying marketing message from reaching more customers.
- **Phone Number Quality:** The overall rating. It is affected by all templates and customer service messages combined.
<!-- endpanel -->

---

## 3. Messaging Limits (Tiers)

Messaging limits determine the **maximum number of business-initiated conversations (Marketing, Utility, Auth)** you can open in a consecutive 24-hour period.
*(User-initiated Service conversations do not count toward this limit).*

1. **Unverified Limit:** 250 conversations / 24 hours (for businesses that are not yet verified).
2. **Tier 1:** 1,000 unique customers / 24 hours.
3. **Tier 2:** 10,000 unique customers / 24 hours.
4. **Tier 3:** 100,000 unique customers / 24 hours.
5. **Tier 4:** Unlimited.

### How are upgrades handled?
Meta automatically upgrades your number to the next tier within 24 hours if two conditions are met:
1. **Your Phone Number Quality is not "Low" (RED)**.
2. The volume of conversations initiated over the last 7 days **exceeds half of your current limit** (e.g., sending over 500 messages to unique customers while in Tier 1).

---

## 4. Validation Rules & API Behavior

| Scenario | ❌ Result (Reject/Error) | ✅ Accepted Behavior |
|----------|-----------------------------|----------------------|
| Sending a broadcast exceeding limit | \`Error 131056: Rate limit hit\` | Throttle campaign messages until a new window opens |
| Attempting to send a PAUSED template | \`Error 100: Invalid parameter\` | Handle rejection and notify user of paused template |
| Tracking quality changes | - | Listen for Webhooks: \`phone_number_quality_update\` |

<!-- panel:quiz -->
What happens if you ignore a phone number quality warning and your rating drops to Low (RED)?
- [ ] Your account is immediately and permanently banned.
- [ ] Only customer service messages are paused.
- [x] The number status changes to Flagged, tier upgrades are blocked, and if it lasts for 7 days, your limit is downgraded.
- [ ] Nothing happens except the template in use gets paused.
<!-- endpanel -->

## 5. SEEN V2 Implementation Notes

- **Throttling Engine:** The broadcast engine must check the current Tier of the number to avoid sending messages that exceed the limit, wasting API calls with \`Error 131056\`.
- **Template Pause Monitoring:** Enable the \`message_template_status_update\` Webhook to know when a template goes \`PAUSED\`, immediately halt scheduled campaigns relying on it, and show an alert to the user.
