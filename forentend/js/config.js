/**
 * ملف الإعدادات الموحد للـ Frontend
 * يكشف تلقائياً البيئة (Development أو Production) ويضبط URLs
 */

class AppConfig {
    constructor() {
        this.init();
    }

    init() {
        const hostname = window.location.hostname;
        const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1';
        
        if (isProduction) {
            // Production - استخدام نفس الدومين
            this.API_BASE_URL = '/api';
            this.SOCKET_URL = window.location.origin;
            this.ENV = 'production';
        } else {
            // Development - استخدام Backend المحلي
            const BACKEND_PORT = 3000;
            this.API_BASE_URL = `http://localhost:${BACKEND_PORT}/api`;
            this.SOCKET_URL = `http://localhost:${BACKEND_PORT}`;
            this.ENV = 'development';
        }
        
        console.log(`🔧 Environment: ${this.ENV}`);
        console.log(`🌐 API Base URL: ${this.API_BASE_URL}`);
        console.log(`🔌 Socket URL: ${this.SOCKET_URL}`);
    }

    getApiUrl(endpoint) {
        // إزالة / في البداية إن وجدت
        endpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        return `${this.API_BASE_URL}/${endpoint}`;
    }

    getSocketUrl() {
        return this.SOCKET_URL;
    }

    isProduction() {
        return this.ENV === 'production';
    }
}

// إنشاء Instance واحدة فقط
const config = new AppConfig();

// تصديرها للاستخدام في باقي الملفات
window.AppConfig = config;
