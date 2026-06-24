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
