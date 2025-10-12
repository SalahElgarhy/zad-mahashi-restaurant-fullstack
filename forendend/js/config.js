// Configuration Manager - يدير إعدادات الموقع من متغيرات البيئة
class ConfigManager {
    constructor() {
        this.config = {
            // إعدادات API افتراضية
            API_BASE_URL: 'http://localhost:3000/api',
            SOCKET_URL: 'http://localhost:3000',
            
            // إعدادات الأدمن افتراضية
            ADMIN_ACCESS_CODE: 'zad2024admin',
            ADMIN_CLICK_COUNT: 5,
            ENABLE_ADMIN_ACCESS: false,
            DEBUG_MODE: false,
            
            // معلومات التواصل افتراضية
            ADMIN_PHONE: '01105642820',
            WHATSAPP_NUMBER: '2001105642820',
            
            // البيئة
            NODE_ENV: 'development'
        };
        
        this.loadConfig();
    }

    // تحميل الإعدادات من ملف .env (إذا كان متاحًا)
    async loadConfig() {
        try {
            // في بيئة الإنتاج، يمكن تحميل الإعدادات من API أو ملف خارجي
            if (typeof process !== 'undefined' && process.env) {
                this.config.API_BASE_URL = process.env.API_BASE_URL || this.config.API_BASE_URL;
                this.config.SOCKET_URL = process.env.SOCKET_URL || this.config.SOCKET_URL;
                this.config.ADMIN_PHONE = process.env.ADMIN_PHONE || this.config.ADMIN_PHONE;
                this.config.WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || this.config.WHATSAPP_NUMBER;
                this.config.ENABLE_ADMIN_ACCESS = process.env.ENABLE_ADMIN_ACCESS === 'true';
                this.config.DEBUG_MODE = process.env.DEBUG_MODE === 'true';
            }
        } catch (error) {
            console.warn('تعذر تحميل إعدادات البيئة، سيتم استخدام الإعدادات الافتراضية');
        }
    }

    // الحصول على قيمة إعداد معين
    get(key) {
        return this.config[key];
    }

    // تحديث قيمة إعداد معين
    set(key, value) {
        this.config[key] = value;
    }

    // الحصول على رابط API كامل
    getApiUrl(endpoint) {
        return `${this.config.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }

    // الحصول على رابط واتساب
    getWhatsAppUrl(message = '') {
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${this.config.WHATSAPP_NUMBER}${message ? '?text=' + encodedMessage : ''}`;
    }

    // الحصول على رابط الاتصال
    getPhoneUrl() {
        return `tel:${this.config.ADMIN_PHONE}`;
    }

    // فحص ما إذا كان وضع التطوير مفعل
    isDevelopment() {
        return this.config.NODE_ENV === 'development';
    }

    // فحص ما إذا كان وضع الإنتاج مفعل
    isProduction() {
        return this.config.NODE_ENV === 'production';
    }

    // تسجيل معلومات التكوين (فقط في وضع التطوير)
    logConfig() {
        if (this.config.DEBUG_MODE) {
            console.group('🔧 تكوين التطبيق');
            console.log('🌐 API Base URL:', this.config.API_BASE_URL);
            console.log('📱 Socket URL:', this.config.SOCKET_URL);
            console.log('🛡️ Admin Access:', this.config.ENABLE_ADMIN_ACCESS ? 'مفعل' : 'معطل');
            console.log('🔍 Debug Mode:', this.config.DEBUG_MODE ? 'مفعل' : 'معطل');
            console.log('📞 Phone:', this.config.ADMIN_PHONE);
            console.log('💬 WhatsApp:', this.config.WHATSAPP_NUMBER);
            console.groupEnd();
        }
    }
}

// إنشاء instance عام للتكوين
const appConfig = new ConfigManager();

// إتاحة التكوين للاستخدام العالمي
window.appConfig = appConfig;

// تسجيل التكوين عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    appConfig.logConfig();
    console.log('✅ تم تحميل تكوين التطبيق بنجاح');
});

// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}