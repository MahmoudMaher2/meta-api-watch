---
slug: whatsapp-business-profile
title: WhatsApp Business Profile API
platform: WhatsApp
category: Core API
priority: medium
source_url: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles
last_verified: 2026-06-24
---

# WhatsApp Business Profile API

The Business Profile API allows SEEN V2 to programmatically manage the public-facing profile of a WhatsApp Business Account (WABA). This is what end-users see when they click on the business name in WhatsApp.

## Managing the Profile

You can read and update the profile details using the `/whatsapp_business_profile` edge on the Phone Number ID.

### Parameters & Fields (Updating Profile)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messaging_product` | string | Yes | Must be `"whatsapp"` |
| `address` | string | No | Physical address (max 256 chars) |
| `description` | string | No | Business description (max 512 chars) |
| `vertical` | enum | No | Industry category (e.g., `RETAIL`, `FINANCE`) |
| `email` | string | No | Contact email (max 128 chars) |
| `websites` | array | No | Up to 2 URLs (max 256 chars each) |
| `profile_picture_handle`| string | No | Uploaded media handle for the avatar |
| `about` | string | No | The "About" text shown below the number (max 139 chars) |

## Validation Rules

| Rule | ❌ Gets REJECTED | ✅ Gets ACCEPTED |
|------|-----------------|-----------------|
| Websites Limit | Array with 3+ URLs | Array with 1 or 2 URLs |
| Website Format | `"www.example.com"` | `"http://www.example.com"` or `"https://..."` |
| About Length | 140+ characters | 139 chars max |
| Vertical Enum | `"Technology"` | `"OTHER"`, `"RETAIL"`, `"PROF_SERVICES"` etc. |

## Live Preview — What It Looks Like

<!-- preview:accepted -->
### ✅ Correct Usage — Updating Profile

```json
POST /v19.0/{PHONE_NUMBER_ID}/whatsapp_business_profile
Authorization: Bearer {ACCESS_TOKEN}

{
  "messaging_product": "whatsapp",
  "address": "123 Commerce St, New York, NY",
  "description": "Your favorite place for tech gadgets.",
  "vertical": "RETAIL",
  "email": "contact@seenv2.com",
  "websites": [
    "https://seenv2.com",
    "https://help.seenv2.com"
  ],
  "about": "Available 24/7 for support"
}
```

**Why it works:** Valid URL formats, less than 3 websites, valid vertical enum.

<!-- preview:rejected -->
### ❌ Common Mistake — Invalid Website Format

```json
{
  "messaging_product": "whatsapp",
  "websites": [
    "seenv2.com"
  ]
}
```

**Error:** `Error 100: Invalid parameter` — URLs must begin with `http://` or `https://`.

## Profile Picture

Updating the profile picture requires a 2-step process using Resumable Uploads, not a direct URL.

1. **Create an Upload Session:** POST to `/{APP_ID}/uploads`
2. **Upload the file:** POST binary data to the returned session ID
3. **Update the profile:** Pass the returned handle to `profile_picture_handle`

## SEEN V2 Implementation Notes

- **Settings UI:** SEEN V2's settings dashboard should strictly validate these inputs client-side (especially URL schemes and max character counts) before hitting the Meta API to prevent frustrating errors.
- **Caching:** Fetch the profile on app load and cache it. Do not fetch it dynamically on every page render.

## QA Checklist

- [ ] Validate URLs have `http(s)://`
- [ ] Enforce max length of 139 chars for the `about` field
- [ ] Ensure vertical selection uses Meta's exact enum values, not arbitrary strings
