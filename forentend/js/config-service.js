// إعدادات API ديناميكية حسب البيئة
class ConfigService {
    constructor() {
        // تحديد البيئة الحالية
        this.isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        this.isProduction = !this.isDevelopment;
        
        // إعدادات API حسب البيئة
        this.config = {
            development: {
                API_BASE_URL: 'http://localhost:3000/api',
                SOCKET_URL: 'http://localhost:3000'
            },
            production: {
                // سيتم تحديثه عند الرفع على Render
                API_BASE_URL: `${window.location.origin}/api`,
                SOCKET_URL: window.location.origin
            }
        };
    }

    // الحصول على رابط API
    getApiUrl() {
        return this.isDevelopment ? 
            this.config.development.API_BASE_URL : 
            this.config.production.API_BASE_URL;
    }

    // الحصول على رابط Socket
    getSocketUrl() {
        return this.isDevelopment ? 
            this.config.development.SOCKET_URL : 
            this.config.production.SOCKET_URL;
    }

    // طباعة معلومات البيئة
    logEnvironment() {
        console.log('🔧 Environment:', this.isDevelopment ? 'Development' : 'Production');
        console.log('🌐 API URL:', this.getApiUrl());
        console.log('📡 Socket URL:', this.getSocketUrl());
    }
}

// إنشاء instance عام
window.configService = new ConfigService();

// طباعة معلومات البيئة
window.configService.logEnvironment();