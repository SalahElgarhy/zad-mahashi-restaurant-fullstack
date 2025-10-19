// Auto API Configuration - يكتشف البيئة تلقائياً
class AutoAPIConfig {
    constructor() {
        this.detectEnvironment();
        this.setAPIUrls();
    }

    detectEnvironment() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            this.environment = 'development';
        } else if (hostname.includes('onrender.com')) {
            this.environment = 'render';
        } else if (hostname.includes('vercel.app')) {
            this.environment = 'vercel';
        } else if (hostname.includes('herokuapp.com')) {
            this.environment = 'heroku';
        } else {
            this.environment = 'production';
        }

        console.log(`🌍 Environment detected: ${this.environment}`);
        console.log(`🌐 Hostname: ${hostname}`);
    }

    setAPIUrls() {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;

        switch (this.environment) {
            case 'development':
                // Development - Backend on different port
                this.API_BASE_URL = 'http://localhost:3000/api';
                this.SOCKET_URL = 'http://localhost:3000';
                break;

            case 'render':
            case 'production':
            default:
                // Production - Same domain/port
                this.API_BASE_URL = `${protocol}//${hostname}${port ? ':' + port : ''}/api`;
                this.SOCKET_URL = `${protocol}//${hostname}${port ? ':' + port : ''}`;
                break;
        }

        console.log(`🔗 API Base URL: ${this.API_BASE_URL}`);
        console.log(`📡 Socket URL: ${this.SOCKET_URL}`);
    }

    getAPIUrl(endpoint = '') {
        return `${this.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }

    getSocketUrl() {
        return this.SOCKET_URL;
    }

    // Test API Connection
    async testConnection() {
        try {
            console.log('🔍 Testing API connection...');
            const response = await fetch(this.getAPIUrl('/health'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('✅ API connection successful');
                return true;
            } else {
                console.warn('⚠️ API returned:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ API connection failed:', error);
            return false;
        }
    }
}

// إنشاء instance عالمي
window.apiConfig = new AutoAPIConfig();

// Auto-test connection when ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.apiConfig.testConnection();
    }, 1000);
});

console.log('✅ Auto API Config loaded successfully');