---
title: خطافات الويب (Webhooks) الخاصة بـ WhatsApp
slug: whatsapp-webhooks
platform: WhatsApp
category: Webhooks
priority: high
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks
last_verified: 2026-06-24
---

# خطافات الويب (Webhooks) الخاصة بـ WhatsApp

خطافات الويب (Webhooks) هي استدعاءات HTTP (HTTP callbacks) ترسلها Meta إلى خادمك عند وقوع أحداث معينة — مثل استلام رسالة، أو تغير حالة قالب، أو تغير رقم هاتف المستخدم، وما إلى ذلك. يجب عليك التحقق من نقطة النهاية الخاصة بك (endpoint) والتعامل مع كل نوع حدث بشكل صحيح.

## متطلبات الإعداد

| المتطلب | القيمة |
|------------|-------|
| رابط الاستدعاء (Callback URL) | HTTPS فقط (لا يُسمح بـ HTTP) |
| رمز التحقق (Verification token) | أي سلسلة نصية ثابتة تقوم بتحديدها |
| وقت الاستجابة | يجب الرد بـ `200 OK` في غضون **5 ثوانٍ** |
| ترويسة التوقيع (Signature header) | `X-Hub-Signature-256` — خوارزمية HMAC-SHA256 للحمولة (payload) |
| سياسة إعادة المحاولة | تعيد Meta محاولة عمليات التسليم الفاشلة لمدة تصل إلى **30 يومًا** |

---

## مسار التحقق (إعداد لمرة واحدة)

عندما تقوم بحفظ رابط خطاف الويب في لوحة تحكم التطبيق الخاص بك، ترسل Meta طلب `GET`:

```http
GET https://your-server.com/webhook
  ?hub.mode=subscribe
  &hub.verify_token=YOUR_TOKEN
  &hub.challenge=CHALLENGE_STRING
```

### ✅ الاستجابة الصحيحة

```http
HTTP 200
Body: CHALLENGE_STRING
```

### ❌ الاستجابات الخاطئة

| الاستجابة | النتيجة |
|---------|--------|
| إرجاع أي شيء بخلاف التحدي (challenge) | فشل التحقق |
| إرجاع `200` مع محتوى غير صحيح | فشل التحقق |
| إرجاع `4xx` أو `5xx` | فشل التحقق |
| استغراق أكثر من 5 ثوانٍ | انتهاء المهلة (Timeout) — فشل التحقق |

---

## التحقق من التوقيع

كل طلب POST لخطاف الويب يتضمن الترويسة `X-Hub-Signature-256`. **يجب** عليك التحقق منها لتأكيد أن الحمولة واردة من Meta:

