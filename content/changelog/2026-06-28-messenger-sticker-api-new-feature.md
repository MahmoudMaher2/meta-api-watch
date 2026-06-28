---
title: "Messenger Sticker API: Browse, Search, and Send First-Party Stickers via API"
date: 2026-06-28
source_slug: messenger-changelog
source_name: Messenger Platform Changelog
source_url: https://developers.facebook.com/docs/messenger-platform/changelog/
category: New Feature
sv2_modules: [Messenger, Webhooks]
tags: [messenger, sticker-api, send-api, webhooks, new-feature]
summary_short: "Meta launched the Messenger Sticker API: new endpoints to browse, search, and send first-party stickers. Webhooks now include a new 'sticker' attachment type — a 90-day transition period applies (until August 30, 2026)."
learn_topic: messenger-sticker-api
badge: NEW
---

## Summary

On **June 1, 2026**, Meta launched the **Sticker API for Messenger Platform** — a new set of endpoints enabling businesses to browse, search, and send first-party stickers programmatically through the Messenger Platform API.

> ⚠️ **Action Required — Webhook Breaking Change:** Sticker messages in webhooks now include a new `type: "sticker"` attachment. The 90-day transition period ends **August 30, 2026** — after that, only the `sticker` type will be sent. Update your webhook handlers before that date.

---

## What Changed

### New API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/sticker_packs` | `GET` | List available sticker packs (name, description, preview image, sticker count) |
| `/sticker_packs/<STICKER_PACK_ID>/stickers` | `GET` | List stickers in a pack (id, name, image URL, dimensions) |
| `/sticker_search?q=<QUERY>` | `GET` | Search stickers by keyword — supports `locale` param (e.g., `locale=ko_KR`) |

**Authentication:**
- `GET /sticker_packs` and `GET /sticker_search` → **app access token** (no additional permissions)
- Sending stickers → requires **`pages_messaging`** permission

### Sending Stickers — Send Messages API

Use the existing Send Messages API with the new `sticker_id` field:

```json
{
  "recipient": { "id": "<PSID>" },
  "message": { "sticker_id": 767226160478561 }
}
```

### Webhook Breaking Change

| Period | Webhook payload |
|---|---|
| **Now → August 30, 2026** | Both `type: "image"` AND `type: "sticker"` attachments present |
| **After August 30, 2026** | Only `type: "sticker"` attachment — `image` type removed |

**New sticker attachment format:**
```json
{
  "type": "sticker",
  "sticker_id": 767226160478561
}
```

> The same transition applies to **message echoes** and **Conversations API responses**.

---

## Why it Matters for SV2

- SV2's Messenger webhook handlers currently expect `type: "image"` for sticker messages. After **August 30, 2026**, these will break — stickers will arrive only as `type: "sticker"`.
- The backend must be updated to recognize and handle the `sticker` attachment type.
- If SV2 surfaces sticker messages in the conversation UI, the sticker rendering path needs to be added.

## Suggested QA Action

1. **Immediate**: Test that incoming sticker messages are handled — during the transition period, both `image` and `sticker` types arrive. Verify neither causes an unhandled exception.
2. **Before August 30**: Add explicit `type: "sticker"` handler to the Messenger webhook processor.
3. **Optional**: Test the new `/sticker_packs` and `/sticker_search` endpoints if SV2 plans to expose sticker selection to agents.

## Source Details

- **Source**: [Messenger Platform Changelog](https://developers.facebook.com/docs/messenger-platform/changelog/)
- **Original date**: June 1, 2026
- **Audit verified**: ✅ Confirmed live on developers.facebook.com/docs/messenger-platform/changelog/
- **Learn Hub topic**: [messenger-sticker-api](../../../content-learn/messenger/messenger-sticker-api.md)

---
*Detected by Meta API Explain pipeline on 2026-06-28.*
