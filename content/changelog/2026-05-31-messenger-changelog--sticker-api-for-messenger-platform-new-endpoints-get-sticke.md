---
title: ### Sticker API for Messenger Platform  **New endpoints:**  - `GET /sticker_packs` — List 
date: 2026-05-31
source_slug: messenger-changelog
source_name: Messenger Platform Changelog
source_url: https://developers.facebook.com/docs/messenger-platform/changelog/
category: Deprecation
sv2_modules: [WhatsApp Templates, Broadcasts, Channel Integration/OAuth, Webhooks, Instagram Messaging, Messenger, RBAC]
summary_short: ### Sticker API for Messenger Platform  New endpoints:  - GET /sticker_packs — List available sticker packs with name, description, preview 
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

### Sticker API for Messenger Platform  New endpoints:  - GET /sticker_packs — List available sticker packs with name, description, preview image, and sticker count. - GET /sticker_packs/<STICKER_PACK_ID>/stickers — List stickers within a specific pack, including id, name, image URL, and dimensions. - GET /sticker_search?q=<QUERY> — Search stickers by keyword across all available packs. Supports m

## Why it Matters for SV2

Check whether SEEN V2 relies on the deprecated feature. Plan migration before end-of-life.

## Suggested QA Action

Audit usage of deprecated API/feature in SEEN V2 codebase.

## Source Details

- **Source**: [Messenger Platform Changelog](https://developers.facebook.com/docs/messenger-platform/changelog/)
- **Original date**: June 1, 2026
- **Tags**: N/A

---
*Backfilled from snapshot on 2026-06-24.*
