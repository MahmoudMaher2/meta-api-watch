const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'content-learn');

const dict = {
  'error-codes': {
    en: {
      compTitle: 'Client Errors vs Server Errors',
      compLeftTitle: 'Client Errors (4xx)',
      compLeftBody: 'Typically caused by invalid input, rate limits, or expired tokens. You must fix the request before retrying.',
      compRightTitle: 'Server Errors (5xx)',
      compRightBody: 'Caused by temporary issues on Meta\\\'s end. You should retry the request with exponential backoff.',
      quizQ: 'What should you do if you receive a Rate Limit (131056) error?',
      quizOpts: [
        '- [ ] Immediately retry the exact same request.',
        '- [x] Pause sending and implement exponential backoff or wait for the limit window to reset.',
        '- [ ] Delete the template and recreate it.',
        '- [ ] Change the phone number.'
      ]
    },
    ar: {
      compTitle: 'أخطاء العميل مقابل أخطاء الخادم',
      compLeftTitle: 'أخطاء العميل (4xx)',
      compLeftBody: 'تحدث عادة بسبب إدخال غير صالح، أو تجاوز حدود الإرسال، أو انتهاء صلاحية التوكن. يجب إصلاح الطلب قبل إعادة المحاولة.',
      compRightTitle: 'أخطاء الخادم (5xx)',
      compRightBody: 'تحدث بسبب مشاكل مؤقتة من طرف Meta. يجب إعادة المحاولة لاحقاً مع استخدام التراجع التدريجي (Exponential Backoff).',
      quizQ: 'ماذا يجب أن تفعل إذا تلقيت خطأ تجاوز حد الإرسال (Rate Limit 131056)؟',
      quizOpts: [
        '- [ ] إعادة المحاولة فوراً بنفس الطلب.',
        '- [x] إيقاف الإرسال مؤقتاً وتطبيق التراجع التدريجي أو الانتظار حتى تفتح نافذة الحد.',
        '- [ ] حذف القالب وإعادة إنشائه.',
        '- [ ] تغيير رقم الهاتف.'
      ]
    }
  },
  'instagram-comments-automation': {
    en: {
      compTitle: 'Public Comments vs Private Replies',
      compLeftTitle: 'Public Comments',
      compLeftBody: 'Visible to everyone. Great for engagement and general answers. Limited to text and tagging.',
      compRightTitle: 'Private Replies',
      compRightBody: 'Sent via DM. Ideal for customer support, order details, and collecting user info securely.',
      quizQ: 'How quickly must a Private Reply be sent after a user comments on an Instagram post?',
      quizOpts: [
        '- [ ] Within 24 hours',
        '- [x] Within 7 days',
        '- [ ] Within 1 hour',
        '- [ ] There is no time limit'
      ]
    },
    ar: {
      compTitle: 'التعليقات العامة مقابل الردود الخاصة',
      compLeftTitle: 'التعليقات العامة (Public)',
      compLeftBody: 'مرئية للجميع. ممتازة لزيادة التفاعل والإجابات العامة. تقتصر على النصوص والإشارات (Tagging).',
      compRightTitle: 'الردود الخاصة (Private Replies)',
      compRightBody: 'تُرسل عبر الرسائل المباشرة (DM). مثالية لخدمة العملاء وتفاصيل الطلبات وجمع البيانات بأمان.',
      quizQ: 'ما هي المهلة الزمنية لإرسال رد خاص (Private Reply) بعد تعليق المستخدم على منشور إنستغرام؟',
      quizOpts: [
        '- [ ] خلال 24 ساعة',
        '- [x] خلال 7 أيام',
        '- [ ] خلال ساعة واحدة',
        '- [ ] لا يوجد حد زمني'
      ]
    }
  },
  'instagram-ice-breakers': {
    en: {
      compTitle: 'Ice Breakers vs Quick Replies',
      compLeftTitle: 'Ice Breakers',
      compLeftBody: 'Shown *before* the user sends their first message to the business. Up to 4 questions.',
      compRightTitle: 'Quick Replies',
      compRightBody: 'Shown *after* the business sends a message, as suggested responses for the user to tap.',
      quizQ: 'How many Ice Breakers can you configure for your Instagram Professional account?',
      quizOpts: [
        '- [ ] Up to 10',
        '- [ ] Up to 5',
        '- [x] Up to 4',
        '- [ ] Unlimited'
      ]
    },
    ar: {
      compTitle: 'Ice Breakers مقابل الردود السريعة (Quick Replies)',
      compLeftTitle: 'كسر الجليد (Ice Breakers)',
      compLeftBody: 'تظهر *قبل* أن يرسل المستخدم رسالته الأولى للنشاط التجاري. بحد أقصى 4 أسئلة.',
      compRightTitle: 'الردود السريعة',
      compRightBody: 'تظهر *بعد* إرسال النشاط التجاري لرسالة، كخيارات مقترحة للمستخدم للضغط عليها.',
      quizQ: 'ما هو الحد الأقصى لعدد أسئلة Ice Breakers التي يمكن إعدادها لحساب إنستغرام الاحترافي؟',
      quizOpts: [
        '- [ ] حتى 10',
        '- [ ] حتى 5',
        '- [x] حتى 4',
        '- [ ] عدد غير محدود'
      ]
    }
  },
  'instagram-story-replies': {
    en: {
      compTitle: 'Story Mentions vs Story Replies',
      compLeftTitle: 'Story Mentions',
      compLeftBody: 'Triggered when a user tags your IG account in their own story. You receive a webhook event.',
      compRightTitle: 'Story Replies',
      compRightBody: 'Triggered when a user swipes up and replies to your published story. Handled as a standard message.',
      quizQ: 'What happens when a user replies to your Instagram Story?',
      quizOpts: [
        '- [ ] You receive an email notification.',
        '- [x] You receive a webhook event and a 24-hour messaging window opens.',
        '- [ ] You can only reply with an automated template.',
        '- [ ] Story replies cannot be handled by the API.'
      ]
    },
    ar: {
      compTitle: 'الإشارات في القصة (Mentions) مقابل الردود على القصة (Replies)',
      compLeftTitle: 'الإشارة (Mentions)',
      compLeftBody: 'تحدث عندما يذكرك مستخدم في قصته الخاصة (Tag). تتلقى إشعار Webhook بذلك.',
      compRightTitle: 'الردود (Replies)',
      compRightBody: 'تحدث عندما يرفع المستخدم الشاشة للرد على قصتك. تُعامل كرسالة عادية.',
      quizQ: 'ماذا يحدث عندما يرد مستخدم على قصة (Story) خاصة بنشاطك التجاري على إنستغرام؟',
      quizOpts: [
        '- [ ] تتلقى إشعاراً عبر البريد الإلكتروني.',
        '- [x] تتلقى Webhook وتُفتح نافذة مراسلة مدتها 24 ساعة.',
        '- [ ] يمكنك الرد فقط باستخدام قالب جاهز.',
        '- [ ] لا يمكن معالجة الردود على القصص عبر الـ API.'
      ]
    }
  },
  'messenger-24-hour-policy': {
    en: {
      compTitle: 'Standard Messaging vs Message Tags',
      compLeftTitle: 'Standard Window (24h)',
      compLeftBody: 'Allows promotional and non-promotional content within 24 hours of the user\\\'s last interaction.',
      compRightTitle: 'Message Tags',
      compRightBody: 'Allows sending non-promotional updates (e.g. POST_PURCHASE_UPDATE) outside the 24h window.',
      quizQ: 'Which of the following is ALLOWED outside the 24-hour standard messaging window without a tag?',
      quizOpts: [
        '- [ ] Sending a discount code.',
        '- [ ] Sending a daily newsletter.',
        '- [ ] Asking the user to buy a product.',
        '- [x] None of the above. You must use a Message Tag or Sponsored Message outside 24h.'
      ]
    },
    ar: {
      compTitle: 'المراسلة العادية مقابل علامات الرسائل (Tags)',
      compLeftTitle: 'النافذة القياسية (24 ساعة)',
      compLeftBody: 'تسمح بإرسال محتوى ترويجي وغير ترويجي خلال 24 ساعة من آخر تفاعل للمستخدم.',
      compRightTitle: 'علامات الرسائل (Message Tags)',
      compRightBody: 'تسمح بإرسال تحديثات غير ترويجية (مثل تحديثات الطلب) خارج نافذة الـ 24 ساعة.',
      quizQ: 'أي مما يلي يُسمح بإرساله خارج نافذة الـ 24 ساعة بدون استخدام Message Tag؟',
      quizOpts: [
        '- [ ] إرسال كود خصم.',
        '- [ ] إرسال نشرة إخبارية يومية.',
        '- [ ] مطالبة المستخدم بشراء منتج.',
        '- [x] لا شيء مما سبق. يجب استخدام Message Tag أو رسالة ممولة خارج الـ 24 ساعة.'
      ]
    }
  },
  'messenger-handover-protocol': {
    en: {
      compTitle: 'Primary Receiver vs Secondary Receiver',
      compLeftTitle: 'Primary Receiver',
      compLeftBody: 'The default app that receives messages and controls the thread initially (usually a bot).',
      compRightTitle: 'Secondary Receiver',
      compRightBody: 'An app that only listens passively until the thread is explicitly passed to it (e.g. live chat agent).',
      quizQ: 'Which API method is used to give thread control to another app?',
      quizOpts: [
        '- [ ] take_thread_control',
        '- [x] pass_thread_control',
        '- [ ] request_thread_control',
        '- [ ] transfer_thread'
      ]
    },
    ar: {
      compTitle: 'المستقبل الأساسي مقابل المستقبل الثانوي',
      compLeftTitle: 'المستقبل الأساسي (Primary)',
      compLeftBody: 'التطبيق الافتراضي الذي يستقبل الرسائل ويتحكم في المحادثة أولاً (عادة البوت).',
      compRightTitle: 'المستقبل الثانوي (Secondary)',
      compRightBody: 'تطبيق يستمع فقط حتى يتم تمرير التحكم إليه صراحةً (مثل خدمة العملاء البشرية).',
      quizQ: 'ما هو مسار الـ API المستخدم لمنح التحكم في المحادثة لتطبيق آخر؟',
      quizOpts: [
        '- [ ] take_thread_control',
        '- [x] pass_thread_control',
        '- [ ] request_thread_control',
        '- [ ] transfer_thread'
      ]
    }
  },
  'messenger-instagram-api': {
    en: {
      compTitle: 'Messenger API vs Instagram Messaging API',
      compLeftTitle: 'Messenger API',
      compLeftBody: 'Uses Facebook Page ID. Supports features like generic templates, receipts, and persistent menu.',
      compRightTitle: 'Instagram Messaging API',
      compRightBody: 'Uses IG Professional Account ID. Supports story replies, ice breakers, and product templates.',
      quizQ: 'Can you use the exact same payload to send an Interactive Button template on both Messenger and Instagram?',
      quizOpts: [
        '- [ ] Yes, the APIs are 100% identical.',
        '- [x] Generally yes for basic buttons, but some advanced templates (like Receipt) are only supported on Messenger.',
        '- [ ] No, Instagram uses XML instead of JSON.',
        '- [ ] No, Instagram does not support buttons at all.'
      ]
    },
    ar: {
      compTitle: 'واجهة ماسنجر مقابل واجهة إنستغرام',
      compLeftTitle: 'Messenger API',
      compLeftBody: 'تستخدم معرّف صفحة فيسبوك. تدعم قوالب الإيصالات، والقوائم الثابتة (Persistent Menu).',
      compRightTitle: 'Instagram Messaging API',
      compRightBody: 'تستخدم معرّف حساب IG الاحترافي. تدعم الردود على القصص، وكسر الجليد، وقوالب المنتجات.',
      quizQ: 'هل يمكنك استخدام نفس الـ Payload تماماً لإرسال قالب أزرار تفاعلي على كل من ماسنجر وإنستغرام؟',
      quizOpts: [
        '- [ ] نعم، الواجهتان متطابقتان بنسبة 100%.',
        '- [x] نعم للأزرار الأساسية، لكن بعض القوالب المتقدمة (مثل الإيصال) مدعومة فقط في ماسنجر.',
        '- [ ] لا، إنستغرام يستخدم XML بدلاً من JSON.',
        '- [ ] لا، إنستغرام لا يدعم الأزرار على الإطلاق.'
      ]
    }
  },
  'messenger-persistent-menu': {
    en: {
      compTitle: 'Persistent Menu vs Ice Breakers',
      compLeftTitle: 'Persistent Menu',
      compLeftBody: 'Always visible as a hamburger icon inside the chat. Useful for general navigation (Help, Settings).',
      compRightTitle: 'Ice Breakers',
      compRightBody: 'Only visible BEFORE the user sends their first message. Useful for onboarding new users.',
      quizQ: 'What is the maximum number of top-level items you can add to a Messenger Persistent Menu?',
      quizOpts: [
        '- [x] 3 items',
        '- [ ] 5 items',
        '- [ ] 10 items',
        '- [ ] Unlimited'
      ]
    },
    ar: {
      compTitle: 'القائمة الثابتة مقابل كسر الجليد',
      compLeftTitle: 'القائمة الثابتة (Persistent Menu)',
      compLeftBody: 'مرئية دائماً كأيقونة همبرغر داخل المحادثة. مفيدة للتنقل العام (مساعدة، إعدادات).',
      compRightTitle: 'كسر الجليد (Ice Breakers)',
      compRightBody: 'مرئية فقط *قبل* أن يرسل المستخدم رسالته الأولى. مفيدة لتهيئة المستخدمين الجدد.',
      quizQ: 'ما هو الحد الأقصى للعناصر الرئيسية (Top-level) التي يمكنك إضافتها في القائمة الثابتة في ماسنجر؟',
      quizOpts: [
        '- [x] 3 عناصر',
        '- [ ] 5 عناصر',
        '- [ ] 10 عناصر',
        '- [ ] غير محدود'
      ]
    }
  },
  'message-templates': {
    en: {
      compTitle: 'Marketing Templates vs Utility Templates',
      compLeftTitle: 'Marketing',
      compLeftBody: 'Used for promotions, offers, newsletters. Highest cost per conversation.',
      compRightTitle: 'Utility',
      compRightBody: 'Used for specific agreed-upon updates like shipping alerts, account updates. Lower cost.',
      quizQ: 'What status does a template get when it is first submitted but under review?',
      quizOpts: [
        '- [ ] APPROVED',
        '- [x] PENDING',
        '- [ ] REJECTED',
        '- [ ] PAUSED'
      ]
    },
    ar: {
      compTitle: 'قوالب التسويق مقابل قوالب المنفعة',
      compLeftTitle: 'التسويق (Marketing)',
      compLeftBody: 'تُستخدم للعروض الترويجية والنشرات. تكلفتها هي الأعلى لكل محادثة.',
      compRightTitle: 'المنفعة (Utility)',
      compRightBody: 'تُستخدم لتحديثات محددة متفق عليها مثل تنبيهات الشحن. تكلفتها أقل.',
      quizQ: 'ما هي حالة القالب عند إرساله للمراجعة لأول مرة؟',
      quizOpts: [
        '- [ ] APPROVED (موافق عليه)',
        '- [x] PENDING (قيد الانتظار)',
        '- [ ] REJECTED (مرفوض)',
        '- [ ] PAUSED (متوقف مؤقتاً)'
      ]
    }
  },
  'messages-api': {
    en: {
      compTitle: 'Text Messages vs Template Messages',
      compLeftTitle: 'Text Messages (Free-form)',
      compLeftBody: 'Can only be sent if a 24-hour customer service window is open.',
      compRightTitle: 'Template Messages',
      compRightBody: 'Can be sent at any time, even outside the 24-hour window, to initiate a business conversation.',
      quizQ: 'Which property is REQUIRED when sending a message to a user\\\'s phone number via the Cloud API?',
      quizOpts: [
        '- [ ] "recipient_type": "individual"',
        '- [x] "to": "<phone_number>"',
        '- [ ] "messaging_product": "whatsapp"',
        '- [ ] All of the above'
      ]
    },
    ar: {
      compTitle: 'الرسائل النصية مقابل رسائل القوالب',
      compLeftTitle: 'الرسائل النصية الحرة',
      compLeftBody: 'يمكن إرسالها فقط إذا كانت نافذة خدمة العملاء (24 ساعة) مفتوحة.',
      compRightTitle: 'رسائل القوالب (Templates)',
      compRightBody: 'يمكن إرسالها في أي وقت لبدء محادثة تجارية، حتى خارج نافذة الـ 24 ساعة.',
      quizQ: 'أي الخصائص التالية مطلوبة (REQUIRED) عند إرسال رسالة إلى رقم مستخدم عبر Cloud API؟',
      quizOpts: [
        '- [ ] "recipient_type": "individual"',
        '- [ ] "to": "<phone_number>"',
        '- [ ] "messaging_product": "whatsapp"',
        '- [x] جميع ما سبق'
      ]
    }
  },
  'webhooks': {
    en: {
      compTitle: 'Messages Webhook vs Statuses Webhook',
      compLeftTitle: 'Messages Event',
      compLeftBody: 'Triggered when a user sends an incoming message (text, image, button click) to your business.',
      compRightTitle: 'Statuses Event',
      compRightBody: 'Triggered when the delivery status of your OUTGOING message changes (sent, delivered, read).',
      quizQ: 'How do you verify the authenticity of a webhook request from Meta?',
      quizOpts: [
        '- [ ] Check the IP address of the request.',
        '- [x] Validate the X-Hub-Signature-256 header using your App Secret.',
        '- [ ] Send a GET request to Meta API to confirm.',
        '- [ ] Check for a "verified: true" boolean in the JSON payload.'
      ]
    },
    ar: {
      compTitle: 'حدث Messages مقابل حدث Statuses',
      compLeftTitle: 'حدث الرسائل (Messages)',
      compLeftBody: 'يتم تشغيله عندما يرسل المستخدم رسالة واردة (نص، صورة، ضغط زر) لنشاطك التجاري.',
      compRightTitle: 'حدث الحالات (Statuses)',
      compRightBody: 'يتم تشغيله عندما تتغير حالة تسليم رسالتك الصادرة (تم الإرسال، تم التسليم، مقروءة).',
      quizQ: 'كيف تتحقق من صحة طلب Webhook وتتأكد أنه قادم من Meta فعلياً؟',
      quizOpts: [
        '- [ ] التحقق من عنوان الـ IP للطلب.',
        '- [x] التحقق من التوقيع (X-Hub-Signature-256) باستخدام الـ App Secret الخاص بك.',
        '- [ ] إرسال طلب GET لـ Meta API للتأكيد.',
        '- [ ] البحث عن قيمة "verified: true" في الـ JSON.'
      ]
    }
  },
  'whatsapp-authentication-templates': {
    en: {
      compTitle: 'Copy Code vs Autofill',
      compLeftTitle: 'Copy Code Button',
      compLeftBody: 'User taps the button, and the OTP is copied to their clipboard to manually paste in your app.',
      compRightTitle: 'Autofill Button (Zero Tap)',
      compRightBody: 'Handshake between WhatsApp and your App intercepts the code and fills it automatically.',
      quizQ: 'What is the strict rule regarding the body text of an Authentication Template?',
      quizOpts: [
        '- [ ] You can add promotional text as long as the OTP is clear.',
        '- [x] Meta restricts editing. You must use the strictly predefined formats and cannot add custom marketing text.',
        '- [ ] You can add an image header.',
        '- [ ] The body must be empty.'
      ]
    },
    ar: {
      compTitle: 'نسخ الكود مقابل التعبئة التلقائية',
      compLeftTitle: 'زر نسخ الكود (Copy Code)',
      compLeftBody: 'يضغط المستخدم على الزر، فيُنسخ الكود (OTP) للحافظة ليقوم بلصقه يدوياً في تطبيقك.',
      compRightTitle: 'زر التعبئة التلقائية (Autofill)',
      compRightBody: 'يتم الربط بين واتساب وتطبيقك لملء الكود تلقائياً بدون تدخل المستخدم (Zero Tap).',
      quizQ: 'ما هي القاعدة الصارمة بخصوص نص (Body) قالب المصادقة (Auth Template)؟',
      quizOpts: [
        '- [ ] يمكنك إضافة نص ترويجي طالما أن الكود واضح.',
        '- [x] تمنع Meta التعديل. يجب استخدام التنسيقات المحددة مسبقاً ولا يمكنك إضافة نصوص تسويقية.',
        '- [ ] يمكنك إضافة صورة في الترويسة (Header).',
        '- [ ] يجب أن يكون النص فارغاً.'
      ]
    }
  },
  'whatsapp-billing-pricing': {
    en: {
      compTitle: 'Business-Initiated vs User-Initiated',
      compLeftTitle: 'Business-Initiated',
      compLeftBody: 'When you send a template to start a conversation. Charged based on the template category (Marketing, Utility).',
      compRightTitle: 'User-Initiated (Service)',
      compRightBody: 'When a user messages you first, opening a 24-hour window. Charged at the lower Service conversation rate.',
      quizQ: 'How many free Service (user-initiated) conversations does a WhatsApp Business account get per month?',
      quizOpts: [
        '- [ ] 10,000',
        '- [x] 1,000',
        '- [ ] 0 (All conversations are paid)',
        '- [ ] Unlimited'
      ]
    },
    ar: {
      compTitle: 'بمبادرة النشاط التجاري مقابل بمبادرة المستخدم',
      compLeftTitle: 'بمبادرة النشاط التجاري',
      compLeftBody: 'عندما ترسل قالب لبدء محادثة. تُحسب التكلفة بناءً على فئة القالب (تسويق، منفعة).',
      compRightTitle: 'بمبادرة المستخدم (خدمة)',
      compRightBody: 'عندما يراسلك المستخدم أولاً، مما يفتح نافذة 24 ساعة. تُحسب بتعريفة مخفضة.',
      quizQ: 'كم عدد محادثات الخدمة (بمبادرة المستخدم) المجانية التي يحصل عليها حساب واتساب للأعمال شهرياً؟',
      quizOpts: [
        '- [ ] 10,000',
        '- [x] 1,000',
        '- [ ] 0 (جميع المحادثات مدفوعة)',
        '- [ ] غير محدود'
      ]
    }
  },
  'whatsapp-business-profile': {
    en: {
      compTitle: 'Profile Picture vs Description',
      compLeftTitle: 'Profile Picture',
      compLeftBody: 'Must be an image (JPG/PNG). Displayed prominently in the chat header.',
      compRightTitle: 'Description',
      compRightBody: 'Text describing your business. Max 256 characters. Displayed in the contact info view.',
      quizQ: 'Which of the following fields CANNOT be updated via the WhatsApp Business Profile API?',
      quizOpts: [
        '- [ ] address',
        '- [ ] email',
        '- [x] phone_number (Display Name)',
        '- [ ] websites'
      ]
    },
    ar: {
      compTitle: 'صورة الملف الشخصي مقابل الوصف',
      compLeftTitle: 'صورة الملف الشخصي',
      compLeftBody: 'يجب أن تكون صورة (JPG/PNG). تُعرض بوضوح في أعلى المحادثة.',
      compRightTitle: 'الوصف (Description)',
      compRightBody: 'نص يصف نشاطك التجاري. بحد أقصى 256 حرف. يُعرض في واجهة معلومات جهة الاتصال.',
      quizQ: 'أي من الحقول التالية لا يمكن تحديثه (تغييره) عبر WhatsApp Business Profile API مباشرة؟',
      quizOpts: [
        '- [ ] العنوان (address)',
        '- [ ] البريد الإلكتروني (email)',
        '- [x] اسم العرض للرقم (Display Name)',
        '- [ ] مواقع الويب (websites)'
      ]
    }
  },
  'whatsapp-campaigns-broadcasts': {
    en: {
      compTitle: 'Sequential Sending vs Batch Processing',
      compLeftTitle: 'Sequential (Looping)',
      compLeftBody: 'Sending one message at a time. Very slow, blocks the server thread, prone to timeouts.',
      compRightTitle: 'Batch Processing (Async)',
      compRightBody: 'Sending requests concurrently using Queues or asynchronous workers. Maximizes throughput.',
      quizQ: 'To maximize throughput without getting banned, you should:',
      quizOpts: [
        '- [ ] Send 10,000 requests per second blindly.',
        '- [x] Throttle requests to match your phone number\\\'s Tier limit (e.g., 80 msgs/sec for Tier 1) and respect 429 errors.',
        '- [ ] Send messages from a consumer WhatsApp app.',
        '- [ ] Put all phone numbers in a single JSON array and send one request.'
      ]
    },
    ar: {
      compTitle: 'الإرسال المتسلسل مقابل المعالجة الدفعية (Batch)',
      compLeftTitle: 'المتسلسل (Sequential)',
      compLeftBody: 'إرسال رسالة تلو الأخرى. بطيء جداً، يعطل السيرفر، ومعرض لأخطاء الـ Timeout.',
      compRightTitle: 'المعالجة الدفعية (Async)',
      compRightBody: 'إرسال الطلبات بشكل متزامن باستخدام طوابير (Queues). يزيد من سرعة الإرسال لأقصى حد.',
      quizQ: 'لزيادة سرعة إرسال الحملات دون التعرض للحظر، يجب عليك:',
      quizOpts: [
        '- [ ] إرسال 10,000 طلب في الثانية بشكل أعمى.',
        '- [x] التحكم في سرعة الإرسال (Throttling) لتناسب مستوى رقمك (مثلاً 80 رسالة/ث لـ Tier 1) واحترام أخطاء 429.',
        '- [ ] إرسال الرسائل من تطبيق واتساب العادي.',
        '- [ ] وضع جميع الأرقام في مصفوفة JSON واحدة وإرسال طلب واحد.'
      ]
    }
  },
  'whatsapp-flows-data-exchange': {
    en: {
      compTitle: 'INIT Event vs DATA_EXCHANGE Event',
      compLeftTitle: 'INIT (Initialization)',
      compLeftBody: 'Triggered when the Flow is opened. Used to fetch initial dynamic data (e.g., list of stores).',
      compRightTitle: 'DATA_EXCHANGE',
      compRightBody: 'Triggered when the user submits a screen or taps a button to fetch new data mid-flow.',
      quizQ: 'What happens if your Data Exchange Endpoint takes more than 10 seconds to respond?',
      quizOpts: [
        '- [ ] The user receives a WhatsApp message with the delay.',
        '- [x] The Flow times out and displays an error to the user.',
        '- [ ] WhatsApp automatically retries 5 times.',
        '- [ ] The Flow continues normally without data.'
      ]
    },
    ar: {
      compTitle: 'حدث INIT مقابل حدث DATA_EXCHANGE',
      compLeftTitle: 'حدث التهيئة (INIT)',
      compLeftBody: 'يُرسل عند فتح الـ Flow. يُستخدم لجلب البيانات الديناميكية الأولية (مثل قائمة الفروع).',
      compRightTitle: 'تبادل البيانات (DATA_EXCHANGE)',
      compRightBody: 'يُرسل عندما يرسل المستخدم شاشة أو يضغط على زر لجلب بيانات جديدة في منتصف الـ Flow.',
      quizQ: 'ماذا يحدث إذا استغرق الـ Endpoint الخاص بك أكثر من 10 ثوانٍ للرد؟',
      quizOpts: [
        '- [ ] يتلقى المستخدم رسالة واتساب عادية تخبره بالتأخير.',
        '- [x] تنتهي مهلة الـ Flow (Timeout) ويظهر خطأ للمستخدم.',
        '- [ ] يقوم واتساب بإعادة المحاولة 5 مرات تلقائياً.',
        '- [ ] يستمر الـ Flow بشكل طبيعي بدون بيانات.'
      ]
    }
  },
  'whatsapp-flows-json-ui': {
    en: {
      compTitle: 'TextInput vs Dropdown',
      compLeftTitle: 'TextInput',
      compLeftBody: 'Allows free-form text entry. Best for names, addresses, or specific IDs.',
      compRightTitle: 'Dropdown',
      compRightBody: 'Restricts user to a predefined list of options. Prevents typos and parsing errors.',
      quizQ: 'Which of the following is a REQUIRED property for every screen in the Flow JSON?',
      quizOpts: [
        '- [ ] "footer"',
        '- [x] "layout"',
        '- [ ] "success_action"',
        '- [ ] "data_exchange"'
      ]
    },
    ar: {
      compTitle: 'إدخال النص مقابل القائمة المنسدلة',
      compLeftTitle: 'إدخال النص (TextInput)',
      compLeftBody: 'يسمح بإدخال نص حر. الأفضل للأسماء، العناوين، أو الأرقام الخاصة.',
      compRightTitle: 'القائمة المنسدلة (Dropdown)',
      compRightBody: 'تقيد المستخدم بقائمة خيارات محددة مسبقاً. تمنع الأخطاء الإملائية.',
      quizQ: 'أي الخصائص التالية مطلوبة (REQUIRED) لكل شاشة داخل الـ Flow JSON؟',
      quizOpts: [
        '- [ ] "footer"',
        '- [x] "layout"',
        '- [ ] "success_action"',
        '- [ ] "data_exchange"'
      ]
    }
  },
  'whatsapp-flows-v4': {
    en: {
      compTitle: 'Flows v3 vs Flows v4',
      compLeftTitle: 'Flows v3',
      compLeftBody: 'Basic forms and static layouts. Routing required heavy backend logic.',
      compRightTitle: 'Flows v4',
      compRightBody: 'Introduces declarative branching, client-side validation, and dynamic UI updates without endpoint calls.',
      quizQ: 'What is a major feature introduced in WhatsApp Flows v4?',
      quizOpts: [
        '- [ ] The ability to send videos inside the Flow.',
        '- [x] Client-side logic and declarative branching using "routing".',
        '- [ ] Removal of the JSON requirement.',
        '- [ ] Integration with Instagram.'
      ]
    },
    ar: {
      compTitle: 'Flows v3 مقابل Flows v4',
      compLeftTitle: 'الإصدار الثالث (Flows v3)',
      compLeftBody: 'نماذج أساسية وتصميمات ثابتة. كان توجيه الشاشات يتطلب منطقاً معقداً من السيرفر.',
      compRightTitle: 'الإصدار الرابع (Flows v4)',
      compRightBody: 'يقدم التوجيه المشروط (Branching)، والتحقق من جانب العميل، وتحديث الواجهة دون الاتصال بالسيرفر.',
      quizQ: 'ما هي الميزة الرئيسية التي تم تقديمها في WhatsApp Flows v4؟',
      quizOpts: [
        '- [ ] القدرة على إرسال فيديوهات داخل الـ Flow.',
        '- [x] المنطق من جانب العميل (Client-side) والتوجيه المشروط.',
        '- [ ] إلغاء الحاجة لاستخدام JSON.',
        '- [ ] الدمج مع إنستغرام.'
      ]
    }
  },
  'whatsapp-interactive-messages': {
    en: {
      compTitle: 'Reply Buttons vs List Messages',
      compLeftTitle: 'Reply Buttons',
      compLeftBody: 'Maximum 3 buttons. Fast, highly visible 1-tap options.',
      compRightTitle: 'List Messages',
      compRightBody: 'Maximum 10 rows. Opens a bottom sheet. Ideal for menus, store locations, or long selections.',
      quizQ: 'What happens if you try to send an Interactive Message with 4 Reply Buttons?',
      quizOpts: [
        '- [ ] WhatsApp automatically converts them into a List.',
        '- [x] The API request fails with a validation error.',
        '- [ ] Only the first 3 buttons are shown.',
        '- [ ] It sends successfully.'
      ]
    },
    ar: {
      compTitle: 'أزرار الرد مقابل رسائل القوائم',
      compLeftTitle: 'أزرار الرد (Reply Buttons)',
      compLeftBody: 'بحد أقصى 3 أزرار. سريعة، وواضحة جداً وتتطلب ضغطة واحدة.',
      compRightTitle: 'رسائل القوائم (List Messages)',
      compRightBody: 'بحد أقصى 10 صفوف. تفتح نافذة سفلية. مثالية لقوائم الطعام أو فروع المتاجر.',
      quizQ: 'ماذا يحدث إذا حاولت إرسال رسالة تفاعلية تحتوي على 4 أزرار رد (Reply Buttons)؟',
      quizOpts: [
        '- [ ] يقوم واتساب بتحويلها تلقائياً إلى قائمة (List).',
        '- [x] يفشل طلب الـ API بخطأ في التحقق (Validation Error).',
        '- [ ] تظهر الأزرار الثلاثة الأولى فقط.',
        '- [ ] يتم الإرسال بنجاح.'
      ]
    }
  },
  'whatsapp-manager-broadcasts': {
    en: {
      compTitle: 'Manager Broadcasts vs API Broadcasts',
      compLeftTitle: 'WhatsApp Manager UI',
      compLeftBody: 'Manual upload of CSV files. Good for small, one-off campaigns without coding.',
      compRightTitle: 'Cloud API Broadcasts (SEEN V2)',
      compRightBody: 'Programmatic sending. Ideal for CRM integrations, dynamic personalization, and massive scale.',
      quizQ: 'When running a broadcast, why is it critical to check the "Template Status" first?',
      quizOpts: [
        '- [ ] To see if the template is translated to Spanish.',
        '- [x] Because sending a PAUSED or REJECTED template will result in 100% failure and waste API limits.',
        '- [ ] Because active templates cost more.',
        '- [ ] It is not necessary; WhatsApp fixes it automatically.'
      ]
    },
    ar: {
      compTitle: 'حملات الواجهة مقابل حملات الـ API',
      compLeftTitle: 'واجهة مدير واتساب',
      compLeftBody: 'رفع ملفات CSV يدوياً. جيد للحملات الصغيرة ولمرة واحدة بدون برمجة.',
      compRightTitle: 'حملات Cloud API (نظام SEEN)',
      compRightBody: 'إرسال برمجي. مثالي للربط مع أنظمة الـ CRM، والتخصيص الديناميكي، والإرسال الضخم.',
      quizQ: 'عند تشغيل حملة إرسال (Broadcast)، لماذا من المهم جداً التحقق من "حالة القالب" أولاً؟',
      quizOpts: [
        '- [ ] لمعرفة ما إذا كان القالب مترجماً.',
        '- [x] لأن إرسال قالب حالته PAUSED أو REJECTED سيفشل بنسبة 100% ويضيع حدود الـ API.',
        '- [ ] لأن القوالب النشطة تكلفتها أعلى.',
        '- [ ] هذا غير ضروري، واتساب يحل المشكلة تلقائياً.'
      ]
    }
  },
  'whatsapp-manager-contacts-tags': {
    en: {
      compTitle: 'Contact Attributes vs Tags',
      compLeftTitle: 'Attributes (Custom Fields)',
      compLeftBody: 'Key-value pairs stored per contact (e.g., Name="John", Age="30"). Used for message personalization.',
      compRightTitle: 'Tags (Labels)',
      compRightBody: 'Markers applied to contacts (e.g., "VIP", "Unpaid"). Used primarily for segmenting broadcast audiences.',
      quizQ: 'How can you use Tags when launching a WhatsApp Campaign?',
      quizOpts: [
        '- [ ] You can insert a Tag as a variable inside the message text.',
        '- [x] You can filter your audience to only send the campaign to users with a specific Tag.',
        '- [ ] Tags automatically change the pricing of the message.',
        '- [ ] Tags determine the language of the template.'
      ]
    },
    ar: {
      compTitle: 'البيانات المخصصة مقابل العلامات (Tags)',
      compLeftTitle: 'البيانات (Attributes)',
      compLeftBody: 'قيم وتفاصيل تخص العميل (الاسم="أحمد"، العمر="30"). تُستخدم لتخصيص محتوى الرسالة.',
      compRightTitle: 'العلامات (Tags/Labels)',
      compRightBody: 'مؤشرات توضع على جهة الاتصال (مثال: "VIP"، "لم يدفع"). تُستخدم بشكل أساسي لفلترة وتصنيف الجمهور.',
      quizQ: 'كيف يمكنك الاستفادة من الـ Tags عند إطلاق حملة واتساب (Campaign)؟',
      quizOpts: [
        '- [ ] يمكنك إدراج الـ Tag كمتغير داخل نص الرسالة.',
        '- [x] يمكنك فلترة جمهورك لإرسال الحملة فقط للمستخدمين الذين يمتلكون Tag محدد.',
        '- [ ] الـ Tags تغير تسعيرة الرسالة تلقائياً.',
        '- [ ] الـ Tags تحدد لغة القالب.'
      ]
    }
  },
  'whatsapp-manager-templates-ui': {
    en: {
      compTitle: 'Header Variables vs Body Variables',
      compLeftTitle: 'Header Variable',
      compLeftBody: 'Only 1 variable allowed ({{1}}). Can be text or media (Image/Video/Document).',
      compRightTitle: 'Body Variables',
      compRightBody: 'Multiple variables allowed ({{1}}, {{2}}). Must be sequential and cannot be at the very start/end without care.',
      quizQ: 'Can you edit a Message Template after it has been APPROVED?',
      quizOpts: [
        '- [ ] No, you must create a completely new template.',
        '- [x] Yes, you can edit it, but it will go through the review process again.',
        '- [ ] Yes, and the changes apply immediately without review.',
        '- [ ] Only the header can be edited.'
      ]
    },
    ar: {
      compTitle: 'متغيرات الترويسة مقابل متغيرات النص',
      compLeftTitle: 'متغير الترويسة (Header)',
      compLeftBody: 'يُسمح بمتغير واحد فقط ({{1}}). يمكن أن يكون نصاً أو وسائط (صورة/فيديو/مستند).',
      compRightTitle: 'متغيرات النص (Body)',
      compRightBody: 'يُسمح بعدة متغيرات ({{1}}, {{2}}). يجب أن تكون متسلسلة ولا توضع في البداية أو النهاية بشكل عشوائي.',
      quizQ: 'هل يمكنك تعديل قالب رسالة (Template) بعد الموافقة عليه (APPROVED)؟',
      quizOpts: [
        '- [ ] لا، يجب إنشاء قالب جديد كلياً.',
        '- [x] نعم يمكنك تعديله، لكنه سيدخل مرحلة المراجعة (Review) من جديد.',
        '- [ ] نعم، والتعديلات تطبق فوراً بدون مراجعة.',
        '- [ ] يمكن تعديل الترويسة (Header) فقط.'
      ]
    }
  },
  'whatsapp-media-messages': {
    en: {
      compTitle: 'Media ID vs Media Link',
      compLeftTitle: 'Media ID',
      compLeftBody: 'You upload the media to Meta\\\'s servers first, get an ID, and send using the ID. Faster delivery.',
      compRightTitle: 'Media Link (URL)',
      compRightBody: 'You provide a public URL. Meta downloads it on the fly. Slower, and fails if your server blocks Meta.',
      quizQ: 'What is the maximum file size for a Video sent via WhatsApp Cloud API?',
      quizOpts: [
        '- [ ] 5 MB',
        '- [x] 16 MB',
        '- [ ] 100 MB',
        '- [ ] 2 GB'
      ]
    },
    ar: {
      compTitle: 'معرّف الوسائط (ID) مقابل رابط الوسائط (URL)',
      compLeftTitle: 'معرّف الوسائط (Media ID)',
      compLeftBody: 'تقوم برفع الملف لسيرفرات Meta أولاً، ثم ترسله عبر المعرف (ID). أسرع في التسليم.',
      compRightTitle: 'رابط الوسائط (Media Link)',
      compRightBody: 'توفر رابطاً عاماً، وتقوم Meta بتحميله لحظة الإرسال. أبطأ، وقد يفشل إذا كان سيرفرك يحظر Meta.',
      quizQ: 'ما هو الحد الأقصى لحجم ملف الفيديو (Video) المرسل عبر WhatsApp Cloud API؟',
      quizOpts: [
        '- [ ] 5 ميجابايت',
        '- [x] 16 ميجابايت',
        '- [ ] 100 ميجابايت',
        '- [ ] 2 جيجابايت'
      ]
    }
  },
  'whatsapp-number-management': {
    en: {
      compTitle: 'WABA vs Phone Number',
      compLeftTitle: 'WhatsApp Business Account (WABA)',
      compLeftBody: 'The umbrella container. Holds your payment methods, templates, and multiple phone numbers.',
      compRightTitle: 'Phone Number',
      compRightBody: 'The actual sender ID. Has its own distinct quality rating, messaging limits, and display name.',
      quizQ: 'How many phone numbers can a verified WABA host by default without requesting an increase?',
      quizOpts: [
        '- [ ] 1',
        '- [ ] 2',
        '- [x] Up to 20',
        '- [ ] Unlimited'
      ]
    },
    ar: {
      compTitle: 'حساب الأعمال (WABA) مقابل رقم الهاتف',
      compLeftTitle: 'حساب أعمال واتساب (WABA)',
      compLeftBody: 'المظلة الرئيسية. يحتوي على طرق الدفع، والقوالب المشتركة، والأرقام المتعددة.',
      compRightTitle: 'رقم الهاتف (Phone Number)',
      compRightBody: 'هوية المرسل الفعلية. يمتلك تقييم جودة خاص، وحدود إرسال منفصلة، واسم عرض خاص به.',
      quizQ: 'كم عدد أرقام الهواتف التي يمكن لحساب WABA الموثق إضافتها افتراضياً (بدون طلب زيادة)؟',
      quizOpts: [
        '- [ ] رقم 1',
        '- [ ] رقمان',
        '- [x] حتى 20 رقماً',
        '- [ ] عدد غير محدود'
      ]
    }
  },
  'whatsapp-product-catalog-messages': {
    en: {
      compTitle: 'Single Product vs Multi-Product',
      compLeftTitle: 'Single Product Message',
      compLeftBody: 'Displays one specific item with a large image and description. User can add directly to cart.',
      compRightTitle: 'Multi-Product Message',
      compRightBody: 'Displays a list of up to 30 items grouped into sections. Great for browsing categories.',
      quizQ: 'Before sending a catalog message, what MUST be linked to your WhatsApp Business Account?',
      quizOpts: [
        '- [ ] An Instagram page.',
        '- [x] A Meta Commerce Manager Catalog.',
        '- [ ] A Shopify WABA plugin.',
        '- [ ] A Stripe payment link.'
      ]
    },
    ar: {
      compTitle: 'منتج واحد مقابل كتالوج متعدد المنتجات',
      compLeftTitle: 'رسالة المنتج الواحد',
      compLeftBody: 'تعرض عنصراً واحداً بصورة كبيرة ووصف. يمكن للمستخدم إضافته للعربة مباشرة.',
      compRightTitle: 'رسالة المنتجات المتعددة',
      compRightBody: 'تعرض قائمة تصل إلى 30 منتجاً مقسمة لأقسام. ممتازة لتصفح الأقسام.',
      quizQ: 'قبل إرسال رسالة كتالوج المنتجات، ماذا يجب أن يكون مرتبطاً بحساب WABA الخاص بك؟',
      quizOpts: [
        '- [ ] صفحة إنستغرام.',
        '- [x] كتالوج في مدير التجارة (Meta Commerce Manager).',
        '- [ ] إضافة شوبيفاي.',
        '- [ ] رابط دفع Stripe.'
      ]
    }
  },
  'whatsapp-template-complete-flow': {
    en: {
      compTitle: 'URL Button vs Complete Flow Button',
      compLeftTitle: 'URL Button',
      compLeftBody: 'Opens an external website in the phone\\\'s browser. Less conversion tracking.',
      compRightTitle: 'Complete Flow Button',
      compRightBody: 'Opens a native WhatsApp Flow inside the chat. Higher conversion and seamless UX.',
      quizQ: 'What is the "navigate_screen" parameter used for in a Complete Flow Button?',
      quizOpts: [
        '- [x] To specify which screen of the Flow should be displayed first when the user taps the button.',
        '- [ ] To redirect the user to a website after the flow.',
        '- [ ] To define the color of the screen.',
        '- [ ] It is a deprecated parameter.'
      ]
    },
    ar: {
      compTitle: 'زر الرابط (URL) مقابل زر إكمال الـ Flow',
      compLeftTitle: 'زر الرابط العادي',
      compLeftBody: 'يفتح موقعاً خارجياً في متصفح الهاتف. تتبع التحويلات فيه أقل كفاءة.',
      compRightTitle: 'زر إكمال الـ Flow',
      compRightBody: 'يفتح واجهة Flow أصلية داخل المحادثة. يحقق معدلات تحويل أعلى وتجربة مستخدم سلسة.',
      quizQ: 'فيمَ يُستخدم معامل "navigate_screen" في زر قالب الـ Flow؟',
      quizOpts: [
        '- [x] لتحديد الشاشة التي يجب أن تظهر أولاً داخل الـ Flow عند ضغط المستخدم على الزر.',
        '- [ ] لتوجيه المستخدم إلى موقع ويب بعد انتهاء الـ Flow.',
        '- [ ] لتحديد لون الشاشة.',
        '- [ ] هو معامل قديم لم يعد يُستخدم.'
      ]
    }
  }
};

