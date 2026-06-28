---
title: "Sticker API لمنصة Messenger"
date: "2026-06-28"
category: "messenger"
description: "كيفية تصفح الملصقات (Stickers) والبحث فيها وإرسالها برمجياً عبر Messenger Sticker API، مع دليل الانتقال للـ Webhook (الموعد النهائي: 30 أغسطس 2026)."
tags: ["messenger", "sticker-api", "webhooks", "send-api", "new-feature"]
badge: "NEW"
---

# Sticker API لمنصة Messenger 🆕

أطلقت Meta في **1 يونيو 2026** واجهة برمجة تطبيقات **Sticker API** لمنصة Messenger. تتيح هذه الواجهة للشركات تصفح حزم الملصقات الأولى من Meta والبحث فيها وإرسالها برمجياً عبر Messenger API.

> ⚠️ **إجراء مطلوب:** تتضمن Webhooks الآن نوع مرفق جديد `type: "sticker"`. تنتهي فترة الانتقال البالغة 90 يوماً في **30 أغسطس 2026** — بعدها، سيُرسَل نوع `sticker` فقط. حدّث معالجات Webhook قبل الموعد النهائي.

## نقاط النهاية الجديدة (Endpoints)

| نقطة النهاية | الوظيفة |
|---|---|
| `GET /sticker_packs` | عرض جميع حزم الملصقات المتاحة |
| `GET /sticker_packs/<ID>/stickers` | عرض الملصقات داخل حزمة محددة |
| `GET /sticker_search?q=<QUERY>` | البحث في الملصقات بالكلمات المفتاحية |

**البحث متعدد اللغات:** استخدم معامل `locale` — مثلاً `locale=ar_AR` للعربية، أو `locale=ko_KR` للكورية. الافتراضي هو `en_US`.

## الصلاحيات المطلوبة (Permissions)

| الإجراء | المطلوب |
|---|---|
| تصفح الملصقات والبحث فيها | App access token (بدون صلاحيات إضافية) |
| إرسال الملصقات | صلاحية `pages_messaging` |

## إرسال ملصق

استخدم Send Messages API مع حقل `sticker_id`:

<!-- preview -->
```json
{
  "recipient": { "id": "<PSID>" },
  "message": { "sticker_id": 767226160478561 }
}
```

<!-- preview -->
✅ احصل على `sticker_id` من `GET /sticker_packs/<ID>/stickers` أولاً، ثم أرسله عبر Send API.

## انتقال الـ Webhook — الموعد النهائي 30 أغسطس 2026

<!-- panel:comparison -->
**قبل 30 أغسطس 2026 (فترة الانتقال)**
يحتوي الـ payload على نوعَي المرفق معاً:
- `type: "image"` (الموجود حالياً)
- `type: "sticker"` (الجديد — يتضمن بيانات `sticker_id`)

**بعد 30 أغسطس 2026**
سيُرسَل `type: "sticker"` فقط. يُزال نوع `image` للملصقات نهائياً.
<!-- endpanel -->

> ينطبق هذا التغيير أيضاً على message echoes وردود Conversations API.

<!-- panel:quiz -->
بعد 30 أغسطس 2026، ما نوع المرفق الذي ستستخدمه رسائل الملصقات في Messenger Webhooks؟
- [ ] `type: "image"` فقط
- [ ] كلاهما `type: "image"` و `type: "sticker"`
- [x] `type: "sticker"` فقط
- [ ] `type: "media"`
<!-- endpanel -->
