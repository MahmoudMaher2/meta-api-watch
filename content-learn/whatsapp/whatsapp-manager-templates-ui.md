---
title: "WhatsApp Manager: Message Templates UI"
date: "2026-06-24"
category: "whatsapp"
description: "A comprehensive guide to managing, creating, and editing WhatsApp Message Templates directly through the WhatsApp Manager interface."
tags: ["UI", "Message Templates", "WhatsApp Manager"]
---

# Message Templates UI in WhatsApp Manager

The **Message Templates Library** inside the WhatsApp Manager (`/whatsapp_manager/message_templates`) is the central hub for creating, editing, and monitoring the templates you use to start business-initiated conversations with your customers.

While developers can manage templates entirely via the Cloud API, the visual interface provides a user-friendly way for non-technical teams to craft messages, add interactive elements, and track approval statuses.

## 1. Creating a Template in the UI

To create a new template, click the **"Create template"** button in the top right corner of the Message Templates page.

### The Configuration Steps:
1. **Category:** You must define the template as `Marketing`, `Utility`, or `Authentication`. Meta uses this categorization for billing and quality monitoring.
2. **Name and Language:** Template names must be lowercase and contain only letters, numbers, and underscores (e.g., `seasonal_promo_01`).
3. **Building the Message:**
   - **Header (Optional):** Can be Text, Image, Video, Document, or Location.
   - **Body (Required):** The main text of your message. You can include variables (e.g., `Hello {{1}}!`) to be replaced with dynamic content at send-time.
   - **Footer (Optional):** A short line of text at the bottom.
   - **Buttons (Optional):** Add Quick Replies, Call-to-Action (URLs/Phone Numbers), or advanced buttons like MPM (Multi-Product Messages) and WhatsApp Flows.

### Submission and Samples
When you include variables (`{{1}}`) or dynamic media, Meta highly recommends providing **Sample Content**. This means showing the reviewers exactly what the variable will look like (e.g., putting "John" in the sample box for `{{1}}`). Templates with realistic samples are approved much faster.

<!-- panel:quiz -->
**Question:**
Can I edit the text of a template after it has been approved?

**Answer:**
**Yes!** Meta now allows you to edit approved templates up to **10 times in a 30-day window**. Once edited, the template enters the review process again, but the previous version remains active until the new one is approved.
<!-- endpanel -->

---

## 2. Statuses and Quality Ratings

Every template in your library has an associated Status and a Quality Rating.

### Template Statuses:
- **Pending:** The template is currently under review by Meta's AI or manual reviewers (usually takes a few minutes, but can take up to 24 hours).
- **Approved:** The template is ready to be sent to customers.
- **Rejected:** The template violates WhatsApp policies (e.g., promotional content in a Utility template, or prohibited goods).
- **Paused:** If a template receives too much negative feedback from users (blocks or spam reports), Meta will automatically pause it.

### Template Pausing Workflow:
If a template is paused, you cannot send it to new customers. 
1. The pause initially lasts for **3 hours**.
2. After 3 hours, it unpauses automatically.
3. If negative feedback continues, it will be paused for **6 hours**.
4. Continued abuse leads to permanent disabling of the template.

<!-- panel:comparison -->
**Template Pausing vs. Phone Number Pausing**
- **Template Pausing:** Only affects one specific template that is performing poorly. Other templates can still be sent.
- **Phone Number Pausing/Restricted:** Affects your entire WhatsApp Business Account. Usually happens if your overall Phone Number Quality drops to "Red" (Low).
<!-- endpanel -->

---

## 3. Best Practices for the UI

- **Search and Filter:** As your library grows, use the filter bar to sort by Category, Language, or Status. This is especially helpful for finding and deleting old, unused `REJECTED` templates.
- **Duplication:** Instead of building complex templates from scratch (like Flow templates or Carousel templates), use the "Duplicate" icon next to an existing approved template to save time.
- **Deletion:** Meta enforces a global limit of **250 templates per WABA** (WhatsApp Business Account). Regularly delete old seasonal templates (e.g., `black_friday_2023`) to free up space for new ones.

<!-- panel:example -->
**Fixing a Rejected Template:**
If your template is rejected, click on it to see the rejection reason. 
**Common Fix:** You categorized a message announcing a new feature as `Utility`. Meta's AI rejected it because announcements are considered `Marketing`. 
**Solution:** Edit the template, change the category dropdown from Utility to Marketing, provide a sample, and resubmit.
<!-- endpanel -->
