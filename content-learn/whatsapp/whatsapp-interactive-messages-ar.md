---
slug: whatsapp-interactive-messages
title: رسائل واتساب التفاعلية (الأزرار والقوائم)
platform: WhatsApp
category: Core API
priority: high
source_url: https://developers.facebook.com/docs/whatsapp/cloud-api/messages/interactive-messages
last_verified: 2026-06-24
---

# رسائل واتساب التفاعلية

تحل الرسائل التفاعلية محل آليات العمل التقليدية القائمة على النصوص مثل "رد بـ 1 لنعم" بعناصر واجهة مستخدم أصلية. فهي تقلل من الاحتكاك، وتزيل أخطاء الكتابة، وتحسن معدلات التحويل. بالنسبة لـ SEEN V2، تعتبر الرسائل التفاعلية جوهرية لوحدات منشئ التدفق (Flow Builder) والبوت (Bot).

## أنواع الرسائل التفاعلية

1. **أزرار الرد (Reply Buttons):** ما يصل إلى 3 أزرار للرد السريع (مثل: "نعم"، "لا"، "التحدث إلى المبيعات").
2. **رسائل القوائم (List Messages):** قائمة تحتوي على ما يصل إلى 10 صفوف (مثل: فئات المنتجات، مواقع المتاجر).

## المعلمات والحقول

### أزرار الرد

| الحقل | النوع | مطلوب | الوصف |
|-------|------|----------|-------------|
| `type` | string | نعم | يُعين إلى `"button"` |
| `body.text` | string | نعم | نص الرسالة الرئيسي (الحد الأقصى 1024 حرفاً) |
| `action.buttons` | array | نعم | مصفوفة تحتوي على ما يصل إلى 3 كائنات أزرار |
| `button.type` | string | نعم | يجب أن يكون `"reply"` |
| `button.reply.id` | string | نعم | حمولة (Payload) فريدة تُرسل إلى الـ webhook (الحد الأقصى 256 حرفاً) |
| `button.reply.title`| string | نعم | نص الزر المعروض للمستخدم (الحد الأقصى 20 حرفاً) |

### رسائل القوائم

| الحقل | النوع | مطلوب | الوصف |
|-------|------|----------|-------------|
| `type` | string | نعم | يُعين إلى `"list"` |
| `body.text` | string | نعم | نص الرسالة الرئيسي (الحد الأقصى 1024 حرفاً) |
| `action.button` | string | نعم | النص الموجود على الزر الذي يفتح القائمة (الحد الأقصى 20 حرفاً) |
| `action.sections` | array | نعم | بحد أقصى 10 أقسام |
| `row.id` | string | نعم | الحمولة (Payload) المعادة عبر الـ webhook عند الاختيار |
| `row.title` | string | نعم | عنوان الصف (الحد الأقصى 24 حرفاً) |
| `row.description`| string | لا | نص فرعي للصف (الحد الأقصى 72 حرفاً) |

## قواعد التحقق

| القاعدة | ❌ تُرفض | ✅ تُقبل |
|------|-----------------|-----------------|
| عدد الأزرار | 4 أزرار أو أكثر | من 1 إلى 3 أزرار كحد أقصى |
| طول عنوان الزر | `"Talk to a human representative now"` (34 حرفاً) | `"Talk to Sales"` (كحد أقصى 20 حرفاً) |
| عدد صفوف القائمة | إجمالي 11 صفاً عبر الأقسام | إجمالي 10 صفوف كحد أقصى |
| طول عنوان الصف | `"Schedule Appointment for Tomorrow"` (33 حرفاً) | `"Book Tomorrow"` (كحد أقصى 24 حرفاً) |
| معرّفات الأزرار (Button IDs) | معرّفات مكررة في نفس الرسالة | معرّفات فريدة لكل زر/صف |

## معاينة حية — كيف تبدو

<!-- preview:accepted -->
### ✅ الاستخدام الصحيح — أزرار الرد

