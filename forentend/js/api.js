// خدمة API بسيطة للتواصل مع الباك إند
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
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
            throw error;
        }
    }

    // جلب القائمة
    async getMenu() {
        try {
            const response = await fetch('http://localhost:3000/api/products');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching menu:', error);
            return [];
        }
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