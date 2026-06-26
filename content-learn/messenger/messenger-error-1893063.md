---
title: "Messenger Error Code 10–1893063: Pages Temporarily Restricted"
date: "2026-06-26"
category: "messenger"
description: "Understanding the new Messenger Platform error code 10–1893063, which is returned when a Page is temporarily restricted from sending messages."
tags: ["messenger", "error-codes", "platform-restrictions", "send-api"]
badge: "NEW"
news_article: "../../content/changelog/2026-06-26-messenger-error-code-10-1893063-pages-temporarily-restricted.md"
---

# Messenger Error Code 10–1893063: Pages Temporarily Restricted

> **NEW** — Added to the Messenger Platform error codes reference on June 25, 2026.

Meta has officially documented **error code `10 – 1893063`** in the Messenger Platform error codes reference. This error is returned by the Send API when a **Page is temporarily restricted from sending messages** by Meta.

## What Is This Error?

When a Facebook Page violates Meta's messaging policies or is flagged for suspicious activity, Meta may temporarily restrict that Page from sending messages. Any attempt to send a message via the Messenger Send API while the restriction is active will fail with:

```json
{
  "error": {
    "message": "Pages temporarily restricted from sending messages",
    "type": "OAuthException",
    "code": 10,
    "error_subcode": 1893063
  }
}
```

## Error Details

| Field | Value |
|---|---|
| **Error Code** | `10` |
| **Subcode** | `1893063` |
| **Type** | `OAuthException` |
| **Cause** | Page is temporarily restricted by Meta |
| **Retryable?** | No — must wait for restriction to be lifted |

## How to Handle It in Your Code

When receiving this error, your integration should:

1. **Log it as a platform restriction**, not a code error
2. **Alert your operations team** immediately
3. **Do NOT retry** — retrying won't help while the restriction is active
4. **Monitor** for the restriction to be lifted before resuming sending

<!-- preview -->
✅ Good: Catch error code 10 + subcode 1893063 → log as "Page restricted", alert team, suppress retries.
❌ Bad: Treat it as a generic error and retry immediately → wastes rate limit quota and delays detection.

<!-- preview -->
✅ Good: Store failed messages to retry after restriction is lifted.
❌ Bad: Drop messages silently without alerting the team.

<!-- panel:comparison -->
**Generic Error Code 10 vs Subcode 1893063**
- **Code 10 (general):** Permission error — your app may be missing a required permission. Check app permissions.
- **Code 10, Subcode 1893063:** Page restriction — the Page itself is temporarily blocked by Meta from sending. No code fix needed.
<!-- endpanel -->

<!-- panel:quiz -->
What should you do when you receive error code 10 with subcode 1893063?
- [ ] Retry the message immediately.
- [ ] Check and re-grant app permissions.
- [ ] Assume the user blocked the Page.
- [x] Alert your operations team and suppress retries until the Page restriction is lifted.
<!-- endpanel -->
