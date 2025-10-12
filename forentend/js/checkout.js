// إدارة صفحة إتمام الطلب
document.addEventListener('DOMContentLoaded', function() {
    // إضافة بيانات تجريبية إذا كانت العربة فارغة (للاختبار فقط)
    addTestDataIfEmpty();
    
    loadCartItems();
    setupPaymentMethodToggle();
    setupCardFormatting();
    setupFormSubmission();
});

// إضافة بيانات تجريبية للاختبار
function addTestDataIfEmpty() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    if (cartItems.length === 0) {
        console.log('🧪 إضافة بيانات تجريبية للاختبار...');
        
        const testItems = [
            {
                id: Date.now(),
                name: 'محشي ورق عنب',
                price: 45,
                quantity: 2,
                image: 'images/f1.png',
                category: 'محاشي'
            },
            {
                id: Date.now() + 1,
                name: 'محشي كوسة',
                price: 40,
                quantity: 1,
                image: 'images/f2.png',
                category: 'محاشي'
            }
        ];
        
        localStorage.setItem('cartItems', JSON.stringify(testItems));
        console.log('✅ تم إضافة بيانات تجريبية:', testItems);
    }
}

// تحميل منتجات العربة من التخزين المحلي
function loadCartItems() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    console.log('🛒 بيانات العربة المحملة من localStorage:', cartItems);
    
    if (cartItems.length === 0) {
        checkoutItems.innerHTML = `
            <div class="text-center py-5">
                <i class="fa fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h4>العربة فارغة</h4>
                <p>لم تقم بإضافة أي منتجات بعد</p>
                <a href="menu.html" class="btn btn-primary">تصفح القائمة</a>
            </div>
        `;
        return;
    }
    
    let total = 0;
    let itemsHTML = '';
    
    cartItems.forEach((item, index) => {
        // التأكد من أن السعر والكمية أرقام صحيحة
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        const itemTotal = price * quantity;
        total += itemTotal;
        
        console.log(`📊 منتج ${index}: ${item.name}, سعر: ${price}, كمية: ${quantity}, المجموع: ${itemTotal}`);
        
        itemsHTML += `
            <div class="checkout-item d-flex justify-content-between align-items-center mb-3 p-3 border rounded">
                <div class="item-info d-flex align-items-center">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                    <div class="ml-3">
                        <h6 class="mb-1">${item.name}</h6>
                        <small class="text-muted">${price} ج × ${quantity}</small>
                    </div>
                </div>
                <div class="item-controls d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary mr-2" onclick="updateItemQuantity(${index}, ${quantity - 1})">-</button>
                    <span class="mx-2">${quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary mr-3" onclick="updateItemQuantity(${index}, ${quantity + 1})">+</button>
                    <strong class="text-primary">${itemTotal} ج</strong>
                    <button class="btn btn-sm btn-outline-danger ml-2" onclick="removeItem(${index})"><i class="fa fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    
    checkoutItems.innerHTML = itemsHTML;
    
    // إضافة رسوم التوصيل
    const deliveryFee = 65;
    const totalWithDelivery = total + deliveryFee;
    
    checkoutTotal.innerHTML = `
        <div>المجموع الفرعي: ${total} ج</div>
        <div>رسوم التوصيل: ${deliveryFee} ج</div>
        <div style="border-top: 1px solid #ddd; margin-top: 5px; padding-top: 5px;">
            <strong>المجموع الكلي: ${totalWithDelivery} ج</strong>
        </div>
    `;
}

// تحديث كمية المنتج
function updateItemQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
        removeItem(index);
        return;
    }
    
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    cartItems[index].quantity = newQuantity;
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    loadCartItems();
}

// حذف منتج
function removeItem(index) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    cartItems.splice(index, 1);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    loadCartItems();
}

// العودة للقائمة
function goBackToMenu() {
    window.location.href = 'menu.html';
}

// إعداد تبديل طرق الدفع
function setupPaymentMethodToggle() {
    const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
    const cardSection = document.getElementById('cardSection');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'card') {
                cardSection.style.display = 'block';
                // جعل حقول البطاقة مطلوبة
                cardSection.querySelectorAll('input').forEach(input => {
                    input.setAttribute('required', 'required');
                });
            } else {
                cardSection.style.display = 'none';
                // إزالة وجوب حقول البطاقة
                cardSection.querySelectorAll('input').forEach(input => {
                    input.removeAttribute('required');
                    input.value = '';
                });
            }
        });
    });
}

// تنسيق حقول البطاقة
function setupCardFormatting() {
    // تنسيق رقم البطاقة
    document.addEventListener('input', function(e) {
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
        
        // تنسيق CVV
        if (e.target.name === 'cvv') {
            e.target.value = e.target.value.replace(/[^0-9]/gi, '');
        }
    });
}

// إعداد إرسال النموذج
function setupFormSubmission() {
    const form = document.getElementById('orderForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        if (cartItems.length === 0) {
            alert('العربة فارغة! أضف منتجات أولاً.');
            return;
        }
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // تحضير بيانات الطلب
        const formData = new FormData(form);
        
        console.log('📝 بيانات النموذج:', {
            name: formData.get('customer_name'),
            phone: formData.get('customer_phone'),
            address: formData.get('customer_address'),
            payment_method: formData.get('payment_method')
        });
        
        const orderData = {
            customer: {
                name: formData.get('customer_name'),
                phone: formData.get('customer_phone'),
                address: formData.get('customer_address'),
                notes: formData.get('customer_notes')
            },
            items: cartItems,
            total: cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0),
            payment_method: formData.get('payment_method'),
            date: new Date().toLocaleString('ar-EG')
        };
        
        console.log('📦 بيانات الطلب قبل المعالجة:', orderData);
        
        // إضافة بيانات البطاقة إذا كانت مطلوبة
        if (orderData.payment_method === 'card') {
            orderData.cardDetails = {
                cardholderName: formData.get('cardholder_name'),
                cardNumber: formData.get('card_number'),
                expiryDate: formData.get('expiry_date'),
                cvv: formData.get('cvv')
            };
        }
        
        // إرسال الطلب للباك إند
        const result = await sendOrderToAdmin(orderData);
        
        if (!result.success) {
            return; // الخطأ تم التعامل معه في sendOrderToAdmin
        }
        
        // مسح العربة وإظهار رسالة نجاح
        localStorage.removeItem('cartItems');
        
        // إظهار رسالة نجاح
        document.body.innerHTML = `
            <div class="container mt-5 pt-5">
                <div class="row justify-content-center">
                    <div class="col-md-8 text-center">
                        <div class="card" style="border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 20px;">
                            <div class="card-body p-5">
                                <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px;">
                                    <i class="fa fa-check-circle fa-5x mb-3" style="opacity: 0.9;"></i>
                                    <h2 style="margin: 0; font-weight: 700;">تم إرسال طلبك بنجاح!</h2>
                                </div>
                                
                                <div class="alert alert-info" style="border: none; background: #e3f2fd; border-radius: 15px;">
                                    <h5><i class="fa fa-info-circle"></i> معلومات مهمة</h5>
                                    <p class="mb-2"><strong>رقم الطلب:</strong> #${result.orderId || result._id}</p>
                                    <p class="mb-2"><strong>الحالة:</strong> <span class="badge badge-warning">في الانتظار</span></p>
                                    <p class="mb-0">تم إرسال طلبك مباشرة إلى إدارة المطعم وسيتم التواصل معك خلال دقائق لتأكيد الطلب والتوصيل.</p>
                                </div>
                                
                                <div class="row mt-4">
                                    <div class="col-md-6 mb-3">
                                        <div style="background: #f8f9fa; padding: 20px; border-radius: 15px;">
                                            <i class="fa fa-clock-o fa-2x text-primary mb-2"></i>
                                            <h6>وقت التوصيل المتوقع</h6>
                                            <small class="text-muted">30-45 دقيقة</small>
                                        </div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <div style="background: #f8f9fa; padding: 20px; border-radius: 15px;">
                                            <i class="fa fa-phone fa-2x text-success mb-2"></i>
                                            <h6>خدمة العملاء</h6>
                                            <small class="text-muted">متاحة 24/7</small>
                                        </div>
                                    </div>
                                </div>
                                
                                <hr style="margin: 30px 0;">
                                
                                <div class="d-flex justify-content-center flex-wrap gap-3">
                                    <a href="menu.html" class="btn btn-primary btn-lg" style="border-radius: 25px; padding: 12px 30px;">
                                        <i class="fa fa-shopping-cart"></i> طلب جديد
                                    </a>
                                    <a href="index.html" class="btn btn-outline-secondary btn-lg" style="border-radius: 25px; padding: 12px 30px;">
                                        <i class="fa fa-home"></i> الصفحة الرئيسية
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .gap-3 > * {
                    margin: 0.5rem !important;
                }
            </style>
        `;
    });
}

// إرسال الطلب للباك إند
async function sendOrderToAdmin(orderData) {
    try {
        // إظهار مؤشر التحميل
        showLoadingMessage();
        
        // تحضير بيانات الطلب للباك إند
        const deliveryFee = 65; // رسوم التوصيل
        const totalWithDelivery = orderData.total + deliveryFee;
        
        const backendOrderData = {
            customerName: orderData.customer.name,
            phoneNumber: orderData.customer.phone,
            address: orderData.customer.address,
            notes: orderData.customer.notes || '',
            paymentMethod: getBackendPaymentMethod(orderData.payment_method),
            items: orderData.items.map(item => ({
                productName: item.name,
                quantity: parseInt(item.quantity),
                priceAtOrder: parseFloat(item.price),
                category: item.category || 'عام',
                itemName: item.name
            })),
            totalPrice: totalWithDelivery,
            status: 'pending'
        };
        
        // إضافة بيانات البطاقة إذا كانت موجودة
        if (orderData.payment_method === 'card' && orderData.cardDetails) {
            backendOrderData.cardDetails = {
                number: orderData.cardDetails.cardNumber.replace(/\s/g, ''),
                expiryMonth: orderData.cardDetails.expiryDate.split('/')[0],
                expiryYear: orderData.cardDetails.expiryDate.split('/')[1],
                cvv: orderData.cardDetails.cvv,
                holderName: orderData.cardDetails.cardholderName
            };
            backendOrderData.paymentMethod = 'bank-card';
        }
        
        console.log('🔄 إرسال الطلب للباك إند:', backendOrderData);
        
        // التحقق من صحة البيانات قبل الإرسال
        if (isNaN(backendOrderData.totalPrice)) {
            console.error('❌ totalPrice is NaN:', backendOrderData.totalPrice);
            throw new Error('خطأ في حساب المجموع الكلي');
        }
        
        // التحقق من صحة المنتجات
        const invalidItems = backendOrderData.items.filter(item => 
            !item.productName || isNaN(item.priceAtOrder) || isNaN(item.quantity)
        );
        
        if (invalidItems.length > 0) {
            console.error('❌ بيانات منتجات غير صحيحة:', invalidItems);
            throw new Error('بيانات المنتجات غير صحيحة');
        }
        
        console.log('✅ البيانات صحيحة، جاري الإرسال...');
        
        // إرسال الطلب للباك إند
        const result = await apiService.createOrder(backendOrderData);
        
        console.log('✅ تم إرسال الطلب بنجاح:', result);
        
        // تشغيل صوت إشعار
        playNotificationSound();
        
        return { success: true, orderId: result._id, ...result };
        
    } catch (error) {
        console.error('❌ خطأ في إرسال الطلب:', error);
        
        // إظهار رسالة خطأ مناسبة
        let errorMessage = 'عذراً، حدث خطأ في إرسال الطلب.';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من اتصالك بالإنترنت.';
        } else if (error.message.includes('فشل في عملية الدفع')) {
            errorMessage = error.message;
        }
        
        alert(errorMessage + ' يرجى المحاولة مرة أخرى.');
        hideLoadingMessage();
        return { success: false, error: error.message };
    }
}

// تحويل طريقة الدفع لصيغة الباك إند
function getBackendPaymentMethod(frontendMethod) {
    const methodMap = {
        'cash': 'cash-on-delivery',
        'cash-on-delivery': 'cash-on-delivery',
        'vodafone_cash': 'vodafone-cash',
        'vodafone-cash': 'vodafone-cash',
        'instapay': 'instapay',
        'card': 'bank-card',
        'bank-card': 'bank-card'
    };
    
    console.log('تحويل طريقة الدفع:', frontendMethod, '->', methodMap[frontendMethod]);
    return methodMap[frontendMethod] || 'cash-on-delivery';
}

// إظهار مؤشر التحميل
function showLoadingMessage() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> جاري إرسال الطلب...';
        submitBtn.disabled = true;
    }
}

// إخفاء مؤشر التحميل
function hideLoadingMessage() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa fa-paper-plane"></i> إرسال الطلب';
        submitBtn.disabled = false;
    }
}

// تشغيل صوت إشعار
function playNotificationSound() {
    try {
        // إنشاء صوت إشعار بسيط
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        // في حالة عدم دعم المتصفح للصوت
        console.log('لا يمكن تشغيل صوت الإشعار');
    }
}

// أسماء طرق الدفع
function getPaymentMethodName(method) {
    const methods = {
        'cash': 'الدفع كاش عند الاستلام',
        'vodafone_cash': 'فودافون كاش',
        'instapay': 'انستاباي',
        'card': 'Card or Visa'
    };
    return methods[method] || method;
}