---
date: 2026-06-24
slug: whatsapp-media-messages
title: WhatsApp Media Messages (Images, Video, Docs)
platform: WhatsApp
category: Core API
priority: high
source_url: https://developers.facebook.com/docs/whatsapp/cloud-api/messages/media-messages
last_verified: 2026-06-24
---

# WhatsApp Media Messages

Sending media is essential for rich communication in SEEN V2. Media can be sent either by providing a public URL or by uploading the media to Meta's servers first and passing the `media_id`.

## Media Types & Limits

Meta imposes strict limits on file sizes and supported formats. Sending unsupported formats or oversized files will result in immediate rejection.

| Media Type | Max Size | Supported Formats |
|------------|----------|-------------------|
| **Audio**  | 16 MB    | `audio/aac`, `audio/mp4`, `audio/mpeg`, `audio/amr`, `audio/ogg` (Opus only) |
| **Document**| 100 MB  | Any valid MIME type (e.g., `text/plain`, `application/pdf`, `application/vnd.ms-excel`) |
| **Image**  | 5 MB     | `image/jpeg`, `image/png` |
| **Video**  | 16 MB    | `video/mp4`, `video/3gp` (H.264 video codec and AAC audio codec only) |
| **Sticker**| 100 KB   | `image/webp` (Exact dimensions: 512x512) |

## Parameters & Fields

When sending media via URL:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | `image`, `video`, `audio`, `document`, or `sticker` |
| `[type].link` | string | Yes | HTTP/HTTPS URL of the media file |
| `[type].caption` | string | No | Caption text (max 1024 chars, supported for image/video/document) |
| `[type].filename`| string | No | Custom filename (only for document type) |

When sending media via ID:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `[type].id` | string | Yes | ID returned by the Media Upload API |

## Validation Rules

| Rule | ❌ Gets REJECTED | ✅ Gets ACCEPTED |
|------|-----------------|-----------------|
| Image format | `.gif` or `.bmp` | `.jpg`, `.jpeg`, `.png` |
| Image size | 6 MB image | 4.9 MB image |
| Video format | `.mkv` or `.avi` | `.mp4` (H.264 codec) |
| Sticker dimensions | 500x500 | exactly 512x512 |
| Link URL | Requires auth or redirects | Direct link returning valid Content-Type |

## Live Preview — What It Looks Like

<!-- preview:accepted -->
### ✅ Correct Usage — Sending Image via URL

```json
POST /v19.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {ACCESS_TOKEN}

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "{{CUSTOMER_PHONE}}",
  "type": "image",
  "image": {
    "link": "https://seen-v2.example.com/assets/promo.jpg",
    "caption": "Check out our latest summer collection! ☀️"
  }
}
```

**Why it works:** URL is a direct link to a `.jpg`, and caption is under 1024 characters.

<!-- preview:rejected -->
### ❌ Common Mistake — Wrong Media Type Key

```json
{
  "type": "image",
  "media": {
    "link": "https://example.com/image.png"
  }
}
```

**Error:** `Error 100: Invalid parameter` — The key inside the JSON must match the `type`. If `type` is `"image"`, the object must be `"image": {...}`, not `"media": {...}`.

<!-- preview:rejected -->
### ❌ Common Mistake — Exceeding Size Limit

```json
{
  "type": "video",
  "video": {
    "link": "https://example.com/huge-presentation.mp4"
  }
}
```

**Error:** If the file at the link exceeds 16MB, Meta will try to download it, fail the size validation, and send an error webhook asynchronously indicating the download failed due to size limits.

## The Media Upload API (Alternative to URLs)

If you don't want to expose media via public URLs, upload it to Meta first.

1. **Upload:**
```bash
curl -X POST "https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/media" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -F "file=@/path/to/local/file.pdf" \
  -F "type=application/pdf" \
  -F "messaging_product=whatsapp"
```
*Returns:* `{"id":"1234567890"}`

2. **Send:**
```json
{
  "type": "document",
  "document": {
    "id": "1234567890",
    "filename": "SEEN_Invoice.pdf"
  }
}
```

## SEEN V2 Implementation Notes

- **URL vs ID:** Always prefer `link` for static assets (logos, marketing banners) and `id` for dynamic/sensitive assets (invoices, reports) that shouldn't be publicly accessible on your CDN.
- **GIF Support:** WhatsApp does not natively support GIF media types for business API. You must convert GIFs to `.mp4` and send them as `video`.

## QA Checklist

- [ ] Ensure user uploads in SEEN V2 are validated against Meta's strict MB limits *before* API dispatch
- [ ] Implement auto-conversion for common incompatible types (e.g. converting `.gif` to `.mp4`)
- [ ] Verify that document filenames include the correct extension for WhatsApp to render the appropriate icon\n\n
<!-- panel:comparison -->
**Media ID vs Media Link**
- **Media ID:** You upload the media to Meta\'s servers first, get an ID, and send using the ID. Faster delivery.
- **Media Link (URL):** You provide a public URL. Meta downloads it on the fly. Slower, and fails if your server blocks Meta.
<!-- endpanel -->
\n
<!-- panel:quiz -->
What is the maximum file size for a Video sent via WhatsApp Cloud API?
- [ ] 5 MB
- [x] 16 MB
- [ ] 100 MB
- [ ] 2 GB
<!-- endpanel -->
\n