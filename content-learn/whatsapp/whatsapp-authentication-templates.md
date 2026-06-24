---
title: "WhatsApp Authentication Templates: UI Constraints and Validations"
date: "2026-06-24"
category: "whatsapp"
description: "Understand the limitations, button constraints, and OTP validations for Authentication Templates in the WhatsApp Business API."
tags: ["authentication", "templates", "otp", "ui-constraints", "limitations"]
---

# WhatsApp Authentication Templates

Authentication templates are highly regulated by Meta to ensure security and prevent misuse. They come with strict UI limitations and fixed structures.

## One-Time Password (OTP) Length Limits

The most critical data in an authentication template is the OTP itself. 

*   **Maximum Length:** The One-Time Password or verification code value cannot exceed **15 characters**.

<!-- preview -->
✅ Valid: An OTP generated as "492-184" (7 characters).
❌ Invalid: An OTP containing a long encrypted token like "A8B2-9F4D-11XQ-LMNP-99" (22 characters).

## UI Constraints and Content Restrictions

Authentication templates have a rigid structure. You cannot freely format the text.

*   **No URLs or Media:** The template body and footer **cannot** include any URLs, images, videos, documents, or emojis.
*   **Fixed Structure:** The text structure is preset by Meta. You can only include the required verification message, an optional security disclaimer (e.g., "For your security, do not share this code"), and an optional expiration warning.

<!-- preview -->
✅ Valid: A text-only message containing the OTP, a security disclaimer, and a copy-code button.
❌ Invalid: An authentication template that attempts to include the company logo (image) or an emoji 🔒 in the message body.

## Button Limitations

Authentication templates are heavily restricted regarding the types of buttons they can display.

*   **Single Authentication Button:** You must include exactly **one** authentication button. This can be either a **Copy Code** button or a **One-Tap Autofill** button (Android).
*   **No Other Button Types:** You cannot use Quick Reply buttons, Call-to-Action (URL) buttons, or Phone Number buttons within an authentication template.
*   **Copy Code Limitation:** The Copy Code button simply copies the OTP to the user's clipboard. It does not automatically paste it or redirect the user to your app (unless using iOS 26+ native keyboard suggestions).

<!-- preview -->
✅ Valid: An authentication template featuring a single "Copy Code" button at the bottom.
❌ Invalid: An authentication template that includes a "Copy Code" button alongside a "Visit Website" URL button.
