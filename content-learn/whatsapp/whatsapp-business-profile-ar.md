---
slug: whatsapp-business-profile
title: واجهة برمجة تطبيقات ملف الأعمال في واتساب
platform: WhatsApp
category: Core API
priority: medium
source_url: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles
last_verified: 2026-06-24
---

# واجهة برمجة تطبيقات ملف الأعمال في واتساب

تتيح واجهة برمجة تطبيقات ملف الأعمال (Business Profile API) لنظام SEEN V2 إدارة الملف التعريفي العام لحساب واتساب للأعمال (WABA) برمجياً. هذا ما يراه المستخدمون النهائيون عند النقر على اسم النشاط التجاري في واتساب.

## إدارة الملف التعريفي

يمكنك قراءة وتحديث تفاصيل الملف التعريفي باستخدام الحافة `/whatsapp_business_profile` على معرّف رقم الهاتف (Phone Number ID).

### المعلمات والحقول (تحديث الملف التعريفي)

| الحقل | النوع | مطلوب | الوصف |
|-------|------|----------|-------------|
| `messaging_product` | string | نعم | يجب أن يكون `"whatsapp"` |
| `address` | string | لا | العنوان الفعلي (بحد أقصى 256 حرفاً) |
| `description` | string | لا | وصف النشاط التجاري (بحد أقصى 512 حرفاً) |
| `vertical` | enum | لا | فئة الصناعة (مثل `RETAIL`، `FINANCE`) |
| `email` | string | لا | البريد الإلكتروني للتواصل (بحد أقصى 128 حرفاً) |
| `websites` | array | لا | ما يصل إلى رابطين (بحد أقصى 256 حرفاً لكل منهما) |
| `profile_picture_handle`| string | لا | معرّف الوسائط المرفوعة للصورة الشخصية |
| `about` | string | لا | نص "حول" (About) المعروض أسفل الرقم (بحد أقصى 139 حرفاً) |

## قواعد التحقق

| القاعدة | ❌ يُرفض (REJECTED) | ✅ يُقبل (ACCEPTED) |
|------|-----------------|-----------------|
| حد مواقع الويب | مصفوفة تحتوي على 3 روابط أو أكثر | مصفوفة تحتوي على رابط واحد أو رابطين |
| تنسيق موقع الويب | `"www.example.com"` | `"http://www.example.com"` أو `"https://..."` |
| طول نص About | 140 حرفاً أو أكثر | 139 حرفاً كحد أقصى |
| فئة Enum (Vertical Enum) | `"Technology"` | `"OTHER"`، `"RETAIL"`، `"PROF_SERVICES"` إلخ. |

## معاينة حية — كيف يبدو

<!-- preview:accepted -->
### ✅ الاستخدام الصحيح — تحديث الملف التعريفي

```json
POST /v19.0/{PHONE_NUMBER_ID}/whatsapp_business_profile
Authorization: Bearer {ACCESS_TOKEN}

{
  "messaging_product": "whatsapp",
  "address": "123 Commerce St, New York, NY",
  "description": "Your favorite place for tech gadgets.",
  "vertical": "RETAIL",
  "email": "contact@seenv2.com",
  "websites": [
    "https://seenv2.com",
    "https://help.seenv2.com"
  ],
  "about": "Available 24/7 for support"
}
```

**لماذا ينجح:** تنسيقات روابط صحيحة، أقل من 3 مواقع ويب، قيمة enum صحيحة للفئة.

<!-- preview:rejected -->
### ❌ خطأ شائع — تنسيق موقع ويب غير صالح

```json
{
  "messaging_product": "whatsapp",
  "websites": [
    "seenv2.com"
  ]
}
```

**الخطأ:** `Error 100: Invalid parameter` — يجب أن تبدأ الروابط بـ `http://` أو `https://`.

## صورة الملف التعريفي

يتطلب تحديث صورة الملف التعريفي عملية من خطوتين باستخدام عمليات الرفع القابلة للاستئناف (Resumable Uploads)، وليس عبر رابط مباشر.

1. **إنشاء جلسة رفع:** إرسال طلب POST إلى `/{APP_ID}/uploads`
2. **رفع الملف:** إرسال بيانات ثنائية كطلب POST إلى معرّف الجلسة المُرجع
3. **تحديث الملف التعريفي:** تمرير المعرّف المُرجع إلى `profile_picture_handle`

## ملاحظات التنفيذ في SEEN V2

- **واجهة مستخدم الإعدادات:** يجب أن تقوم لوحة إعدادات SEEN V2 بالتحقق الصارم من صحة هذه المدخلات من جهة العميل (خاصة مخططات الروابط والحد الأقصى لعدد الأحرف) قبل الاتصال بواجهة برمجة تطبيقات Meta لمنع الأخطاء المزعجة.
- **التخزين المؤقت (Caching):** قم بجلب الملف التعريفي عند تحميل التطبيق وقم بتخزينه مؤقتاً. لا تقم بجلبه ديناميكياً عند كل عرض (render) للصفحة.

## قائمة مراجعة ضمان الجودة (QA Checklist)

- [ ] التحقق من أن الروابط تحتوي على `http(s)://`
- [ ] فرض حد أقصى للطول يبلغ 139 حرفاً للحقل `about`
- [ ] التأكد من أن اختيار الفئة (vertical) يستخدم قيم enum الدقيقة من Meta، وليس نصوصاً عشوائية
