# 🔧 دليل إعداد المتغيرات البيئية

## Backend Configuration

### 1. إنشاء ملف `.env` في مجلد `B/`

```bash
cd B
cp .env.example .env
```

### 2. تعديل المتغيرات في `.env`

```env
# Frontend URL - مهم جداً للـ CORS
FRONTEND_URL=http://localhost:8080

# في Production استخدم دومين الاستضافة
FRONTEND_URL=https://yourdomain.com

# CORS Origins
ALLOWED_ORIGINS=http://localhost:8080,https://yourdomain.com
```

## Frontend Configuration

**لا يحتاج إعداد!** 🎉

الـ Frontend يكتشف البيئة تلقائياً:
- **Development**: يستخدم `http://localhost:3000/api`
- **Production**: يستخدم `/api` (نفس الدومين)

### كيف يعمل؟

الملف `js/config.js` يكشف تلقائياً:
```javascript
// إذا كان localhost → Development
// إذا كان دومين آخر → Production
```

## اختبار الإعدادات

### 1. تشغيل Backend
```bash
cd B
npm run dev
```

### 2. تشغيل Frontend
```bash
cd forentend
npm start
```

### 3. التحقق من الاتصال
- افتح المتصفح: `http://localhost:8080/menu.html`
- افتح Console (F12)
- ابحث عن: `🔧 Environment: development`
- يجب أن تظهر المنتجات بدون أخطاء CORS

## Production Deployment

### على Render أو أي استضافة

1. **Backend Environment Variables**:
```env
PORT=10000
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
NODE_ENV=production
```

2. **Frontend**: 
   - لا تحتاج تعديل!
   - سيكتشف تلقائياً أنه Production ويستخدم `/api`

## استكشاف الأخطاء

### خطأ CORS
```
⚠️ CORS blocked request from: http://...
```

**الحل**: تأكد من إضافة الـ URL في `ALLOWED_ORIGINS`

### لا يمكن الاتصال بالخادم
```
❌ فشل الاتصال بالخادم
```

**الحل**: 
1. تأكد من تشغيل Backend
2. افحص `js/config.js` في Console
3. تأكد من Port صحيح (3000 للـ Development)

## ملاحظات مهمة

✅ **Backend**: يستخدم `process.env.FRONTEND_URL` للـ CORS  
✅ **Frontend**: يكتشف البيئة تلقائياً بدون إعدادات  
✅ **Production**: كلاهما على نفس الدومين = لا مشاكل CORS
