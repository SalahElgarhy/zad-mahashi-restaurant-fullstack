const serverless = require('serverless-http');
const app = require('./B/index.js'); // استيراد تطبيق Express

// تصدير Lambda handler
module.exports.handler = serverless(app);