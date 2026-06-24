---
title: "WhatsApp Manager: Contacts & Tags UI"
date: "2026-06-24"
category: "whatsapp"
description: "Learn how to natively manage audiences, import contacts, and organize customers using Tags directly inside the WhatsApp Manager UI."
tags: ["UI", "Contacts", "Tags", "WhatsApp Manager"]
---

# Contacts & Tags in WhatsApp Manager

Traditionally, businesses using the WhatsApp Cloud API had to build their own CRM or purchase third-party inbox software to store contacts and organize chats. Meta has recently bridged this gap by introducing **Native Contacts and Tags Management** directly inside the WhatsApp Manager (Meta Business Suite).

This empowers businesses to manage their audience, upload contact lists, and segment users without writing a single line of code.

## 1. Managing Contacts

You can access the Contacts section by navigating to **WhatsApp Manager > Contacts** from the left-hand sidebar. This acts as your native address book.

### Adding Contacts
There are two primary ways to add contacts:
1. **Manual Entry:** Adding a single contact by entering their Name, Phone Number, and Country Code.
2. **Bulk Import:** Uploading a CSV or Excel file containing your customer list. 

### Data formatting constraints:
- **Phone Numbers:** Must include the country code without any `+`, `00`, or spaces (e.g., `201012345678`).
- **File Size limit:** Meta generally limits bulk imports to files containing no more than **50,000 contacts per upload**.
- **Duplicates:** The system automatically deduplicates based on the phone number.

<!-- panel:comparison -->
**UI Contacts vs. API Contacts**
- **WhatsApp Manager UI:** Great for marketing teams who have a static list of opted-in customers to send a broadcast.
- **API Management:** Essential for dynamic systems where a user signs up on your website and is instantly added to your database programmatically.
<!-- endpanel -->

---

## 2. Organizing with Tags (Labels)

Tags (sometimes called Labels) are critical for segmenting your audience. By assigning tags to contacts, you can later send highly targeted Broadcasts (Campaigns) to specific groups rather than blasting your entire list.

### Creating and Applying Tags
- **During Import:** When uploading a CSV, you can assign a universal Tag to all contacts in that specific file (e.g., `Q3_Leads_2026`).
- **Manual Assignment:** You can edit any individual contact in the list and assign them multiple tags.

### Limitations and Best Practices
- **Tag Names:** Keep tag names short, descriptive, and avoid special characters.
- **Limit:** While you can create many tags, keeping your tag taxonomy organized is crucial. Use consistent naming conventions.

<!-- panel:quiz -->
Can I automatically tag a user based on the message they send me natively in WhatsApp Manager?
- [ ] Yes, using the built-in auto-rules feature
- [x] No, not natively. Automatic tagging requires a Webhook-driven script
- [ ] Yes, but only for verified business accounts
- [ ] No, it is impossible to tag users based on their messages
<!-- endpanel -->

---

## 3. Opt-in and Compliance

Even though Meta provides the UI to upload contacts, **you are still strictly bound by the Opt-in Policy.**

1. **Explicit Consent:** You must have explicit, opt-in consent from every contact you upload to the WhatsApp Manager. Uploading purchased lists will likely result in a high block rate from users.
2. **Quality Rating:** If you upload a poor-quality list and users block you or report your messages as spam, your Phone Number Quality Rating will drop to "Red" (Low Quality), and your messaging limits may be severely restricted.
3. **Opt-out Handling:** If a user replies with "STOP" or "UNSUBSCRIBE", you must manually remove them from your active tags or delete them from the Contacts UI if you are not using an automated API flow to manage opt-outs.

<!-- panel:example -->
**Effective Tagging Strategy:**
1. `Lead_Website` (Source)
2. `VIP_Customer` (Status)
3. `Interested_In_Shoes` (Product Preference)
*By combining these tags, you can send a highly relevant discount offer only to VIPs interested in shoes.*
<!-- endpanel -->