```javascript
// ✅ Correct signature validation
const crypto = require('crypto');

function verifySignature(payload, signature, appSecret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(payload)   // raw Buffer — NOT parsed JSON
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

> **⚠️ تحذير:** استخدم محتوى الطلب الخام (raw request body) لحساب HMAC — وليس `JSON.stringify(req.body)`. قد تقوم أدوات تحليل المحتوى (body parsers) بإعادة تنسيق JSON.

---

## حقول خطاف الويب — الاشتراك

اشترك في الحقول من خلال لوحة تحكم التطبيق الخاص بك أو عبر واجهة برمجة التطبيقات (API):

```json
POST /v21.0/{phone-number-id}/subscribed_apps
{
  "subscribed_fields": [
    "messages",
    "message_template_status_update",
    "phone_number_name_update",
    "account_update"
  ]
}
```

---

## أنواع أحداث خطاف الويب

### `messages` — الرسائل الواردة

يتم تشغيله عندما يرسل مستخدم رسالة إلى نشاطك التجاري.

**هيكل الحمولة:**

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WABA_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15550123456",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "contacts": [{ "profile": { "name": "Alice" }, "wa_id": "15551234567" }],
        "messages": [{
          "from": "15551234567",
          "id": "wamid.xxx",
          "timestamp": "1700000000",
          "type": "text",
          "text": { "body": "Hello!" }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

### أنواع الرسائل في خطاف الويب

| النوع | الوصف | الحقول الأساسية |
|------|-------------|-----------|
| `text` | رسالة نصية عادية | `text.body` |
| `image` | صورة (JPEG/PNG) | `image.id`, `image.mime_type`, `image.url` |
| `video` | فيديو (MP4) | `video.id`, `video.url` |
| `audio` | رسالة صوتية/صوت | `audio.id`, `audio.voice` (bool) |
| `document` | ملف مرفق | `document.id`, `document.filename` |
| `sticker` | ملصق WhatsApp | `sticker.id`, `sticker.animated` |
| `location` | إحداثيات GPS | `location.latitude`, `location.longitude` |
| `contacts` | جهة اتصال vCard | `contacts[].name`, `contacts[].phones` |
| `button` | تم النقر على رد سريع | `button.text`, `button.payload` |
| `interactive` | رد قائمة/زر | `interactive.type`, `interactive.list_reply` |
| `reaction` | تفاعل برمز تعبيري (Emoji) | `reaction.message_id`, `reaction.emoji` |
| `order` | طلب منتج | `order.catalog_id`, `order.product_items` |
| `referral` | إعلان النقر للمراسلة على WhatsApp | `referral.source_type`, `referral.source_id` |
| `unsupported` | نوع غير مدعوم | `errors[].code` |
| `system` | حدث نظام (تغيير الرقم) | `system.type`, `system.identity` |

---

### `statuses` — تحديثات حالة الرسائل

يتم تشغيله عندما تتغير حالة رسالة قمت بإرسالها.

```json
{
  "statuses": [{
    "id": "wamid.xxx",
    "status": "delivered",
    "timestamp": "1700000001",
    "recipient_id": "15551234567",
    "conversation": {
      "id": "CONV_ID",
      "origin": { "type": "utility" }
    },
    "pricing": {
      "billable": true,
      "pricing_model": "CBP",
      "category": "utility"
    }
  }]
}
```

### مسار الحالة

```
sent → delivered → read
           ↓
         failed (if undeliverable)
```

| الحالة | المعنى |
|--------|---------|
| `sent` | تم إرسال الرسالة من خوادم Meta |
| `delivered` | تم الاستلام على جهاز المستخدم |
| `read` | قام المستخدم بفتح الرسالة |
| `failed` | فشل التسليم — تحقق من `errors[]` |
| `deleted` | قام المستخدم بحذف الرسالة |
| `played` | تم تشغيل الرسالة الصوتية |

---

### `message_template_status_update`

يتم تشغيله عندما تتغير حالة مراجعة قالب.

```json
{
  "value": {
    "event": "APPROVED",
    "message_template_id": 123456,
    "message_template_name": "hello_world",
    "message_template_language": "en_US",
    "reason": null
  }
}
```

| الحدث | المعنى |
|-------|---------|
| `APPROVED` | القالب جاهز للاستخدام |
| `REJECTED` | فشل القالب في مراجعة Meta — حقل `reason` يوضح السبب |
| `FLAGGED` | مخاوف تتعلق بالجودة — قد يتم إيقافه مؤقتًا قريبًا |
| `PAUSED` | تم إيقاف القالب مؤقتًا بسبب انخفاض الجودة |
| `DISABLED` | تم تعطيل القالب بشكل دائم |
| `REINSTATED` | تمت إعادة الموافقة على القالب بعد تقديم التماس (appeal) |

---

### `account_update`

يتم تشغيله عند حدوث تغييرات على مستوى حساب واتساب للأعمال (WABA).

```json
{
  "value": {
    "phone_number": "15550000000",
    "event": "ACCOUNT_UPDATE",
    "banner_type": "BUSINESS_INITIATED_DISABLED"
  }
}
```

| الحدث | المعنى |
|-------|---------|
| `PHONE_NUMBER_NAME_UPDATE` | تمت الموافقة على/رفض اسم العرض |
| `PHONE_NUMBER_QUALITY_UPDATE` | تغيير في درجة الجودة |
| `PHONE_NUMBER_BANNED` | تم حظر الرقم |
| `ACCOUNT_VIOLATION` | تم الإبلاغ عن انتهاك للسياسة |
| `PARTNER_REMOVED` | تم فصل النشاط التجاري عن مزود حلول الأعمال (BSP) |

---

## قواعد التحقق

| القاعدة | ❌ مرفوض | ✅ مقبول |
|------|------------|------------|
| **وقت الاستجابة (Response time)** | > 5 ثوانٍ | < 5 ثوانٍ |
| **رمز الاستجابة (Response code)** | `4xx`، `5xx`، أو انتهاء المهلة | `200` |
| **التحقق من التوقيع (Signature check)** | خاطئ أو مفقود | `X-Hub-Signature-256` صالح |
| **رابط الاستدعاء (Callback URL)** | `http://` | `https://` |
| **إزالة التكرار (Deduplication)** | معالجة نفس المعرف `id` مرتين (يسبب أخطاء) | التحقق من `message.id` قبل المعالجة |
| **الترتيب (Ordering)** | افتراض وصول الرسائل بالترتيب | يمكن أن تصل الرسائل في غير ترتيبها |

