// HTTP Server بسيط للفرونت إند
const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname, '.')));

// إعادة توجيه الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 Frontend Server running on http://localhost:${PORT}`);
    console.log(`📋 Menu: http://localhost:${PORT}/menu.html`);
    console.log(`🛒 Checkout: http://localhost:${PORT}/checkout.html`);
    console.log(`👤 Admin: http://localhost:${PORT}/admin.html`);
});