---
title: "قالب شبكة الصور (Image Grid Template) لمنصة Messenger"
date: "2026-07-16"
category: "messenger"
description: "كيفية تكوين وإرسال قالب رسائل شبكة الصور الجديد على منصة Messenger. اعرض من 2 إلى 6 صور مع إجراءات نقر وأزرار مخصصة."
tags: ["messenger", "templates", "image-grid", "send-api", "new-feature"]
badge: "NEW"
---

# منصة Messenger: قالب شبكة الصور 🆕

أطلقت Meta قالب **شبكة الصور (Image Grid template)** لمنصة Messenger في 30 يونيو 2026. يتيح نوع قالب الرسائل الجديد هذا للشركات إرسال ما بين 2 إلى 6 صور مرتبة في تخطيط شبكي نظيف داخل فقاعة رسالة واحدة.

---

## الميزات الأساسية

- **عرض متعدد الصور:** أرسل من 2 إلى 6 صور معاً في رسالة واحدة.
- **إجراءات نقر مخصصة:** يمكن لكل صورة في الشبكة دعم إجراء نقر افتراضي خاص بها:
  - `web_url`: يفتح رابط URL محدداً عند النقر.
  - `postback`: يرسل بيانات نقرة (postback payload) محددة من المطور إلى الـ Webhook الخاص بك.
- **أزرار تفاعل سفلية:** يمكنك تحديد عنوان اختياري، وعنوان فرعي، وما يصل إلى ثلاثة أزرار أسفل شبكة الصور.

---

## إرسال شبكة صور

استخدم Send Messages API بالهيكل التالي:

<!-- preview -->
```json
{
  "recipient": { "id": "<PSID>" },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "image_grid",
        "elements": [
          {
            "image_url": "https://example.com/img1.jpg",
            "default_action": {
              "type": "web_url",
              "url": "https://example.com/detail1"
            }
          },
          {
            "image_url": "https://example.com/img2.jpg",
            "default_action": {
              "type": "postback",
              "payload": "GRID_IMAGE_2_CLICKED"
            }
          }
        ],
        "title": "تخطيط شبكي رائع",
        "subtitle": "اكتشف مجموعتنا الجديدة",
        "buttons": [
          {
            "type": "postback",
            "title": "عرض الكل",
            "payload": "VIEW_ALL_COLLECTION"
          }
        ]
      }
    }
  }
}
```

---

## مقارنة بين إجراءات النقر

<!-- panel:comparison -->
**إجراء النقر web_url**
- يفتح رابط الـ URL المحدد في المتصفح داخل التطبيق.
- الأفضل لصفحات تفاصيل المنتجات أو الروابط الخارجية.

**إجراء النقر postback**
- يرسل حدث postback إلى الـ Webhook الخاص بك.
- الأفضل للمسارات الحوارية التفاعلية أو الاستجابات البرمجية في خادمك.
<!-- endpanel -->

---

## اختبار سريع

<!-- panel:quiz -->
ما هو الحد الأدنى والأقصى لعدد الصور المدعومة في قالب شبكة الصور (Image Grid)؟
- [ ] من 1 إلى 5 صور
- [x] من 2 إلى 6 صور
- [ ] من 2 إلى 4 صور
- [ ] عدد غير محدود من الصور
<!-- endpanel -->
