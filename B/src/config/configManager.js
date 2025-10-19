/**
 * Configuration Manager
 * يضبط كل الإعدادات تلقائياً حسب البيئة
 * يشتغل على أي استضافة بدون تعديل!
 */

import dotenv from 'dotenv';
dotenv.config();

class ConfigManager {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.isProduction = this.env === 'production';
    this.isDevelopment = this.env === 'development';
    
    this.validateConfig();
    this.setupConfig();
  }

  /**
   * التحقق من المتغيرات المطلوبة
   */
  validateConfig() {
    const required = ['MONGODB_URI', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('\n❌ ========== CONFIGURATION ERROR ==========');
      console.error('❌ المتغيرات المفقودة:', missing.join(', '));
      console.error('❌ يرجى إضافتها في ملف .env أو في لوحة تحكم الاستضافة');
      console.error('==========================================\n');
      
      if (this.isProduction) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
      }
    }
  }

  /**
   * إعداد Configuration
   */
  setupConfig() {
    this.config = {
      // Server
      port: this.getPort(),
      host: this.getHost(),
      env: this.env,
      
      // Database
      mongoUri: process.env.MONGODB_URI,
      
      // Security
      jwtSecret: process.env.JWT_SECRET,
      adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
      
      // CORS
      frontendUrl: this.getFrontendUrl(),
      allowedOrigins: this.getAllowedOrigins(),
      
      // Features
      enableLogging: this.getEnableLogging(),
      debugMode: this.getDebugMode(),
    };
  }

  /**
   * الحصول على البورت الصحيح
   * يشتغل على أي استضافة!
   */
  getPort() {
    // معظم الاستضافات بتحدد PORT تلقائياً
    // Render, Heroku, Railway, AWS, Google Cloud, Azure
    return parseInt(process.env.PORT || '3000');
  }

  /**
   * الحصول على Host الصحيح
   */
  getHost() {
    // في Production لازم نسمع على 0.0.0.0 (كل الـ IPs)
    // في Development ممكن localhost
    return this.isProduction ? '0.0.0.0' : 'localhost';
  }

  /**
   * الحصول على Frontend URL
   */
  getFrontendUrl() {
    if (process.env.FRONTEND_URL) {
      return process.env.FRONTEND_URL;
    }
    
    // في Development
    if (this.isDevelopment) {
      return 'http://localhost:8080';
    }
    
    // في Production - حاول تخمين من الـ Environment
    // بعض الاستضافات بتوفر RENDER_EXTERNAL_URL أو HEROKU_APP_NAME
    if (process.env.RENDER_EXTERNAL_URL) {
      return process.env.RENDER_EXTERNAL_URL;
    }
    
    if (process.env.HEROKU_APP_NAME) {
      return `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
    }
    
    // افتراضي
    console.warn('⚠️  FRONTEND_URL not set, using localhost');
    return 'http://localhost:8080';
  }

  /**
   * الحصول على Allowed Origins للـ CORS
   */
  getAllowedOrigins() {
    if (process.env.ALLOWED_ORIGINS) {
      return process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim());
    }
    
    // في Development - السماح لكل localhost ports
    if (this.isDevelopment) {
      return [
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:5173',
      ];
    }
    
    // في Production - استخدم Frontend URL
    return [this.getFrontendUrl()];
  }

  /**
   * هل Logging مفعّل؟
   */
  getEnableLogging() {
    if (process.env.ENABLE_LOGGING !== undefined) {
      return process.env.ENABLE_LOGGING === 'true';
    }
    // في Development مفعّل، في Production مش مفعّل
    return this.isDevelopment;
  }

  /**
   * هل Debug Mode مفعّل؟
   */
  getDebugMode() {
    if (process.env.DEBUG_MODE !== undefined) {
      return process.env.DEBUG_MODE === 'true';
    }
    // في Development مفعّل، في Production مش مفعّل
    return this.isDevelopment;
  }

  /**
   * طباعة Configuration
   */
  print() {
    console.log('\n🔧 ========== CONFIGURATION ==========');
    console.log(`📍 Environment: ${this.config.env}`);
    console.log(`🌐 Host: ${this.config.host}`);
    console.log(`🚪 Port: ${this.config.port}`);
    console.log(`🖥️  Frontend URL: ${this.config.frontendUrl}`);
    console.log(`🔐 CORS Origins: ${this.config.allowedOrigins.join(', ')}`);
    console.log(`💾 Database: ${this.config.mongoUri ? 'Configured ✅' : 'Missing ❌'}`);
    console.log(`🔑 JWT Secret: ${this.config.jwtSecret ? 'Set ✅' : 'Missing ❌'}`);
    console.log(`📝 Logging: ${this.config.enableLogging ? 'Enabled' : 'Disabled'}`);
    console.log(`🐛 Debug Mode: ${this.config.debugMode ? 'Enabled' : 'Disabled'}`);
    console.log('====================================\n');
  }

  /**
   * الحصول على Configuration
   */
  get() {
    return this.config;
  }
}

// إنشاء Instance واحدة
const configManager = new ConfigManager();

// طباعة Configuration عند التشغيل
if (configManager.config.debugMode) {
  configManager.print();
}

export default configManager;
export const config = configManager.get();
