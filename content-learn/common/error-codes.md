---
title: Error Codes — Complete Reference
slug: error-codes
platform: Common
category: Core API
priority: high
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/support/error-codes
last_verified: 2026-06-24
---

# Error Codes — Complete Reference

All WhatsApp Business API errors follow a consistent structure. Understanding the codes prevents wasted debugging time.

## Error Response Structure

```json
{
  "error": {
    "message": "Invalid parameter",
    "type": "OAuthException",
    "code": 100,
    "error_subcode": 2388024,
    "error_data": {
      "messaging_product": "whatsapp",
      "details": "Template name already exists"
    },
    "fbtrace_id": "AbCd1234..."
  }
}
```

| Field | Meaning |
|-------|---------|
| `code` | Top-level error category |
| `error_subcode` | Specific sub-error within category |
| `error_data.details` | Human-readable explanation |
| `fbtrace_id` | Use this when contacting Meta Support |

---

## Top-Level Error Codes

### Graph API General Errors

| Code | Name | Common Cause |
|------|------|-------------|
| `1` | Unknown error | Temporary Meta issue — retry |
| `2` | Service temporarily unavailable | Meta outage — retry with backoff |
| `4` | Application request limit reached | Rate limit exceeded |
| `10` | Permission denied | App lacks required permission |
| `100` | Invalid parameter | Wrong value format or missing field |
| `190` | Invalid/expired access token | Token expired or revoked |
| `200` | Requires permission | Missing Facebook/Meta permission |

---

## WhatsApp-Specific Error Codes (13xxxx)

### 130xxx — Throttling & Rate Limits

| Code | Error | Cause | Fix |
|------|-------|-------|-----|
| `130429` | Rate limit hit | Sending > 80 msg/sec | Reduce to 80/sec |
| `130472` | User message limit reached | Individual user limit | Back off for this user |

### 131xxx — Message Send Errors

| Code | Error | Cause | Fix |
|------|-------|-------|-----|
| `131000` | Sending failure | Generic error | Check `details` for specifics |
| `131005` | Permission denied | Missing `whatsapp_business_messaging` | Grant permission in app review |
| `131008` | Required parameter missing | Missing `to`, `type`, etc. | Add missing field |
| `131009` | Parameter not valid | Bad phone number, invalid media | Validate before sending |
| `131016` | Service unavailable | WhatsApp Cloud API down | Retry with exponential backoff |
| `131021` | Recipient not valid | Number not registered on WhatsApp | Verify number first |
| `131026` | Message undeliverable | User unreachable or blocked | Log and skip |
| `131042` | Business eligibility — payments | Not enabled for payments | Enable payments for WABA |
| `131045` | Incorrect certificate | SSL issue | Fix SSL configuration |
| `131047` | Re-engagement required | No 24h window open | Send a template |
| `131048` | Spam rate limit | Too many messages to user | Throttle per-user sends |
| `131049` | Marketing template limit | User hit Meta-enforced limit | Normal — respect the limit |
| `131050` | User opted out | User unsubscribed | Must not message this user |
| `131051` | Unsupported message type | User can't receive this type | Use different type |
| `131052` | Media download error | URL inaccessible or expired | Re-upload media |
| `131053` | Media upload error | Upload failed | Retry upload |
| `131057` | Account in maintenance | WABA under maintenance | Wait and retry |

### 131063-131064 — Template Enforcement

| Code | Error | Cause | Fix |
|------|-------|-------|-----|
| `131063` | Marketing templates disabled | WABA violated policy | Contact Meta support |
| `131064` | Account messaging limit | Classification violations accumulated | Review and fix template categories |

### 132xxx — Template Errors

