---
title: Message Templates
slug: whatsapp-message-templates
platform: WhatsApp
category: Core API
priority: high
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview
last_verified: 2026-06-24
---

# Message Templates

Templates are pre-approved message formats required for business-initiated conversations outside of a 24-hour customer service window. Every marketing, utility, or authentication message sent first must exist as an approved template.

## Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/{version}/{waba-id}/message_templates` | Create a template |
| `GET` | `/{version}/{waba-id}/message_templates` | List templates |
| `GET` | `/{version}/{template-id}` | Get template details |
| `POST` | `/{version}/{template-id}` | Edit a template |
| `DELETE` | `/{version}/{waba-id}/message_templates` | Delete template(s) |

---

## CREATE — Parameters

### Required

| Field | Type | Valid Values | Notes |
|-------|------|-------------|-------|
| `name` | string | `^[a-z0-9_]+$` | Max 512 chars. Lowercase, digits, underscores **only** |
| `language` | string | `en_US`, `ar`, `en`, ... | ISO 639 language code with optional locale |
| `category` | enum | `MARKETING` \| `UTILITY` \| `AUTHENTICATION` | Controls pricing and allowed content |

### Optional

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `components` | array | — | Header, body, footer, buttons |
| `parameter_format` | enum | `POSITIONAL` | `POSITIONAL` (`{{1}}`) or `NAMED` (`{{name}}`) |
| `allow_category_change` | boolean | `false` | Let Meta reassign category during review |
| `message_send_ttl_seconds` | integer | — | Authentication templates only |
| `sub_category` | string | — | Utility template sub-categories |
| `cta_url_link_tracking_opted_out` | boolean | `false` | Opt out of URL tracking |
| `library_template_name` | string | — | Clone from Meta's template library |

---

## CREATE — Validation Rules

| Rule | ❌ Gets REJECTED | ✅ Gets ACCEPTED |
|------|-----------------|-----------------|
| **Name format** | `Hello World`, `hello-world`, `hello#world` | `hello_world`, `order_update_2` |
| **Name length** | More than 512 characters | 512 characters or fewer |
| **Category value** | `TRANSACTIONAL`, `OTP` (old values) | `MARKETING`, `UTILITY`, `AUTHENTICATION` |
| **Duplicate body** | Same body+footer text as existing template in same WABA+language | Any unique body (AUTHENTICATION exempt) |
| **Variable format (positional)** | `{1}`, `%1`, `[[1]]`, `{{ 1 }}` | `{{1}}`, `{{2}}` |
| **Variable format (named)** | `{name}`, `%name%` | `{{customer_name}}` |
| **Variable characters** | `{{name#}}`, `{{price$}}`, `{{id%}}` | `{{name}}`, `{{order_id}}` |
| **Variable sequence** | `{{1}}`, `{{2}}`, `{{5}}` (gap) | `{{1}}`, `{{2}}`, `{{3}}` |
| **Dangling variables** | Starting/ending body with `{{1}}` only | Variable surrounded by text on both sides |
| **Variable density** | Too many `{{n}}` relative to actual text words | Reasonable ratio of text to variables |
| **Sample values** | Template with variables but no `example` field | `"example": { "body_text": [["John"]] }` |
| **Policy** | Requesting credit card numbers, national IDs, passwords | Functional business content |

---

## Components — Detail & Limits

### HEADER (optional)

| Format | Limit | Notes |
|--------|-------|-------|
| TEXT | Max 60 chars | Supports **1 variable** max. Requires sample. |
| IMAGE | — | Needs `header_handle` (upload first) |
| VIDEO | — | Needs `header_handle` |
| DOCUMENT | — | Needs `header_handle` |
| GIF | Max 3.5 MB | Actually MP4 format under the hood |
| LOCATION | — | UTILITY and MARKETING only |

### BODY (required)

| Property | Limit |
|----------|-------|
| Max characters | **1024** |
| Variables | Multiple allowed |
| Markdown | **Not** supported |
| Requires sample | Yes, when variables present |

### FOOTER (optional)

| Property | Value |
|----------|-------|
| Max characters | **60** |
| Variables | ❌ Not allowed |
| Format | Text only |

### BUTTONS (optional)

