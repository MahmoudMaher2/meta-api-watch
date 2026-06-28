---
title: "Messenger Sticker API"
date: "2026-06-28"
category: "messenger"
description: "How to browse, search, and send first-party stickers using the Messenger Platform Sticker API. Includes webhook transition guide (deadline: August 30, 2026)."
tags: ["messenger", "sticker-api", "webhooks", "send-api", "new-feature"]
badge: "NEW"
---

# Messenger Sticker API 🆕

Meta launched the **Sticker API** for Messenger Platform on June 1, 2026. Businesses can now programmatically browse, search, and send first-party sticker packs through the Messenger API.

> ⚠️ **Action Required:** Webhooks now include a `type: "sticker"` attachment. The 90-day transition period ends **August 30, 2026** — after that, only `sticker` type will be sent. Update your webhook handlers before the deadline.

## New Endpoints

| Endpoint | What it does |
|---|---|
| `GET /sticker_packs` | List all available sticker packs |
| `GET /sticker_packs/<ID>/stickers` | List stickers in a specific pack |
| `GET /sticker_search?q=<QUERY>` | Search stickers by keyword |

**Multilingual search:** Use the `locale` parameter — e.g., `locale=ko_KR` for Korean, `locale=vi_VN` for Vietnamese. Defaults to `en_US`.

## Permissions

| Action | Required |
|---|---|
| Browse & Search stickers | App access token (no extra permissions) |
| Send stickers | `pages_messaging` permission |

## Sending a Sticker

Use the Send Messages API with the `sticker_id` field:

<!-- preview -->
```json
{
  "recipient": { "id": "<PSID>" },
  "message": { "sticker_id": 767226160478561 }
}
```

<!-- preview -->
✅ Get the `sticker_id` from `GET /sticker_packs/<ID>/stickers` first, then pass it to the Send API.

## Webhook Transition — Deadline August 30, 2026

<!-- panel:comparison -->
**Before August 30, 2026 (Transition Period)**
Both attachment types are present in the payload:
- `type: "image"` (existing)
- `type: "sticker"` (new — includes `sticker_id` metadata)

**After August 30, 2026**
Only `type: "sticker"` will be sent. The `image` type for stickers is removed.
<!-- endpanel -->

> The same change applies to message echoes and Conversations API responses.

<!-- panel:quiz -->
After August 30, 2026, what attachment type will sticker messages use in Messenger webhooks?
- [ ] `type: "image"` only
- [ ] Both `type: "image"` and `type: "sticker"`
- [x] `type: "sticker"` only
- [ ] `type: "media"`
<!-- endpanel -->