```json
POST /v19.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {ACCESS_TOKEN}

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "{{CUSTOMER_PHONE}}",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "header": {
      "type": "text",
      "text": "Payment Confirmation"
    },
    "body": {
      "text": "Your order #12345 has been processed. Would you like a receipt?"
    },
    "footer": {
      "text": "SEEN V2 Bot"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "receipt_yes",
            "title": "Yes, please"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "receipt_no",
            "title": "No, thanks"
          }
        }
      ]
    }
  }
}
```

**لماذا تنجح:** عدد الأزرار 2 بالضبط، وعناوين الأزرار أقل من 20 حرفاً، والمعرّفات (IDs) فريدة.

<!-- preview:rejected -->
### ❌ خطأ شائع — أزرار كثيرة جداً

```json
{
  "action": {
    "buttons": [
      { "type": "reply", "reply": { "id": "1", "title": "Option 1" } },
      { "type": "reply", "reply": { "id": "2", "title": "Option 2" } },
      { "type": "reply", "reply": { "id": "3", "title": "Option 3" } },
      { "type": "reply", "reply": { "id": "4", "title": "Option 4" } }
    ]
  }
}
```

**الخطأ:** `Error 100: Invalid parameter` — يُسمح بحد أقصى 3 أزرار. لـ 4 خيارات أو أكثر، استخدم رسالة القائمة `list` بدلاً من ذلك.

## الـ Webhooks (استلام الرد)

عندما ينقر المستخدم على زر أو يحدد صفاً في قائمة، ترسل Meta حدث webhook إلى SEEN V2.

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "1234567890",
          "type": "interactive",
          "interactive": {
            "type": "button_reply",
            "button_reply": {
              "id": "receipt_yes",
              "title": "Yes, please"
            }
          }
        }]
      }
    }]
  }]
}
```

**ملاحظة هامة لتنفيذ SEEN V2:** يجب أن يعتمد منشئ البوت (Bot builder) على مطابقة `interactive.button_reply.id` (وليس العنوان) في منطق التوجيه (routing logic)، حيث أن المعرّف (ID) غير قابل للتغيير بينما قد يتغير العنوان بناءً على الترجمة واللغة.

## قائمة التحقق لضمان الجودة (QA Checklist)

- [ ] التحقق من أن عناوين الأزرار لا تتجاوز 20 حرفاً
- [ ] التحقق من وجود 3 أزرار كحد أقصى لكل رسالة
- [ ] التحقق من أن صفوف القائمة لا تتجاوز 10 صفوف إجمالاً في جميع الأقسام
- [ ] التحقق من أن عناوين الصفوف لا تتجاوز 24 حرفاً
- [ ] التأكد من أن `action.button` (للقوائم) يقل عن 20 حرفاً
- [ ] تعيين `interactive.*.id` الخاص بالـ webhook بدقة إلى مشغلات منشئ التدفق (Flow Builder triggers) في SEEN V2\n\n
<!-- panel:comparison -->
**أزرار الرد مقابل رسائل القوائم**
- **أزرار الرد (Reply Buttons):** بحد أقصى 3 أزرار. سريعة، وواضحة جداً وتتطلب ضغطة واحدة.
- **رسائل القوائم (List Messages):** بحد أقصى 10 صفوف. تفتح نافذة سفلية. مثالية لقوائم الطعام أو فروع المتاجر.
<!-- endpanel -->
\n
<!-- panel:quiz -->
ماذا يحدث إذا حاولت إرسال رسالة تفاعلية تحتوي على 4 أزرار رد (Reply Buttons)؟
- [ ] يقوم واتساب بتحويلها تلقائياً إلى قائمة (List).
- [x] يفشل طلب الـ API بخطأ في التحقق (Validation Error).
- [ ] تظهر الأزرار الثلاثة الأولى فقط.
- [ ] يتم الإرسال بنجاح.
<!-- endpanel -->
\n