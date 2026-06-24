---
title: WhatsApp Flows JSON UI Limits & Validation
date: 2026-06-24
category: whatsapp
description: Best practices and technical limits for WhatsApp Flows JSON UI, including screens, components, and character limits.
tags: [flows, json, ui, limits, screens, components]
---

# WhatsApp Flows JSON UI Limits & Validation

When designing WhatsApp Flows, you must adhere to technical constraints regarding screen counts, UI components, and JSON file sizes.

## Max Number of Screens

A single Flow is strictly limited to a maximum of **100 screens**.
- **Best Practice**: Limit a single Flow to 3–5 screens to prevent user fatigue.
- **Modularization**: If your workflow is complex, split it into smaller flows and link them using the `flow_ref` action.

## Supported UI Components and Limits

- **Dropdown Components**: Supported up to a maximum of **200 options** per dropdown.
- **Embedded Links**: Supported up to a maximum of **2 embedded links** per screen.
- **Data Endpoint Latency**: Any dynamic data fetching from an endpoint must complete within the 10-second timeout window.

## Character Limits and File Sizes

- **Flow JSON Size**: The total size of your Flow JSON file must not exceed **10 MB**.
- **Input Constraints**: Use `min-chars` and `max-chars` attributes in `TextInput` and `TextArea` to validate user input natively.
- **Template Constraints**: The template message body that triggers the flow is limited to 1,024 characters, and the subtitle is limited to 80 characters.

## UI Validations

<!-- preview -->
✅ Valid: Using `min-chars="5"` and `max-chars="50"` on a text input to ensure the user provides a valid short description before submitting.
❌ Invalid: Attempting to render a dropdown component with 500 options, which exceeds the 200-option limit and causes the Flow validation to fail.

<!-- preview -->
✅ Valid: Splitting a 20-screen onboarding process into 4 separate Flows connected via `flow_ref`.
❌ Invalid: Building a single JSON Flow file with 150 screens, resulting in an upload rejection.
