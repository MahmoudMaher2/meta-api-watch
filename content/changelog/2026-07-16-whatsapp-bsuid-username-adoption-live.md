---
title: "WhatsApp BSUID: Username adoption live; messaging support delayed to July"
date: 2026-07-16
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Bug Fix/Clarification
sv2_modules: [Channel Integration/OAuth, Webhooks]
tags: [whatsapp, bsuid, username-adoption, schedule, bug-fix]
summary_short: "Username reservation and adoption for Business-scoped user IDs (BSUID) went live on June 29, 2026. However, messaging support and the contact request button are delayed to July 2026."
audit_corrections: none
---

## Summary

On **June 29, 2026**, Meta updated the timeline and availability for **Business-scoped user IDs (BSUID)** features:

---

## What Changed

- **Username reservation and adoption:** Went live on **June 29, 2026** (previously scheduled for "later in 2026"). Businesses can now reserve and adopt usernames.
- **Sending messages to BSUID:** Delayed. Support has been moved to **July 2026** (previously scheduled for May 2026).
- **Contact Request button (`REQUEST_CONTACT_INFO`):** Delayed. It will become available starting **early July 2026** (previously scheduled for early May 2026). The text field on this button is optional, and its label cannot be customized.

---

## Why it Matters for SV2

- If SV2 is building workflows around BSUID messaging (crucial for WhatsApp marketing without storing full phone numbers initially), developers must account for the new July 2026 rollout date.
- The webhook and messaging integrations for BSUID cannot be fully tested in production until the July rollout completes.

## Suggested QA Action

1. **Verify Username Adoption**: Check that the business username adoption endpoints are responsive.
2. **Update Timelines**: Inform the product team that BSUID message-sending and the `REQUEST_CONTACT_INFO` button tests are pushed to July 2026.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: June 29, 2026
- **Audit verified**: ✅ Confirmed live on developers.facebook.com
