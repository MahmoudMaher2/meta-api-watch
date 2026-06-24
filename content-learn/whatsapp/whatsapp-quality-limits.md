---
slug: whatsapp-quality-limits
title: WhatsApp Quality Rating & Messaging Limits
platform: WhatsApp
category: Core API
priority: high
source_url: https://developers.facebook.com/docs/whatsapp/messaging-limits
last_verified: 2026-06-24
---

# WhatsApp Quality Rating & Limits

Meta enforces a strict quality control system to prevent spam on WhatsApp. If a business sends unwanted messages, users will block or report them. Meta tracks these blocks/reports to calculate a **Quality Rating**.

## Messaging Tiers (Limits)

Every WhatsApp Business Account starts with a specific messaging limit. This is the maximum number of **business-initiated** conversations (Marketing, Utility, Auth) you can open in a rolling 24-hour window.

1. **Tier 1:** 1,000 unique customers / 24 hours.
2. **Tier 2:** 10,000 unique customers / 24 hours.
3. **Tier 3:** 100,000 unique customers / 24 hours.
4. **Tier 4:** Unlimited unique customers.

*Note: User-initiated conversations (Service conversations) do not count towards these limits.*

## Quality Ratings (Status)

Your phone number has a Quality Rating visible in the WhatsApp Manager (and via API/Webhooks).

- **High (Green):** Normal.
- **Medium (Yellow):** Warning.
- **Low (Red):** Danger.

If your rating hits "Low", your number's status changes from `CONNECTED` to `FLAGGED`.

### The "Flagged" Penalty

When your number is `FLAGGED`:
- You cannot upgrade to a higher messaging tier.
- If your rating doesn't improve within 7 days, your messaging limit is **downgraded** (e.g., from 10K back down to 1K).
- If it remains low continuously, Meta may permanently disable the number.

## Upgrading Limits

Meta automatically upgrades your limit (e.g., Tier 1 -> Tier 2) within 24 hours when both of the following are true:
1. Your quality rating is NOT Low.
2. The cumulative total of business-initiated conversations you've opened over the last 7 days is greater than half of your current limit (e.g., > 500 for a 1k limit).

## Validation Rules & API Behavior

| Scenario | ❌ Result (Rejection/Error) | ✅ Accepted Behavior |
|----------|-----------------------------|----------------------|
| Sending Broadcast over limit | `Error 131056: Rate limit hit` | Paused until window opens |
| Sending a PAUSED template | `Error 100: Invalid parameter` | - |
| Webhook status change | - | `phone_number_quality_update` webhook |

## SEEN V2 Implementation Notes

- **Throttling:** SEEN V2's Broadcast engine **MUST** check the current messaging tier before queuing 10,000 messages on a Tier 1 account. If it blasts 10K messages, 9,000 will fail with `Error 131056`, wasting API calls and potentially getting flagged for abuse.
- **Webhooks:** SEEN V2 should listen for the `phone_number_quality_update` and `message_template_status_update` webhooks to alert the SEEN V2 user if they enter the "Red" zone or a template gets paused due to negative feedback.

## QA Checklist

- [ ] Ensure SEEN V2 tracks the 24-hour rolling volume of outbound broadcast messages.
- [ ] Implement an alert banner in the SEEN V2 dashboard if the `quality_rating` webhook payload drops to `YELLOW` or `RED`.
- [ ] Prevent sending broadcast messages if the template status is `PAUSED`.