| Type | Max per template | Limit per button | Notes |
|------|-----------------|-----------------|-------|
| `QUICK_REPLY` | 10 | Text: 25 chars | Must be grouped (all first or all last) |
| `URL` | 2 | Text: 25 chars, URL: 2000 chars | 1 variable at URL end only |
| `PHONE_NUMBER` | 1 | Text: 25 chars, number: 20 chars | — |
| `COPY_CODE` | 1 | Code: 20 chars | — |

> **⚠️ Desktop visibility rule:** Templates with 4+ buttons, or Quick Reply buttons mixed with other types, are **hidden on WhatsApp Desktop**. Visible on mobile only.

> **UI rule:** When total buttons > 3, only the first 2 show — rest hidden under "See all options."

---

## EDIT — Rules

```
POST /{version}/{template-id}
```

### What CAN be changed

| Field | Condition |
|-------|-----------|
| `components` (body, header, buttons) | Always (re-triggers review) |
| `category` | Only if template is `REJECTED` or `PAUSED` |
| `message_send_ttl_seconds` | Any state |
| `allow_category_change` | Any state |

### What CANNOT be changed (Immutable)

| Field | Workaround |
|-------|-----------|
| `name` | Delete + create new |
| `language` | Delete + create new |

### Edit Rate Limits

| Template state | Edits allowed |
|---------------|--------------|
| `APPROVED` | Max **10 edits per 30 days**, or **1 edit per 24 hours** |
| `REJECTED` | Unlimited |
| `PAUSED` | Unlimited |

---

## DELETE — Rules

```
DELETE /{version}/{waba-id}/message_templates
```

| Param | Effect |
|-------|--------|
| `name` only | Deletes **all** languages of that template |
| `name` + `hsm_id` | Deletes **one specific** language |
| `hsm_ids` (array) | Deletes up to **100** templates at once — if any ID is invalid, **entire request fails** |

### Delete Restrictions

| Condition | Result |
|-----------|--------|
| Template is `DISABLED` | ❌ Cannot delete |
| Template was `APPROVED` | Name **blocked for 30 days** from reuse |
| Template in transit when deleted | Status becomes `PENDING_DELETION`, delivery retried for 30 days |
| Missing `whatsapp_business_management` permission | Error code `200` |

---

## Error Codes Reference

### Creation / Validation Errors

| Code | Subcode | Error | What triggered it | Fix |
|------|---------|-------|-------------------|-----|
| `100` | — | Invalid parameter | Name contains uppercase/special chars, invalid category | Use `^[a-z0-9_]+$` names |
| `100` | `2388024` | Duplicate name | Same name+language already exists in this WABA | Use a different name |
| `2388040` | — | Character limit exceeded | Body > 1024, header > 60, footer > 60 | Shorten field |
| `2388047` | — | Header format incorrect | Invalid header structure | Check header component format |
| `2388072` | — | Body format incorrect | Bad variable syntax or structure | Check `{{n}}` format |
| `2388073` | — | Footer format incorrect | Footer has variables | Remove variables from footer |
| `2388293` | — | Words/parameters ratio exceeded | Too many variables for text length | Add more text around variables |
| `2388299` | — | Dangling parameter | Template starts or ends with a variable | Wrap variable with text |
| `2388019` | — | Template limit exceeded | WABA has too many templates | Delete unused templates |

### Send-time Errors (when sending a template message)

| Code | Error | What triggered it | Fix |
|------|-------|-------------------|-----|
| `132000` | Parameter count mismatch | Request has different variable count than template | Match variables exactly |
| `132001` | Template not found or not approved | Wrong slug, wrong language, or still in review | Verify name/language/status |
| `132005` | Translated text too long | — | Shorten text |
| `132007` | Policy violation | Template content violates WhatsApp policy | Review template content |
| `132012` | Variable format incorrect | Malformed variable values in send request | Fix parameter format |
| `132015` | Template paused | Low quality score | Improve template relevance |
| `132016` | Template disabled | Paused too many times | Create a new template |
| `132018` | Template validation error | Variables in request don't match template | Check parameter structure |
| `134101` | Template still syncing | Just created/edited, not propagated yet | Wait up to 10 minutes |
| `134102` | Template unavailable (ad sync failed) | Ad link failed | Check Meta Ad account link |
| `131049` | Message blocked (per-user limit) | User reached marketing template limit | Normal — user-enforced limit |
| `131050` | User opted out | User unsubscribed from marketing | Respect opt-out |
| `131063` | Marketing templates disabled | WABA disabled marketing | Contact Meta support |
| `131064` | Account messaging limit | Template classification violations | Review template categories |

