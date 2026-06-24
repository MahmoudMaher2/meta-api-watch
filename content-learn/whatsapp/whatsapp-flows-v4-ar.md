---
slug: whatsapp-flows-v4
title: WhatsApp Flows v4 — نماذج تفاعلية
platform: WhatsApp
category: Core API
priority: high
new: true
new_since: 2026-06-24
changelog_article: 2026-06-24
source_url: https://developers.facebook.com/docs/whatsapp/flows
last_verified: 2026-06-24
---

# WhatsApp Flows v4 — نماذج تفاعلية

يقدم WhatsApp Flows v4 نماذج تفاعلية أصلية داخل محادثات WhatsApp، مما يتيح للشركات جمع بيانات منظمة دون إعادة توجيه المستخدمين إلى روابط خارجية.

## نظرة عامة

يمكّن Flows v4 الشركات من بناء تجارب نماذج متعددة الشاشات تعمل بشكل أصلي داخل WhatsApp. يجيب المستخدمون على الأسئلة، ويحددون الخيارات، ويرسلون البيانات — كل ذلك دون مغادرة المحادثة. بالنسبة إلى SEEN V2، يعد هذا ذا صلة مباشرة بجمع بيانات العملاء المحتملين، والإعداد، وسير عمل الاستبيانات في وحدة Broadcasts.

## كيف يعمل

- ترسل الشركة رسالة Flow عبر واجهة برمجة التطبيقات Messages API
- يعرض WhatsApp الشاشات التفاعلية على جهاز المستخدم
- يرسل المستخدم النموذج — تصل حمولة webhook بالبيانات المجمعة
- يقوم SEEN V2 بتعيين الحمولة إلى سجل جهة اتصال أو محادثة

## المعلمات والحقول

| الحقل | النوع | مطلوب | الوصف |
|-------|------|----------|-------------|
| `flow_id` | string | نعم | المعرف الفريد للـ Flow المنشور |
| `flow_action` | enum | نعم | `navigate` أو `data_exchange` |
| `flow_action_payload` | object | لا | البيانات الممررة إلى الـ flow عند الفتح |
| `flow_token` | string | لا | رمز فريد لكل محادثة للتتبع |

## قواعد التحقق

| القاعدة | ❌ يُرفض | ✅ يُقبل |
|------|-----------------|-----------------|
| حالة الـ Flow | إرسال flow بحالة `DRAFT` | فقط الـ flows بحالة `PUBLISHED` يمكن إرسالها |
| قيمة flow_action | `"open"`, `"start"` (غير صالحة) | `"navigate"` أو `"data_exchange"` |
| طول flow_token | أكثر من 64 حرفاً | 64 حرفاً أو أقل، أبجدي رقمي |

## معاينة حية — كيف يبدو

<!-- preview:accepted -->
### ✅ الاستخدام الصحيح

```json
POST /v19.0/{PHONE_NUMBER_ID}/messages

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "{{CUSTOMER_PHONE}}",
  "type": "interactive",
  "interactive": {
    "type": "flow",
    "header": { "type": "text", "text": "Complete your profile" },
    "body": { "text": "Please fill in your details below." },
    "footer": { "text": "Takes less than 2 minutes" },
    "action": {
      "name": "flow",
      "parameters": {
        "flow_message_version": "3",
        "flow_token": "AQAAAAACS5FpgQ_cAAAAAD0QI3s",
        "flow_id": "991881656454398",
        "flow_cta": "Open Form",
        "flow_action": "navigate",
        "flow_action_payload": {
          "screen": "WELCOME",
          "data": { "name": "Sarah" }
        }
      }
    }
  }
}
```

**لماذا ينجح هذا:** الـ Flow في حالة `PUBLISHED`، و `flow_action` هي `navigate`، وطول الرمز صالح، وجميع الحقول المطلوبة موجودة.

<!-- preview:rejected -->
### ❌ خطأ شائع

```json
{
  "action": {
    "name": "flow",
    "parameters": {
      "flow_id": "991881656454398",
      "flow_action": "open",
      "flow_token": "this-token-is-way-too-long-and-exceeds-the-maximum-allowed-64-character-limit-xyz"
    }
  }
}
```

**الخطأ:** `Error 100: Invalid parameter` — يجب أن يكون `flow_action` إما `navigate` أو `data_exchange`، ويتجاوز `flow_token` 64 حرفاً.

## مقارنة: قبل وبعد هذه الميزة

| الجانب | قبل هذه الميزة | بعد هذه الميزة |
|--------|--------------------|--------------------|
| جمع البيانات | إعادة توجيه إلى نموذج ويب خارجي | نموذج أصلي داخل المحادثة |
| معدل الانسحاب | مرتفع (يغادر WhatsApp) | منخفض (يبقى في المحادثة) |
| حمولة webhook | رسالة نصية فقط | JSON منظم يحتوي على جميع حقول النموذج |

## مثال برمجي — طلب كامل يعمل

```json
POST /v19.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {ACCESS_TOKEN}

{
  "messaging_product": "whatsapp",
  "to": "{{CUSTOMER_PHONE}}",
  "type": "interactive",
  "interactive": {
    "type": "flow",
    "body": { "text": "Hi {{1}}, complete your onboarding in 60 seconds!" },
    "action": {
      "name": "flow",
      "parameters": {
        "flow_message_version": "3",
        "flow_id": "{{YOUR_FLOW_ID}}",
        "flow_token": "{{UNIQUE_SESSION_TOKEN}}",
        "flow_cta": "Start Onboarding",
        "flow_action": "navigate"
      }
    }
  }
}
```

## SEEN V2 — التأثير والملاحظات

| الوحدة | التأثير |
|--------|--------|
| Broadcasts | يمكن إرسال رسائل Flow كجزء من الحملات — استخدمها لنماذج العملاء المحتملين |
| Webhooks | حدث webhook جديد `flow_completion` يسلم بيانات النموذج المرسلة |
| Channel Integration/OAuth | يجب أن يكون معرف الـ Flow (Flow ID) مرتبطاً بحساب WABA المتصل |

> **📋 مقال سجل التغييرات المرتبط:** تم اكتشاف هذه الميزة في 2026-06-24.
> انظر: [إدخال سجل التغييرات لـ 2026-06-24](https://developers.facebook.com/docs/whatsapp/flows)

## قائمة التحقق من الجودة (QA)

- [ ] تحقق من أن الـ Flow في حالة `PUBLISHED` قبل الإرسال
- [ ] اختبر المثال المقبول ✅ — تأكد من أن الرسالة التفاعلية تظهر في WhatsApp
- [ ] اختبر المثال المرفوض ❌ — تأكد من ظهور الخطأ 100 لـ `flow_action` غير الصالح
- [ ] تحقق من أن webhook يستقبل حمولة منظمة عند اكتمال الـ flow
- [ ] اختبر باستخدام `flow_token` من 64 حرفاً بالضبط — تأكد من أنه يعمل
