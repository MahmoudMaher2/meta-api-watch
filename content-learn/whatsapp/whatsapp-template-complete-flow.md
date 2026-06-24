---
title: "[NEW] WhatsApp Templates: Complete Flow Button"
date: "2026-06-24"
category: "whatsapp"
description: "A comprehensive guide to the Complete Flow (FLOW) button type in WhatsApp Message Templates, including UI limitations, validation rules, and API payload structure."
tags: ["NEW", "Flows", "UI Limitations", "Validation"]
---

# Complete Flow Button in WhatsApp Templates

The **"Complete flow"** button (API type: `FLOW`) is a powerful Call-to-Action (CTA) button in WhatsApp Message Templates. Instead of redirecting users to an external website or prompting a generic quick reply, this button instantly launches a **WhatsApp Flow** directly within the chat interface.

This allows businesses to seamlessly integrate interactive forms, booking flows, or surveys natively inside WhatsApp.

## 1. API Structure (JSON Payload)

To attach a Complete Flow button to a template via the Meta Graph API, you must define the button type as `FLOW` within the template's `components` array.

```json
{
  "name": "booking_flow_template",
  "language": "en_US",
  "category": "UTILITY",
  "components": [
    {
      "type": "BODY",
      "text": "Tap the button below to complete your booking."
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {
          "type": "FLOW",
          "text": "Complete Booking",
          "flow_id": "123456789012345",
          "flow_action": "navigate",
          "navigate_screen": "START_SCREEN"
        }
      ]
    }
  ]
}
```

### Key Parameters:
- `type`: Must be strictly `FLOW`.
- `text`: The label displayed on the button to the user.
- `flow_id`: The unique ID of the WhatsApp Flow.
- `flow_action`: The action to take when tapped. Usually `navigate`.
- `navigate_screen`: The ID of the specific screen inside the Flow JSON that should open first.

---

## 2. UI Limitations & Validations

When designing a template with a `FLOW` button, you must strictly adhere to Meta's UI constraints to prevent template rejection or runtime errors.

<!-- preview -->
✅ Valid
- The `text` label on the FLOW button must not exceed **25 characters**.
- The Flow referenced by `flow_id` must be in a **PUBLISHED** state. A template cannot be approved if it links to a Draft flow.
- You can mix a `FLOW` button with other quick reply buttons, but you can only have **ONE** `FLOW` button per template.

❌ Invalid
- Attempting to pass dynamic variables `{{1}}` inside the FLOW button's `navigate_screen` parameter. Screen names must be hardcoded at the template creation time.
- Adding two `FLOW` buttons to the same template.
- Attempting to link to a `flow_id` that belongs to a different WhatsApp Business Account (WABA).

## 3. Best Practices for Developers
1. **Testing:** Always create a duplicate Flow in `DRAFT` state for testing. You cannot test the template API submission with a Draft flow, so you must publish a v1 of your flow just to get the template approved, then iterate using the Endpoint for dynamic data.
2. **Fallback:** Consider what happens if the user's WhatsApp version is outdated and does not support Flows. Meta automatically displays an "Update WhatsApp" message, but it is good practice to follow up if the flow is not completed within 24 hours.

<!-- panel:comparison -->
**Flow Button vs. Web URL Button**
- **Flow Button:** Keeps the user inside WhatsApp, loads instantly, and can securely use WhatsApp's native data.
- **Web URL Button:** Opens the external browser, might have loading delays, and breaks the conversational experience.
<!-- endpanel -->

<!-- panel:quiz -->
**Question:**
Can you add multiple \`FLOW\` buttons in a single template?

**Answer:**
No, Meta only allows **ONE** \`FLOW\` button per template message.
<!-- endpanel -->

<!-- panel:example -->
**Use Cases for Flows:**
- Appointment Bookings
- Customer Satisfaction Surveys
- Lead Generation Forms
- Event Registrations
<!-- endpanel -->