---

## Code Examples

### ✅ Valid: Create a UTILITY template

```json
POST /v21.0/{WABA_ID}/message_templates

{
  "name": "order_shipped",
  "language": "en_US",
  "category": "UTILITY",
  "components": [
    {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Order Update",
      "example": { "header_text": ["Order Update"] }
    },
    {
      "type": "BODY",
      "text": "Hi {{1}}, your order {{2}} has shipped and will arrive by {{3}}.",
      "example": {
        "body_text": [["Sarah", "#ORD-1234", "Friday"]]
      }
    },
    {
      "type": "FOOTER",
      "text": "Reply STOP to unsubscribe"
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {
          "type": "URL",
          "text": "Track Order",
          "url": "https://example.com/track/{{1}}",
          "example": ["ABC123"]
        }
      ]
    }
  ]
}
```

### ❌ Rejected: Name with uppercase letters

```json
{
  "name": "Order_Shipped",  ← ERROR: uppercase 'O' and 'S'
  "language": "en_US",
  "category": "UTILITY"
}
// Error 100: Parameter name must match ^[a-z0-9_]+$
```

### ❌ Rejected: Body starts with a variable (dangling)

```json
{
  "type": "BODY",
  "text": "{{1}} has placed an order."  ← ERROR: starts with variable
}
// Error 2388299: Leading or trailing parameters not allowed
```

### ❌ Rejected: Footer has a variable

```json
{
  "type": "FOOTER",
  "text": "Order ID: {{1}}"  ← ERROR: variables not allowed in footer
}
// Error 2388073: Message footer format is incorrect
```

### ✅ Valid: Edit a rejected template (change body)

```json
POST /v21.0/{TEMPLATE_ID}

{
  "components": [
    {
      "type": "BODY",
      "text": "Hi {{1}}, your updated order is confirmed.",
      "example": {
        "body_text": [["Sarah"]]
      }
    }
  ]
}
```

### ❌ Rejected: Trying to change template name (immutable)

```json
POST /v21.0/{TEMPLATE_ID}

{
  "name": "new_name"  ← ERROR: name is immutable
}
// Field is silently ignored or returns error — name cannot change
```

---

## SEEN V2 — Notes

| Feature | How SEEN V2 Uses It |
|---------|---------------------|
| WhatsApp Templates | Core of Broadcasts module — all bulk sends |
| Category | `MARKETING` for campaigns, `UTILITY` for transactional |
| Webhooks | `message_template_status_update` → watch for `APPROVED`/`REJECTED` |
| Rate limits | Apply per WABA — shared across all SEEN V2 clients on same WABA |
| Opt-out | `131050` must be handled gracefully in Broadcasts |

> **QA Note:** When testing template creation, always include sample values (`example`) for any template with variables, or the API will reject with a validation error.

---

## GET — List Templates

```http
GET /v23.0/{waba-id}/message_templates
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `fields` | string | Comma-separated fields: `name,category,status,language,components` |
| `status` | enum | Filter by: `APPROVED`, `PENDING`, `REJECTED`, `PAUSED`, `DISABLED` |
| `limit` | integer | Max results per page (default: 100) |
| `after` | cursor | Pagination cursor for next page |

### Filter by Status — Example

```bash
# Get only APPROVED templates
GET /v23.0/{waba-id}/message_templates?fields=name,category,status&status=APPROVED
```

```json
{
  "data": [
    { "name": "order_confirmation",  "category": "UTILITY",    "status": "APPROVED", "id": "1387372356726668" },
    { "name": "summer_campaign",     "category": "MARKETING",  "status": "APPROVED", "id": "1304694804498707" }
  ],
  "paging": {
    "cursors": { "before": "QVFIU...", "after": "QVFIU..." },
    "next": "https://graph.facebook.com/v23.0/..."
  }
}
```

### Template Statuses

| Status | Meaning |
|--------|---------|
| `APPROVED` | Ready to use — can be sent to customers |
| `PENDING` | Under review by Meta (usually within minutes) |
| `REJECTED` | Failed review — see rejection reason |
| `PAUSED` | Auto-paused due to low quality rating |
| `DISABLED` | Permanently disabled after repeated low quality |
| `PENDING_DELETION` | Delete requested; delivery attempted for 30 days |
| `LIMIT_EXCEEDED` | WABA hit the 250-template limit |

---

## EDIT — Limitations

> **Source:** [Meta Docs — Edit Templates](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-management/#limitations)

| Limitation | Details |
|-----------|---------|
| **Allowed statuses** | Only `APPROVED`, `REJECTED`, or `PAUSED` templates can be edited |
| **Editable fields** | Only: `category`, `components`, `message_send_ttl_seconds` |
| **Cannot isolate components** | All components are replaced together — you must send ALL components in the edit request |
| **Category of approved** | Cannot change category of an `APPROVED` template |
| **Rate limit (approved)** | Max **10 edits in 30 days** OR **1 edit in 24 hours** |
| **Rate limit (rejected/paused)** | Unlimited edits |
| **After editing** | Template goes back to review automatically; approved unless it fails review |
| **Name is immutable** | Template name cannot be changed — any `name` field in edit request is ignored |

### ✅ Editable Example — Edit components

```bash
POST /v23.0/{template-id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "components": [
    {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Our {{1}} is on!",
      "example": { "header_text": ["Spring Sale"] }
    },
    {
      "type": "BODY",
      "text": "Shop now through {{1}} and use code {{2}} to get {{3}} off.",
      "example": { "body_text": [["the end of April", "25OFF", "25%"]] }
    }
  ]
}
```

### ✅ Edit Category Only

```bash
POST /v23.0/{template-id}

