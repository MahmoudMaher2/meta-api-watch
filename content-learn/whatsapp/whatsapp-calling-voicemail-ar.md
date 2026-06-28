---
title: "WhatsApp Cloud API Calling: البريد الصوتي (Voicemail) وـ SIP Call Webhooks"
date: "2026-06-28"
category: "whatsapp"
description: "أصبح البريد الصوتي (Voicemail) لـ WhatsApp Cloud API Calling متاحاً بشكل عام (GA). يمكن تهيئة الإعلانات الصوتية ومشغلات REJECT/TIMEOUT، واستقبال الرسائل الصوتية المسجّلة كرسائل صوتية واردة. تُرسِل SIP call webhooks الآن أحداث call_created وterminate."
tags: ["whatsapp", "calling-api", "voicemail", "sip", "webhooks", "cloud-api", "new-feature"]
badge: "NEW"
---

# WhatsApp Cloud API Calling: البريد الصوتي وـ SIP Webhooks 🆕

وصل تحديثان رئيسيان لميزة **WhatsApp Cloud API Calling** في أواخر يونيو 2026.

## 1. البريد الصوتي (Voicemail) — متاح الآن بشكل عام (GA)

أصبح **البريد الصوتي** لـ WhatsApp Cloud API Calling متاحاً لجميع الشركات. يمكن للمتصلين غير المجاب عليهم ترك رسالة صوتية، يستقبلها نظامك كـ **رسالة صوتية واردة** عبر webhook الحالي `messages`.

### ما يمكن تهيئته

| الخيار | الوصف |
|---|---|
| **وسائط الإعلان (Announcement media)** | تشغيل رسالة صوتية مخصصة قبل بدء التسجيل |
| **مشغّل REJECT** | قطع المكالمة بدلاً من التسجيل |
| **مشغّل TIMEOUT** | إنهاء تسجيل البريد الصوتي بعد حدّ زمني |

### كيف تصل رسائل البريد الصوتي

<!-- preview -->
تصل رسائل البريد الصوتي عبر **webhook الحالي `messages`** كرسائل صوتية واردة — لا حاجة للاشتراك في webhook جديد. يبدو الـ payload كرسالة صوتية عادية من المستخدم.

<!-- preview -->
✅ لا يلزم الاشتراك في webhook جديد — لكن يجب على الـ backend التمييز بين صوت البريد الصوتي ورسائل المستخدم الصوتية العادية بناءً على سياق المكالمة.

## 2. SIP Call Webhooks

للشركات التي تمتلك أرقام هواتف مفعّلة لـ **SIP**، أصبح تسليم Webhook لأحداث دورة حياة المكالمات متاحاً الآن.

### الإعداد

فعّل تسليم Webhook عبر حقل `webhook_delivery` في إعدادات SIP الخاصة بك.

### الأحداث المُسلَّمة

| الحدث | متى يُرسَل |
|---|---|
| `call_created` | عند بدء مكالمة SIP جديدة |
| `terminate` | عند انتهاء مكالمة SIP |

### الربط مع SIP

يتضمن webhook `call_created` معرّف **WhatsApp Call ID (WACID)**، والذي يمكن ربطه بـ **SIP Call-ID header** لتتبع المكالمات من طرف إلى طرف وتصحيح الأخطاء.

<!-- panel:comparison -->
**البريد الصوتي (Voicemail)**
- متاح لجميع الشركات التي تستخدم Cloud API Calling
- لا حاجة للاشتراك في webhook جديد
- يصل كرسالة صوتية واردة في webhook الحالي `messages`

**SIP Call Webhooks**
- للأرقام المفعّلة لـ SIP فقط
- يجب تفعيل `webhook_delivery` في إعدادات SIP
- يُسلِّم أحداث دورة حياة `call_created` و`terminate`
<!-- endpanel -->

<!-- panel:quiz -->
كيف يتم تسليم رسائل البريد الصوتي في WhatsApp Cloud API؟
- [ ] عبر حقل webhook مخصص جديد `voicemail`
- [x] كرسائل صوتية واردة عبر حقل webhook الحالي `messages`
- [ ] عبر نقطة نهاية Voicemail API منفصلة
- [ ] عبر إشعار البريد الإلكتروني
<!-- endpanel -->
