// نظام إدارة العربة
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
        this.total = 0;
        this.init();
    }

    init() {
        this.updateCartUI();
        this.bindEvents();
        this.createCartModal();
        this.formatCardInputs();
    }

    // إضافة منتج للعربة
    addItem(name, price, image) {
        const existingItem = this.items.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                name: name,
                price: parseFloat(price),
                image: image,
                quantity: 1,
                id: Date.now(),
                category: 'محاشي' // إضافة الفئة الافتراضية
            });
        }
        
        this.saveToStorage();
        this.updateCartUI();
        this.showAddedMessage(name);
    }

    // حذف منتج من العربة
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveToStorage();
        this.updateCartUI();
    }

    // تحديث كمية المنتج
    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(id);
                return;
            }
        }
        this.saveToStorage();
        this.updateCartUI();
    }

    // حفظ في التخزين المحلي
    saveToStorage() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }

    // حساب المجموع
    calculateTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    // حساب إجمالي عدد العناصر
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // تحديث واجهة العربة
    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const navCartCount = document.getElementById('navCartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        // عدد المنتجات
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // تحديث عداد العربة الثابتة
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
        }
        
        // تحديث عداد العربة في الـ navigation
        if (navCartCount) {
            navCartCount.textContent = totalItems;
            navCartCount.style.display = totalItems > 0 ? 'inline' : 'none';
        }

        // قائمة المنتجات
        if (cartItems) {
            cartItems.innerHTML = '';
            this.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
                        <div>
                            <h6>${item.name}</h6>
                            <p>${item.price} ج</p>
                        </div>
                    </div>
                    <div class="cart-item-controls">
                        <input type="number" value="${item.quantity}" min="1" onchange="cart.updateQuantity(${item.id}, this.value)" style="width: 50px;">
                        <button onclick="cart.removeItem(${item.id})" class="btn btn-sm btn-danger">حذف</button>
                    </div>
                `;
                cartItems.appendChild(itemDiv);
            });
        }

        // المجموع
        this.total = this.calculateTotal();
        if (cartTotal) {
            cartTotal.textContent = this.total + ' ج';
        }
    }

    // ربط الأحداث
    bindEvents() {
        // إضافة منتج عند الضغط على أيقونة العربة في المنتجات
        document.addEventListener('click', (e) => {
            if (e.target.closest('.fa-shopping-cart') && e.target.closest('.box')) {
                e.preventDefault();
                const box = e.target.closest('.box');
                const name = box.querySelector('h5').textContent;
                const price = box.querySelector('h6').textContent.replace('ج', '').trim();
                const image = box.querySelector('img').src;
                
                this.addItem(name, price, image);
            }
        });

        // ربط العربة في الـ navigation
        const navCartLink = document.querySelector('.cart_link');
        if (navCartLink) {
            navCartLink.addEventListener('click', (e) => {
                e.preventDefault();
                $('#cartModal').modal('show');
            });
        }
    }

    // إنشاء نافذة العربة
    createCartModal() {
        const cartHTML = `
        <!-- أيقونة العربة الثابتة -->
        <div id="cartIcon" style="position: fixed; bottom: 70px; right: 20px; z-index: 1000; background: #ffbe33; padding: 15px; border-radius: 50%; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
            <i class="fa fa-shopping-cart" style="color: white; font-size: 20px;"></i>
            <span id="cartCount" style="position: absolute; top: -5px; right: -5px; background: red; color: white; border-radius: 50%; width: 20px; height: 20px; text-align: center; font-size: 12px; line-height: 20px; display: none;">0</span>
        </div>

        <!-- نافذة العربة -->
        <div id="cartModal" class="modal fade" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">عربة التسوق</h5>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="cartItems"></div>
                        <hr>
                        <div class="text-right">
                            <h4>المجموع: <span id="cartTotal">0 ج</span></h4>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">إغلاق</button>
                        <button type="button" class="btn btn-primary" onclick="cart.checkout()">إتمام الطلب</button>
                    </div>
                </div>
            </div>
        </div>


        `;

        document.body.insertAdjacentHTML('beforeend', cartHTML);

        // ربط أحداث النوافذ
        document.getElementById('cartIcon').onclick = () => {
            $('#cartModal').modal('show');
        };

        // مراقبة تغيير طريقة الدفع
        document.addEventListener('change', (e) => {
            if (e.target.id === 'paymentMethodSelect' && e.target.value === 'card') {
                // إخفاء نافذة الطلب وإظهار نافذة الفيزا
                $('#checkoutModal').modal('hide');
                setTimeout(() => {
                    $('#cardDetailsModal').modal('show');
                }, 300);
            }
        });
    }

    // عرض رسالة إضافة المنتج
    showAddedMessage(productName) {
        const message = document.createElement('div');
        message.className = 'alert alert-success';
        message.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1001; width: 300px;';
        message.innerHTML = `تم إضافة "${productName}" للعربة ✅`;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // صفحة إتمام الطلب
    checkout() {
        if (this.items.length === 0) {
            alert('العربة فارغة!');
            return;
        }

        // حفظ العربة والانتقال لصفحة إتمام الطلب
        this.saveToStorage();
        window.location.href = 'checkout.html';
    }

    // إرسال الطلب
    submitOrder() {
        const form = document.getElementById('checkoutForm');
        const formData = new FormData(form);
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // تحضير بيانات الطلب
        const orderData = {
            customer: {
                name: formData.get('customer_name'),
                address: formData.get('customer_address'),
                phone: formData.get('customer_phone'),
                notes: formData.get('customer_notes')
            },
            items: this.items,
            total: this.total,
            payment_method: formData.get('payment_method'),
            cardDetails: this.cardDetails || null,
            date: new Date().toLocaleString('ar-EG')
        };

        // إرسال للباك إند أولاً
        this.sendOrderToBackend(orderData);
        
        // رسالة واتساب (غيّر الرقم برقم المطعم الحقيقي)
        const whatsappMessage = this.createWhatsAppMessage(orderData);
        const whatsappUrl = `https://wa.me/2001105642820?text=${encodeURIComponent(whatsappMessage)}`;
        
        // فتح واتساب
        window.open(whatsappUrl, '_blank');
        
        // تنظيف العربة
        this.items = [];
        this.saveToStorage();
        this.updateCartUI();
        
        $('#checkoutModal').modal('hide');
        
        alert('تم إرسال طلبك! سيتم التواصل معك قريباً.');
    }

    // إرسال الطلب للباك إند
    async sendOrderToBackend(orderData) {
        try {
            console.log('📤 إرسال الطلب للباك إند:', orderData);
            
            // تحويل طريقة الدفع للباك إند
            let paymentMethod = orderData.payment_method || 'cash';
            const paymentMapping = {
                'cash': 'cash-on-delivery',
                'vodafone_cash': 'vodafone-cash',
                'instapay': 'instapay',
                'card': 'bank-card'  // تصحيح القيمة
            };
            paymentMethod = paymentMapping[paymentMethod] || 'cash-on-delivery';
            
            // حساب إجمالي العناصر
            const itemsTotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // إضافة رسوم التوصيل
            const deliveryFee = 65;
            const totalWithDelivery = itemsTotal + deliveryFee;
            
            // تحويل البيانات لتوافق الباك إند الجديد
            const backendOrderData = {
                customerName: orderData.customer.name,
                phoneNumber: orderData.customer.phone,
                address: orderData.customer.address,
                notes: orderData.customer.notes || '',
                paymentMethod: paymentMethod,
                items: orderData.items.map(item => ({
                    productName: item.name,
                    quantity: parseInt(item.quantity),
                    priceAtOrder: parseFloat(item.price),
                    category: item.category || 'محاشي',
                    itemName: item.name
                })),
                totalPrice: parseFloat(totalWithDelivery.toFixed(2)),
                cardDetails: orderData.cardDetails
            };
            
            console.log('📝 بيانات الطلب المحولة:', backendOrderData);
            
            // استخدام AppConfig للحصول على URL الصحيح
            const apiUrl = window.AppConfig ? 
                window.AppConfig.getApiUrl('orders') : 
                '/api/orders';
            
            console.log('🌐 إرسال الطلب إلى:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(backendOrderData)
            });
            
            console.log('📡 Response Status:', response.status, response.statusText);
            
            if (!response.ok) {
                console.error('❌ HTTP Error:', response.status);
                const errorText = await response.text();
                console.error('❌ Error Response:', errorText);
                alert(`فشل في إرسال الطلب: ${response.status} ${response.statusText}`);
                return;
            }
            
            const result = await response.json();
            console.log('✅ نتيجة إرسال الطلب:', result);
            
            if (result.success) {
                console.log('🎉 تم إرسال الطلب بنجاح للباك إند');
                console.log('📦 Order ID:', result._id);
                console.log('💰 Total Price:', result.totalPrice);
                console.log('📋 Status:', result.status);
            } else {
                console.error('❌ فشل في إرسال الطلب:', result.message);
                alert(`فشل في إرسال الطلب: ${result.message || 'خطأ غير معروف'}`);
            }
            
        } catch (error) {
            console.error('❌ خطأ في إرسال الطلب للباك إند:', error);
            console.error('❌ Error Details:', error.message);
            alert(`خطأ في الاتصال بالخادم: ${error.message}`);
        }
    }

    // إنشاء رسالة واتساب
    createWhatsAppMessage(orderData) {
        let message = `🍽️ *طلب جديد من مطعم زاد*\n\n`;
        message += `👤 *بيانات العميل:*\n`;
        message += `الاسم: ${orderData.customer.name}\n`;
        message += `التليفون: ${orderData.customer.phone}\n`;
        message += `العنوان: ${orderData.customer.address}\n`;
        
        if (orderData.customer.notes) {
            message += `ملاحظات: ${orderData.customer.notes}\n`;
        }
        
        message += `\n🛒 *تفاصيل الطلب:*\n`;
        orderData.items.forEach(item => {
            message += `• ${item.name}\n`;
            message += `  الكمية: ${item.quantity}\n`;
            message += `  السعر: ${item.price} ج\n`;
            message += `  المجموع: ${item.price * item.quantity} ج\n\n`;
        });
        
        message += `💰 *المجموع الكلي: ${orderData.total} ج*\n`;
        message += `💳 *طريقة الدفع: ${this.getPaymentMethodName(orderData.payment_method)}*\n`;
        
        // إضافة بيانات البطاقة (مع إخفاء التفاصيل الحساسة)
        if (orderData.cardDetails) {
            message += `\n💳 *بيانات البطاقة:*\n`;
            message += `اسم حامل البطاقة: ${orderData.cardDetails.cardholderName}\n`;
            message += `رقم البطاقة: **** **** **** ${orderData.cardDetails.cardNumber.slice(-4)}\n`;
            message += `تاريخ الانتهاء: ${orderData.cardDetails.expiryDate}\n`;
        }
        
        message += `📅 *تاريخ الطلب: ${orderData.date}*`;
        
        return message;
    }

    // أسماء طرق الدفع بالعربية
    getPaymentMethodName(method) {
        const methods = {
            'cash': 'كاش',
            'vodafone_cash': 'فودافون كاش',
            'instapay': 'انستاباي',
            'card': 'Card or Visa'
        };
        return methods[method] || method;
    }

    // العودة لنافذة إتمام الطلب من نافذة الفيزا
    backToCheckout() {
        $('#cardDetailsModal').modal('hide');
        setTimeout(() => {
            // إعادة تعيين طريقة الدفع لفارغ
            document.getElementById('paymentMethodSelect').value = '';
            $('#checkoutModal').modal('show');
        }, 300);
    }

    // تأكيد بيانات الفيزا والعودة لإتمام الطلب
    confirmCardDetails() {
        const cardForm = document.getElementById('cardDetailsForm');
        
        if (!cardForm.checkValidity()) {
            cardForm.reportValidity();
            return;
        }

        // حفظ بيانات الفيزا مؤقتاً
        const formData = new FormData(cardForm);
        this.cardDetails = {
            cardholderName: formData.get('cardholder_name'),
            cardNumber: formData.get('card_number'),
            expiryDate: formData.get('expiry_date'),
            cvv: formData.get('cvv')
        };

        $('#cardDetailsModal').modal('hide');
        setTimeout(() => {
            $('#checkoutModal').modal('show');
            // إظهار رسالة تأكيد
            const confirmMessage = document.createElement('div');
            confirmMessage.className = 'alert alert-success mb-3';
            confirmMessage.innerHTML = '<i class="fa fa-check-circle"></i> تم حفظ بيانات البطاقة بنجاح';
            document.querySelector('#checkoutModal .modal-body').insertBefore(confirmMessage, document.querySelector('#checkoutForm'));
            
            setTimeout(() => {
                confirmMessage.remove();
            }, 3000);
        }, 300);
    }

    // تنسيق أرقام البطاقة أثناء الكتابة
    formatCardInputs() {
        // تنسيق رقم البطاقة
        document.addEventListener('input', (e) => {
            if (e.target.name === 'card_number') {
                let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            }
            
            // تنسيق تاريخ الانتهاء
            if (e.target.name === 'expiry_date') {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            }
            
            // تنسيق CVV (أرقام فقط)
            if (e.target.name === 'cvv') {
                e.target.value = e.target.value.replace(/[^0-9]/gi, '');
            }
        });
    }

    // مسح العربة
    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.updateCartUI();
    }
}

// تشغيل النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.cart = new ShoppingCart();
});