const processed = [];

function appendPanels(filePath, data, lang) {
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');
  
  if (text.includes('<!-- panel:comparison -->')) {
    console.log('Skipping (already has panels):', path.basename(filePath));
    return;
  }
  
  const comp = `
<!-- panel:comparison -->
**${data.compTitle}**
- **${data.compLeftTitle}:** ${data.compLeftBody}
- **${data.compRightTitle}:** ${data.compRightBody}
<!-- endpanel -->
`;

  const quiz = `
<!-- panel:quiz -->
${data.quizQ}
${data.quizOpts.join('\n')}
<!-- endpanel -->
`;

  text = text.trim() + '\\n\\n' + comp + '\\n' + quiz + '\\n';
  fs.writeFileSync(filePath, text, 'utf8');
  processed.push(path.basename(filePath));
}

function processDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    if (f.isDirectory()) {
      processDir(path.join(dir, f.name));
    } else if (f.name.endsWith('.md')) {
      const isAr = f.name.endsWith('-ar.md');
      const baseName = f.name.replace('-ar.md', '').replace('.md', '');
      if (dict[baseName]) {
        appendPanels(path.join(dir, f.name), dict[baseName][isAr ? 'ar' : 'en'], isAr ? 'ar' : 'en');
      }
    }
  }
}

processDir(contentDir);
console.log('Successfully added panels to:', processed.length, 'files.');
