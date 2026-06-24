---
title: "WhatsApp Product Catalog Messages: UI Limits and Validations"
date: "2026-06-24"
category: "whatsapp"
description: "A comprehensive guide on the limitations, validations, and UI constraints of Multi-Product Messages in the WhatsApp Business API."
tags: ["product-catalog", "multi-product-messages", "limitations", "validations"]
---

# WhatsApp Product Catalog Messages

When utilizing Multi-Product Messages (MPM) via the WhatsApp Business API, there are strict UI limitations and validations that you must adhere to. This ensures a consistent and performant experience for end-users.

## Product and Section Limits

Multi-Product Messages allow you to showcase multiple items, but they are bounded by specific capacity constraints:

*   **Maximum Products:** You can include a maximum of **30 products** in a single Multi-Product Message.
*   **Sections:** Products can be organized into a maximum of **10 sections**.
*   **Section Titles:** If you use more than one section, every section must have a title. Section titles are limited to a maximum of **24 characters**.

<!-- preview -->
✅ Valid: A catalog message containing 25 products divided into 4 sections, with titles like "Summer Collection" (17 characters).
❌ Invalid: A catalog message attempting to send 35 products, or a section title like "Our Exclusive Premium Summer Collection 2026" (45 characters).

## Thumbnail Image Validations

The presentation of product images within the chat and the Product Detail Pages (PDP) has specific rules:

*   **Template Header Image:** The thumbnail of the item defined in your Meta product catalog is automatically used as the header image for the template message.
*   **Product Detail Pages (PDP):** When a user clicks to view product details, the PDP only supports static product images. Videos or GIFs associated with a product in the catalog will not be displayed.
*   **General Media Size:** Product images generally adhere to the standard media limit of 5 MB for formats like `.jpeg`, `.jpg`, and `.png`.

<!-- preview -->
✅ Valid: Using high-quality JPEG images (under 5MB) for products in the Meta catalog, which correctly render as static thumbnails.
❌ Invalid: Attempting to display an animated GIF as a product thumbnail in the Product Detail Page, as it will either not display or be rendered as a static frame.

## Additional UI Constraints

*   **Catalog Requirement:** You must have a connected Meta product catalog to send these messages.
*   **Interactive Nature:** These are considered interactive messages and are primarily used within the 24-hour customer service window.