| Code | Error | Cause | Fix |
|------|-------|-------|-----|
| `132000` | Template param count wrong | Wrong number of `parameters` objects | Count must match template exactly |
| `132001` | Template not found | Wrong name, wrong language, not approved | Verify template is `APPROVED` |
| `132005` | Translated text too long | Variable expansion exceeds limit | Shorten parameter values |
| `132006` | Template paused | Low quality score | Use a different template |
| `132007` | Template policy violation | Violates WhatsApp Business Policy | Fix template content |
| `132012` | Variable format incorrect | Wrong parameter type or format | Check `type` in parameters |
| `132015` | Template paused | Same as 132006 | — |
| `132016` | Template disabled | Permanently disabled | Create a new template |
| `132018` | Template validation error | Variables mismatch | Align send params with template |
| `132068` | Flow unavailable | Embedded flow in template failed | Check Flow status |
| `132069` | Flow blocked | Flow has errors | Fix the Flow |

### 133xxx — Account Registration Errors

| Code | Error | Cause | Fix |
|------|-------|-------|-----|
| `133000` | Phone number not registered | Registration didn't complete | Complete Cloud API registration |
| `133004` | Server temporarily unavailable | Registration service down | Retry |
| `133005` | Two-step verification PIN error | Wrong PIN | Provide correct PIN |
| `133006` | Phone number re-verification needed | Cert expired | Re-verify number |
| `133008` | Account locked | Too many PIN attempts | Wait for lockout to expire |
| `133009` | Phone already registered | Can't re-register | Deregister first |
| `133010` | Cloud API not accessible | Account issue | Contact Meta support |
| `133015` | Registration too fast | Repeated registration attempts | Wait before retrying |

### 134xxx — Template Sync Errors (Send-time)

| Code | Error | Cause | Fix |
|------|-------|-------|-----|
| `134100` | Template does not exist | Not propagated yet after creation | Wait up to 10 minutes |
| `134101` | Template not synced | Creation/edit still propagating | Retry after a few minutes |
| `134102` | Template unavailable | Ad sync failed | Check Meta Ads account link |

---

## Template Validation Error Subcodes

These appear as `error_subcode` when creating/editing templates:

| Subcode | Error | Fix |
|---------|-------|-----|
| `2388019` | Template count limit | Delete unused templates |
| `2388024` | Duplicate template name | Choose different name |
| `2388040` | Character limit exceeded | Shorten field |
| `2388047` | Header format incorrect | Fix header component |
| `2388049` | Button URL invalid | Use valid HTTPS URL |
| `2388055` | Coupon code too long | Max 20 chars |
| `2388072` | Body format incorrect | Fix `{{n}}` variable syntax |
| `2388073` | Footer has variables | Remove variables from footer |
| `2388075` | Sample value mismatch | Fix example values |
| `2388293` | Too many variables | Reduce variable count or add text |
| `2388299` | Dangling variable | Surround variable with text |
| `2494177` | TOS URL not allowed | Use approved ToS URL |

---

## Messenger Error Codes

| Code | Error | Cause | Fix |
|------|-------|-------|-----|
| `10` | Permission not granted | Send API not approved | Submit for App Review |
| `100` | Invalid parameter | Wrong PSID, wrong attachment | Validate recipient |
| `200` | No messaging permission | User hasn't messaged page, outside 24h window | Use notification/message tag |
| `551` | User blocked | User blocked the page | Don't retry |
| `613` | Rate limit | Too many messages | Throttle sends |

---

## Error Handling Strategy for SEEN V2

| Error Code | Action |
|------------|--------|
| `131000`, `131016`, `2` | Retry with exponential backoff (max 3 attempts) |
| `131026` | Log and skip — don't retry |
| `131047` | Queue message as "template required" |
| `131048`, `130429` | Back off — wait before sending more |
| `131049`, `131050` | Remove user from broadcast list |
| `131052`, `131053` | Re-upload media and retry |
| `132001`, `132006`, `132016` | Alert QA team — template issue |
| `132000` | Bug — fix parameter count in code |
| `190` | Refresh access token |
| `4`, `10` | Alert developer — permission issue |
