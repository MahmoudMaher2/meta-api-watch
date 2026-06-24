---
title: WhatsApp Billing & Pricing Model
date: 2026-06-24
category: whatsapp
description: An overview of the WhatsApp Business API per-message billing model, conversation categories, and the 24-hour window.
tags: [billing, pricing, categories, 24hr-window, ui-impact]
---

# WhatsApp Billing & Pricing Model

As of recent updates, the WhatsApp Business API utilizes a **per-message billing model**. Understanding the conversation categories and the 24-hour window is crucial for managing costs and optimizing your user interface.

## Conversation Categories

Every template message is classified into one of four categories:

1. **Service**: Customer-initiated replies within the 24-hour window. These are free.
2. **Utility**: Used for order or payment updates and reminders. They are free if sent within an open 24-hour window but charged outside of it.
3. **Authentication**: OTPs and login verification codes. These are always charged.
4. **Marketing**: Promotions, offers, and re-engagement messages. These are always charged.

## The 24-Hour Window

The 24-hour "Customer Service Window" (CSW) opens when a customer sends a message to your business and resets with every new inbound message. Within this window, Service messages and Utility templates are free. Once the window expires, you can only send pre-approved templates, which are billed accordingly.

## UI Impacts and Validations

The pricing model significantly impacts UI design for agent dashboards:

- **Visual Countdown Timers**: UIs should display the remaining time in the 24-hour window.
- **Template Logic**: The UI must restrict or warn users when attempting to send paid templates when a free message could be used.
- **Cost Transparency**: Dashboards should track template usage to estimate costs.

### UI Validation Examples

<!-- preview -->
✅ Valid: The UI disables the "Send Free-form Message" button and requires selecting a pre-approved template when the 24-hour window has expired.
❌ Invalid: The UI allows the agent to type a free-form Service message 48 hours after the customer's last reply, leading to a silent API delivery failure.

<!-- preview -->
✅ Valid: The CRM displays a clear 24-hour countdown timer next to the active chat session.
❌ Invalid: The agent interface provides no visual indication of the CSW state, increasing the risk of unnecessary template charges.\n\n
<!-- panel:comparison -->
**Business-Initiated vs User-Initiated**
- **Business-Initiated:** When you send a template to start a conversation. Charged based on the template category (Marketing, Utility).
- **User-Initiated (Service):** When a user messages you first, opening a 24-hour window. Charged at the lower Service conversation rate.
<!-- endpanel -->
\n
<!-- panel:quiz -->
How many free Service (user-initiated) conversations does a WhatsApp Business account get per month?
- [ ] 10,000
- [x] 1,000
- [ ] 0 (All conversations are paid)
- [ ] Unlimited
<!-- endpanel -->
\n