{ "category": "MARKETING" }
```

Response:
```json
{ "success": true }
```

---

## DELETE — Limitations & Methods

> **Source:** [Meta Docs — Delete Templates](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-management/#delete-templates)

| Limitation | Details |
|-----------|---------|
| **Sent but not delivered** | Status becomes `PENDING_DELETION` — delivery retried for 30 days |
| **30-day ban** | After deleting an `APPROVED` template, cannot create a new template with the **same name for 30 days** |
| **Cannot delete disabled** | Templates with `DISABLED` status cannot be deleted |
| **Permission required** | `whatsapp_business_management` permission on the access token |

### Method 1 — Delete by Name (all languages)

```bash
DELETE /v23.0/{waba-id}/message_templates?name=order_confirmation
Authorization: Bearer {token}
```

⚠️ Deletes **all language versions** of this template name.

### Method 2 — Delete by ID (specific language only)

```bash
DELETE /v23.0/{waba-id}/message_templates?hsm_id=1407680676729941&name=order_confirmation
Authorization: Bearer {token}
```

### Method 3 — Delete multiple by IDs (max 100 per request)

```bash
DELETE /v23.0/{waba-id}/message_templates?hsm_ids=[1387372356726668,1304694804498707]
Authorization: Bearer {token}
```

Response for all delete methods:
```json
{ "success": true }
```

---

## Template Pausing & Quality

Templates are automatically paused when they reach **low quality** (`quality_score: RED`).

### Pause Duration Schedule

| Instance | Pause Duration |
|----------|---------------|
| 1st time | 3 hours |
| 2nd time | 6 hours |
| 3rd time | **Permanently disabled** |

### Pause Notifications

You are notified via:
- WhatsApp Manager notifications
- Email
- `message_template_status_update` webhook

### Webhook Payload (status change)

```json
{
  "entry": [{
    "changes": [{
      "field": "message_template_status_update",
      "value": {
        "message_template_id": 1234567890,
        "message_template_name": "your_template",
        "message_template_language": "en_US",
        "event": "PAUSED",
        "reason": "LOW_QUALITY"
      }
    }]
  }]
}
```

### Unpausing

| Method | How |
|--------|-----|
| **Auto** | Template unpauses automatically after the pause duration |
| **Manual (API)** | `POST /{template-id}/unpause` |
| **Manual (UI)** | Click "manually unpause it" in WhatsApp Manager |

> After auto-unpause, quality rating is **reset** based on the most recent customer feedback.

### Filing an Appeal (rejected/disabled template)

1. Go to **WhatsApp Manager → Account Tools → Message Templates**
2. Select the template → Edit → click **Add Sample**
3. Fill in realistic sample variable values
4. Submit for review — decisions usually within **24 hours**

---

## Template Error Codes

### Creation Errors

| Error Code | Subcode | Message | Fix |
|-----------|---------|---------|-----|
| `100` | — | Invalid name format | Use only lowercase letters, digits, underscores |
| `100` | `2388024` | Content in This Language Already Exists | Template with same name+language already exists in WABA |
| `132018` | — | Parameter format mismatch at send time | Mismatch between template parameters and send-time values (v23.0+) |
| `2388040` | — | Character limit exceeded | Reduce content in the flagged field |
| `2388047` | — | Message header format incorrect | Fix header formatting |
| `2388072` | — | Message body format incorrect | Fix body formatting |
| `2388073` | — | Message footer format incorrect | Fix footer formatting |
| `2388293` | — | Parameters/words ratio exceeds limit | Too many variables for text length — reduce variables or increase text |
| `2388299` | — | Leading/trailing parameters not allowed | Don't start or end template text with a variable `{{1}}` |

### Send-Time Errors

| Error Code | Subcode | Message | Fix |
|-----------|---------|---------|-----|
| `2388019` | — | Message Template Limit Exceeded | WABA hit 250-template limit — delete unused templates |
| `131050` | — | Message failed to send (user opted out) | Respect opt-out; don't retry to this recipient |

### Analytics Errors

| Error Code | Message | Fix |
|-----------|---------|-----|
| `200005` | Template insights unavailable | Feature not yet enabled on WABA |
| `200006` | Cannot disable template insights | Analytics cannot be disabled once enabled |
| `200007` | Template insights not enabled | Enable via WABA settings first |

---

## Template Analytics

Analytics show metrics like: **sent**, **delivered**, **read**, and **button click** counts per template.

### Enable Analytics

```bash
POST /{waba-id}?is_enabled_for_insights=true
Authorization: Bearer {token}
```

### Get Analytics

```bash
GET /v23.0/{waba-id}/template_analytics
  ?start=1718064000
  &end=1718150400
  &granularity=DAILY
  &template_ids=[1421988012088524,2632273056924580]
  &metric_types=SENT,DELIVERED,READ,CLICKED,COST
