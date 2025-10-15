# 🚀 AWS Deployment Guide - Zad Mahashi Restaurant

## 📋 خطوات الرفع على AWS:

### 1️⃣ **إعداد AWS CLI:**
```bash
# تثبيت AWS CLI
pip install awscli

# تكوين AWS credentials
aws configure
# AWS Access Key ID: your_access_key
# AWS Secret Access Key: your_secret_key
# Default region: us-east-1
# Default output format: json
```

### 2️⃣ **إعداد SAM CLI:**
```bash
# تثبيت SAM CLI
pip install aws-sam-cli

# أو على Windows
choco install aws-sam-cli
```

### 3️⃣ **الرفع على AWS:**

#### **أ) رفع Backend (Lambda + API Gateway):**
```bash
# بناء التطبيق
sam build

# رفع التطبيق
sam deploy --guided

# في أول مرة ستحتاج إلى:
# Stack Name: zad-mahashi-stack
# AWS Region: us-east-1
# Parameter Environment: production
```

#### **ب) رفع Frontend (S3 + CloudFront):**
```bash
# إنشاء S3 bucket
aws s3 mb s3://zad-mahashi-frontend

# رفع ملفات Frontend
aws s3 sync forentend/ s3://zad-mahashi-frontend

# تفعيل Static Website Hosting
aws s3 website s3://zad-mahashi-frontend --index-document index.html
```

### 4️⃣ **Environment Variables في AWS:**

#### **Lambda Environment Variables:**
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://salahaldenahmed2003:salah1514@cluster0.2p6gt.mongodb.net/mahashi-zad-restaurant
JWT_SECRET=$2y$10$bKNZv0CxvIpNxMLBeSojFO9DiIysxZqOzvV/Oswqgh7mCQUGPPNLC
ADMIN_PASSWORD=zad2024admin
AWS_REGION=us-east-1
```

### 5️⃣ **الروابط بعد الرفع:**

#### **Frontend (S3 + CloudFront):**
- Static Website: `http://zad-mahashi-frontend.s3-website-us-east-1.amazonaws.com`
- CloudFront: `https://d1234567890.cloudfront.net`

#### **Backend (Lambda + API Gateway):**
- API Gateway: `https://abcd1234.execute-api.us-east-1.amazonaws.com/production`

### 6️⃣ **تحديث Frontend للاتصال بـ Backend:**

في ملفات JavaScript بتاعة Frontend، غير:
```javascript
// من
const API_BASE_URL = 'http://localhost:3000/api';

// إلى
const API_BASE_URL = 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/production/api';
```

### 7️⃣ **مراقبة التطبيق:**

#### **CloudWatch Logs:**
```bash
# عرض logs
aws logs describe-log-groups
aws logs tail /aws/lambda/zad-mahashi-backend-production
```

#### **تكاليف AWS:**
- **Lambda:** مجاني حتى 1 مليون طلب/شهر
- **API Gateway:** مجاني حتى 1 مليون استدعاء/شهر
- **S3:** مجاني حتى 5GB
- **CloudFront:** مجاني حتى 50GB transfer

### 8️⃣ **حل المشاكل الشائعة:**

#### **CORS Issues:**
في Backend، تأكد من:
```javascript
app.use(cors({
  origin: [
    'https://d1234567890.cloudfront.net',
    'http://zad-mahashi-frontend.s3-website-us-east-1.amazonaws.com'
  ]
}));
```

#### **Environment Variables:**
تأكد من وضع جميع المتغيرات في AWS Lambda Console.

### 9️⃣ **التحديثات:**
```bash
# لتحديث Backend
sam build && sam deploy

# لتحديث Frontend
aws s3 sync forentend/ s3://zad-mahashi-frontend
```

### 🔟 **الأمان:**
- ✅ جميع ملفات `.env` محمية ومش مرفوعة
- ✅ صفحات الأدمن محمية
- ✅ API محمي بـ CORS
- ✅ SSL/TLS مفعل عبر CloudFront

---

## 🎯 **الخلاصة:**
- **Frontend**: S3 + CloudFront (CDN سريع)
- **Backend**: Lambda + API Gateway (Serverless)
- **Database**: MongoDB Atlas (السحابة)
- **المراقبة**: CloudWatch
- **التكلفة**: مجاني تقريباً للاستخدام الخفيف

**مشروعك هيكون على AWS بأعلى جودة وأمان! 🚀**