---

## رموز الأخطاء في خطافات ويب الحالة

| الرمز | الخطأ | الحل |
|------|-------|-----|
| `131026` | تعذر تسليم الرسالة | قد يكون المستخدم غير متصل أو الرقم غير صالح |
| `131047` | رسالة إعادة التفاعل | لا يمكن مراسلة المستخدم — لا توجد نافذة مفتوحة |
| `131048` | حد معدل البريد العشوائي (Spam rate limit) | عدد كبير جداً من الرسائل لهذا المستخدم |
| `131051` | نوع رسالة غير مدعوم | لا ترسل هذا النوع إلى هذا المستخدم |
| `131052` | خطأ في تنزيل الوسائط | الوسائط منتهية الصلاحية أو لا يمكن الوصول إليها |
| `131053` | خطأ في رفع الوسائط | مشكلة في الوسائط المرفوعة |
| `130429` | تم تجاوز حد المعدل | قم بتقليل معدل الإرسال الخاص بك |
| `131000` | خطأ عام في الإرسال | تحقق من الحمولة (payload) |

---

## ملاحظات حول SEEN V2

| الميزة | الملاحظات |
|---------|-------|
| الرسائل الواردة | توجيهها إلى سلسلة محادثة SEEN V2 الصحيحة |
| تحديثات الحالة | `delivered` / `read` ← تحديث حالة الرسالة في واجهة المستخدم (UI) |
| حالة القالب | `APPROVED` ← إلغاء قفل القالب للاستخدام في رسائل البث (Broadcasts) |
| إزالة التكرار | تخزين `wamid` المُعالج لتجنب المعالجة المزدوجة |
| التوقيع | يجب التحقق منه في بيئة الإنتاج — لا تتخطاه أبدًا في تطبيق حقيقي |\n\n
<!-- panel:comparison -->
**حدث Messages مقابل حدث Statuses**
- **حدث الرسائل (Messages):** يتم تشغيله عندما يرسل المستخدم رسالة واردة (نص، صورة، ضغط زر) لنشاطك التجاري.
- **حدث الحالات (Statuses):** يتم تشغيله عندما تتغير حالة تسليم رسالتك الصادرة (تم الإرسال، تم التسليم، مقروءة).
<!-- endpanel -->
\n
<!-- panel:quiz -->
كيف تتحقق من صحة طلب Webhook وتتأكد أنه قادم من Meta فعلياً؟
- [ ] التحقق من عنوان الـ IP للطلب.
- [x] التحقق من التوقيع (X-Hub-Signature-256) باستخدام الـ App Secret الخاص بك.
- [ ] إرسال طلب GET لـ Meta API للتأكيد.
- [ ] البحث عن قيمة "verified: true" في الـ JSON.
<!-- endpanel -->
\n