```

### Analytics Parameters

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `start` | ✅ | UNIX timestamp | Start of date range |
| `end` | ✅ | UNIX timestamp | End of date range |
| `granularity` | ✅ | enum | Must be `DAILY` |
| `template_ids` | ✅ | array | Array of template IDs — **max 10** |
| `metric_types` | ❌ | array | `SENT`, `DELIVERED`, `READ`, `CLICKED`, `COST` |

### Analytics Response Example

```json
{
  "data": [{
    "granularity": "DAILY",
    "product_type": "cloud_api",
    "data_points": [{
      "template_id": "2632273056924580",
      "start": 1718064000,
      "end": 1718150400,
      "sent": 1500,
      "delivered": 1480,
      "read": 1200,
      "clicked": [
        { "type": "quick_reply_button", "button_content": "Order Now", "count": 540 },
        { "type": "url_button",         "button_content": "See Deals",  "count": 210 }
      ],
      "cost": [
        { "type": "amount_spent", "value": 45.30 }
      ]
    }]
  }]
}
```

### Analytics Limitations

| Limitation | Details |
|-----------|---------|
| **Data retention** | Read and click data only available for **7 days** from send; after that, counters reset to 0 |
| **Button clicks** | Only available for `MARKETING` and `UTILITY` templates |
| **Excluded regions** | WABAs in EU, Japan, or with phone numbers from these regions are **not supported** |
| **Max templates per request** | 10 template IDs per analytics call |

### Opt Out of Click Tracking (per template)

```bash
POST /{template-id}?cta_url_link_tracking_opted_out=true&category=MARKETING
```

---

## Archive & Auto-Delete

Templates inactive for **12+ months** are automatically archived and **scheduled for deletion after 28 days**.

- You can manually archive or unarchive templates in bulk via API
- Archived templates count toward the 250-template limit until deleted

---

## Template Limits Summary

| Limit | Value |
|-------|-------|
| Max templates per WABA | **250** (default) |
| Max template name length | **512 characters** |
| Max body text length | **1024 characters** |
| Max header text length | **60 characters** |
| Max footer text length | **60 characters** |
| Max buttons | **10** (3 quick reply + up to 10 call-to-action) |
| Max quick reply buttons | **3** |
| Max CTA buttons | **2** (1 phone + 1 URL) |
| Edit rate (approved templates) | **10 edits / 30 days** OR **1 edit / 24 hours** |
| Analytics template IDs per call | **10** |
| Click data retention | **7 days** |
| Post-deletion name ban | **30 days** |
