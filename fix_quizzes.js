const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'content-learn', 'whatsapp');

const replacements = {
  'whatsapp-manager-broadcasts-ar.md': {
    search: `<!-- panel:quiz -->\n**سؤال:**\nإذا قمت بجدولة حملة لغدٍ، أي منطقة زمنية (Time zone) سيستخدمها النظام؟\n\n**إجابة:**\nتستخدم أداة الجدولة **المنطقة الزمنية المحلية** المحددة في إعدادات حساب Meta Business الخاص بك. تأكد دائماً من مراجعة اسم المنطقة الزمنية المكتوب بجوار منتقي الوقت!\n<!-- endpanel -->`,
    replace: `<!-- panel:quiz -->\nإذا قمت بجدولة حملة لغدٍ، أي منطقة زمنية (Time zone) سيستخدمها النظام؟\n- [ ] توقيت المحيط الهادئ (PT) دائماً\n- [ ] التوقيت العالمي المنسق (UTC) حصراً\n- [x] المنطقة الزمنية المحلية المحددة في إعدادات حساب Meta Business الخاص بك\n- [ ] المنطقة الزمنية الخاصة بهاتف العميل\n<!-- endpanel -->`
  },
  'whatsapp-manager-broadcasts.md': {
    search: `<!-- panel:quiz -->\n**Question:**\nIf I schedule a broadcast for tomorrow, which time zone does it use?\n\n**Answer:**\nThe broadcast scheduler uses the **local time zone** configured in your Meta Business account settings. Always double-check the timezone label next to the time picker!\n<!-- endpanel -->`,
    replace: `<!-- panel:quiz -->\nIf I schedule a broadcast for tomorrow, which time zone does it use?\n- [ ] Pacific Time (PT) always\n- [ ] Coordinated Universal Time (UTC) strictly\n- [x] The local time zone configured in your Meta Business account settings\n- [ ] The customer's device time zone\n<!-- endpanel -->`
  },
  'whatsapp-manager-contacts-tags-ar.md': {
    search: `<!-- panel:quiz -->\n**سؤال:**\nهل يمكنني تصنيف العميل تلقائياً بناءً على الرسالة التي يرسلها لي؟\n\n**إجابة:**\n**ليس من خلال الواجهة مباشرة.** واجهة WhatsApp Manager تتيح التصنيف اليدوي أو الجماعي عند الرفع فقط. للتصنيف الآلي بناءً على سلوك العميل في المحادثة، يجب عليك استخدام سكريبت يعتمد على الـ Webhooks أو نظام خارجي للردود الآلية.\n<!-- endpanel -->`,
    replace: `<!-- panel:quiz -->\nهل يمكنني تصنيف العميل تلقائياً بناءً على الرسالة التي يرسلها لي داخل مدير واتساب؟\n- [ ] نعم، يدعم مدير واتساب قواعد الرد الآلي (Auto-rules)\n- [x] لا، ليس من خلال الواجهة. يتطلب التصنيف الآلي سكريبت يعتمد على الـ Webhooks\n- [ ] نعم، لكن فقط للعملاء الموثقين\n- [ ] لا، لا يمكن أبداً إضافة تصنيفات بناءً على الرسائل\n<!-- endpanel -->`
  },
  'whatsapp-manager-contacts-tags.md': {
    search: `<!-- panel:quiz -->\n**Question:**\nCan I automatically tag a user based on the message they send me?\n\n**Answer:**\n**Not natively in the UI.** The WhatsApp Manager UI allows manual tagging or bulk-tagging on upload. For automatic tagging based on chat behavior, you must use a Webhook-driven script or a 3rd-party inbox system.\n<!-- endpanel -->`,
    replace: `<!-- panel:quiz -->\nCan I automatically tag a user based on the message they send me natively in WhatsApp Manager?\n- [ ] Yes, using the built-in auto-rules feature\n- [x] No, not natively. Automatic tagging requires a Webhook-driven script\n- [ ] Yes, but only for verified business accounts\n- [ ] No, it is impossible to tag users based on their messages\n<!-- endpanel -->`
  },
  'whatsapp-manager-templates-ui-ar.md': {
    search: `<!-- panel:quiz -->\n**سؤال:**\nهل يمكنني تعديل نص القالب بعد الموافقة عليه؟\n\n**إجابة:**\n**نعم!** تسمح لك ميتا الآن بتعديل القوالب المعتمدة حتى **10 مرات خلال 30 يوماً**. بمجرد التعديل، يدخل القالب في عملية المراجعة مرة أخرى، ولكن تظل النسخة القديمة فعالة حتى تتم الموافقة على النسخة الجديدة.\n<!-- endpanel -->`,
    replace: `<!-- panel:quiz -->\nهل يمكنني تعديل نص القالب بعد الموافقة عليه من قبل ميتا؟\n- [ ] لا، لا يمكنك تعديل القالب أبداً بمجرد الموافقة عليه\n- [ ] نعم، مرات غير محدودة وفي أي وقت\n- [x] نعم، حتى 10 مرات خلال 30 يوماً، وتظل النسخة القديمة فعالة أثناء المراجعة\n- [ ] نعم، ولكن يتوقف القالب عن العمل فور التعديل حتى تتم مراجعته\n<!-- endpanel -->`
  },
  'whatsapp-manager-templates-ui.md': {
    search: `<!-- panel:quiz -->\n**Question:**\nCan I edit the text of a template after it has been approved?\n\n**Answer:**\n**Yes!** Meta now allows you to edit approved templates up to **10 times in a 30-day window**. Once edited, the template enters the review process again, but the previous version remains active until the new one is approved.\n<!-- endpanel -->`,
    replace: `<!-- panel:quiz -->\nCan I edit the text of a template after it has been approved by Meta?\n- [ ] No, you can never edit a template once approved\n- [ ] Yes, unlimited times and at any moment\n- [x] Yes, up to 10 times in a 30-day window, and the old version remains active during review\n- [ ] Yes, but the template stops working immediately until the new version is approved\n<!-- endpanel -->`
  },
  'whatsapp-template-complete-flow-ar.md': {
    search: `<!-- panel:quiz -->\n**سؤال:**\nهل يمكنك إضافة أكثر من زر \`FLOW\` في قالب واحد؟\n\n**إجابة:**\nلا، تسمح ميتا بزر \`FLOW\` **واحد فقط** لكل قالب رسالة.\n<!-- endpanel -->`,
    replace: `<!-- panel:quiz -->\nهل يمكنك إضافة أكثر من زر \`FLOW\` في قالب رسالة واحد؟\n- [ ] نعم، يمكنك إضافة ما يصل إلى 3 أزرار FLOW\n- [ ] نعم، عدد غير محدود\n- [x] لا، زر FLOW واحد فقط لكل قالب\n- [ ] لا يوجد زر باسم FLOW\n<!-- endpanel -->`
  },
  'whatsapp-template-complete-flow.md': {
    search: `<!-- panel:quiz -->\n**Question:**\nCan you add multiple \`FLOW\` buttons in a single template?\n\n**Answer:**\nNo, Meta only allows **ONE** \`FLOW\` button per template message.\n<!-- endpanel -->`,
    replace: `<!-- panel:quiz -->\nCan you add multiple \`FLOW\` buttons in a single message template?\n- [ ] Yes, up to 3 FLOW buttons\n- [ ] Yes, unlimited buttons\n- [x] No, only ONE FLOW button per template\n- [ ] There is no such thing as a FLOW button\n<!-- endpanel -->`
  }
};

for (const [file, data] of Object.entries(replacements)) {
  const fp = path.join(dir, file);
  if (!fs.existsSync(fp)) continue;
  
  let content = fs.readFileSync(fp, 'utf8');
  
  // To handle crlf vs lf, we'll strip \r from both
  const searchNorm = data.search.replace(/\\r/g, '');
  const contentNorm = content.replace(/\\r/g, '');
  
  if (contentNorm.includes(searchNorm)) {
    content = contentNorm.replace(searchNorm, data.replace);
    fs.writeFileSync(fp, content, 'utf8');
    console.log('Updated ' + file);
  } else {
    console.log('NOT FOUND in ' + file);
  }
}
