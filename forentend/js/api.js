// خدمة API ذكية للتواصل مع الباك إند
class APIService {
    constructor() {
        // انتظار تحميل Config
        this.initializeAPI();
    }

    initializeAPI() {
        // استخدام AppConfig الجديد
        if (window.AppConfig) {
            this.baseURL = window.AppConfig.API_BASE_URL;
            console.log('🔗 API Service initialized with AppConfig:', this.baseURL);
        } else {
            console.warn('⚠️ AppConfig not loaded yet, using fallback');
            this.baseURL = '/api'; // fallback آمن
        }
    }

    // إعادة تهيئة API URL إذا تغير
    refreshAPIUrl() {
        this.initializeAPI();
    }

    // دالة عامة لطلبات API
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP Error: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            console.error('URL المحاولة:', url);
            
            // رسالة خطأ مفصلة للمطور
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('❌ فشل الاتصال بالخادم. تأكد من:');
                console.error('1. تشغيل Backend على:', this.baseURL);
                console.error('2. إعدادات CORS صحيحة');
                console.error('3. الشبكة متاحة');
            }
            
            throw error;
        }
    }

    // جلب القائمة
    async getMenu() {
        return await this.request('/products');
    }

    // إرسال طلب جديد
    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    // جلب كل الطلبات
    async getAllOrders() {
        return await this.request('/orders');
    }

    // تحديث حالة الطلب
    async updateOrderStatus(orderId, status) {
        return await this.request(`/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
}

// إنشاء instance عام
const apiService = new APIService();

// إضافة للنافذة العامة
window.apiService = apiService;

console.log('🚀 API Service مُحمَّل ومتصل');