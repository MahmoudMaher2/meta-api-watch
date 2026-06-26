---
title: "Messenger Error Code 10–1893063: Pages Temporarily Restricted from Sending Messages"
date: 2026-06-26
source_slug: messenger-changelog
source_name: Messenger Platform Changelog
source_url: https://developers.facebook.com/docs/messenger-platform/changelog/
category: Bug Fix/Clarification
sv2_modules: [Messenger, RBAC]
tags: [messenger, error-codes, platform-restrictions]
summary_short: "Meta added error code 10–1893063 to the Messenger Platform error codes reference for Pages that are temporarily restricted from sending messages."
learn_topic: messenger-error-1893063
badge: NEW
---

## Summary

On **June 25, 2026**, Meta updated the Messenger Platform [common error codes reference](https://developers.facebook.com/docs/messenger-platform/reference/send-api/error-codes) to add **error code `10 – 1893063`**, which is returned when a **Page is temporarily restricted from sending messages**.

This is a documentation update that surfaces a previously undocumented platform behavior: when Meta enforces a temporary messaging restriction on a Page, API calls to the Send API will now fail with this specific error code.

## What Changed

| Field | Detail |
|---|---|
| **Error Code** | `10` |
| **Error Subcode** | `1893063` |
| **Meaning** | The Page is temporarily restricted from sending messages |
| **API affected** | Messenger Send API |
| **Change type** | Documentation update (error code now officially documented) |

## Why it Matters for SV2

If SEEN V2's Messenger integration does not currently handle error code `10` with subcode `1893063`, messages may silently fail or be misclassified as generic API errors during a Page restriction period. Developers should:

1. **Add explicit handling** for subcode `1893063` in Messenger error handling code
2. **Alert operations teams** when this error is received — it indicates a Meta-enforced restriction, not a code bug
3. **Avoid retry storms** — retrying a temporarily restricted Page will not help; wait for the restriction to be lifted

## Suggested QA Action

- Search the SEEN V2 codebase for Messenger Send API error handling
- Verify that error code `10` + subcode `1893063` is handled gracefully (e.g., logged, operation team alerted, retry suppressed)
- Test the error path using a Page in a restricted state (or mock the API response)

## Source Details

- **Source**: [Messenger Platform Changelog](https://developers.facebook.com/docs/messenger-platform/changelog/)
- **Original date**: June 25, 2026
- **Audit verified**: ✅ Confirmed live on developers.facebook.com/docs/messenger-platform/changelog/

---
*Detected by Meta API Explain pipeline on 2026-06-26.*
