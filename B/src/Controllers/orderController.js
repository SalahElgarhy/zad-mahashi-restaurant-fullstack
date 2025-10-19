import Order from '../DB/modules/Order.js';
import { asyncHandler } from '../utils/errorHandler/asyncHandler.js';
import { io } from '../../index.js'; // استيراد io من index.js
import { processCardPayment, refundPayment } from '../services/paymentService.js';

export const createOrder = asyncHandler(async (req, res, next) => {
    console.log('\n🆕 ========== طلب جديد وارد ==========');
    const { customerName, phoneNumber, address, notes, paymentMethod, items, status, cardDetails } = req.body;
    console.log('🔄 Received order data:', JSON.stringify(req.body, null, 2));
    console.log('💳 Payment method:', paymentMethod);
    console.log('💳 Card details:', cardDetails);
    
    // التحقق من البيانات المطلوبة
    if (!customerName || !phoneNumber || !address || !items || !Array.isArray(items) || items.length === 0) {
        console.error('❌ بيانات ناقصة في الطلب!');
        console.error('❌ customerName:', customerName ? '✅' : '❌');
        console.error('❌ phoneNumber:', phoneNumber ? '✅' : '❌');
        console.error('❌ address:', address ? '✅' : '❌');
        console.error('❌ items:', items && Array.isArray(items) ? `✅ (${items.length})` : '❌');
        
        return res.status(400).json({ 
            success: false,
            message: 'Missing required fields',
            required: ['customerName', 'phoneNumber', 'address', 'items'],
            received: {
                customerName: !!customerName,
                phoneNumber: !!phoneNumber,
                address: !!address,
                items: items && Array.isArray(items) ? items.length : 0
            }
        });
    }

    try {
        // حساب السعر الإجمالي
        const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.priceAtOrder), 0);
        
        let paymentResult = null;
        let orderStatus = status || 'pending';

        // معالجة الدفع بالبطاقة البنكية
        if (paymentMethod === 'bank-card') {
            if (!cardDetails) {
                return res.status(400).json({
                    success: false,
                    message: 'بيانات البطاقة مطلوبة للدفع بالبطاقة البنكية'
                });
            }

            console.log('💳 Processing card payment...');
            paymentResult = await processCardPayment(cardDetails, totalPrice, null);
            
            if (!paymentResult.success) {
                return res.status(400).json({
                    success: false,
                    message: `فشل في عملية الدفع: ${paymentResult.error}`,
                    errorCode: paymentResult.errorCode
                });
            }

            // إذا نجح الدفع، غير حالة الطلب
            orderStatus = 'paid';
            console.log('✅ Payment successful:', paymentResult.transactionId);
        }
        
        // إنشاء الطلب
        const orderData = { 
            customerName, 
            phoneNumber, 
            address, 
            notes, 
            paymentMethod, 
            totalPrice, 
            items, 
            status: orderStatus 
        };

        // إضافة بيانات الدفع إذا كان الدفع بالبطاقة
        if (paymentResult) {
            orderData.paymentDetails = {
                transactionId: paymentResult.transactionId,
                paymentStatus: 'completed',
                processingFee: paymentResult.processingFee,
                paidAt: new Date()
            };
            // حفظ آخر 4 أرقام من البطاقة فقط للأمان
            orderData.cardDetails = {
                lastFourDigits: cardDetails.number.slice(-4),
                cardType: getCardType(cardDetails.number)
            };
        }

        const order = await Order.create(orderData);

        console.log('✅ ========== الطلب تم إنشاؤه بنجاح! ==========');
        console.log('📦 Order ID:', order._id);
        console.log('👤 Customer:', order.customerName);
        console.log('📞 Phone:', order.phoneNumber);
        console.log('💰 Total:', order.totalPrice);
        console.log('📋 Status:', order.status);
        console.log('🔢 Items Count:', order.items.length);
        console.log('⏰ Created At:', order.createdAt);
        console.log('===============================================\n');

        // إرسال إشعار فوري للأدمن عبر Socket.IO
        const orderObject = order.toObject();
        io.emit('newOrder', {
            ...orderObject,
            timestamp: new Date(),
            type: 'new_order'
        });

        console.log('📡 Socket event "newOrder" sent to admin dashboard');
        console.log('📡 Socket Data:', JSON.stringify(orderObject, null, 2));

        // إرجاع الطلب للعميل
        const response = {
            success: true,
            message: paymentMethod === 'bank-card' ? 'تم الدفع والطلب بنجاح' : 'تم إرسال الطلب بنجاح',
            _id: order._id,
            totalPrice: order.totalPrice,
            status: order.status,
            customerName: order.customerName
        };

        // إضافة معلومات الدفع إذا كان الدفع بالبطاقة
        if (paymentResult) {
            response.paymentDetails = {
                transactionId: paymentResult.transactionId,
                paidAmount: paymentResult.amount,
                processingFee: paymentResult.processingFee
            };
        }

        res.status(201).json(response);
    } catch (error) {
        console.error('❌ Error creating order:', error);
        next(error);
    }
});

// وظيفة مساعدة لتحديد نوع البطاقة
const getCardType = (cardNumber) => {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'American Express';
    return 'Unknown';
};

export const updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            success: false,
            message: 'Invalid status',
            validStatuses
        });
    }

    try {
        const order = await Order.findByIdAndUpdate(
            orderId, 
            { status }, 
            { new: true, runValidators: true }
        );
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        console.log(`✅ Order ${orderId} status updated to: ${status}`);

        // إرسال تحديث فوري للأدمن عبر Socket.IO
        io.emit('orderUpdated', {
            ...order.toObject(),
            timestamp: new Date(),
            type: 'status_update'
        });

        console.log('📡 Status update sent to admin dashboard');

        res.json({ 
            success: true, 
            message: 'Status updated successfully', 
            order 
        });
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        next(error);
    }
});

export const deleteOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    
    try {
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        let refundResult = null;

        // إذا كان الطلب مدفوع بالبطاقة، نحتاج استرداد المبلغ
        if (order.paymentMethod === 'bank-card' && order.paymentDetails?.transactionId) {
            console.log('💳 Processing refund for paid order...');
            refundResult = await refundPayment(order.paymentDetails.transactionId, order.totalPrice);
            
            if (!refundResult.success) {
                return res.status(400).json({
                    success: false,
                    message: `فشل في استرداد المبلغ: ${refundResult.error}. تواصل مع الدعم الفني.`,
                    errorCode: refundResult.errorCode
                });
            }

            console.log('✅ Refund successful:', refundResult.refundId);
        }

        // حذف الطلب
        await Order.findByIdAndDelete(orderId);

        console.log(`✅ Order ${orderId} deleted successfully`);

        // إرسال تحديث فوري للأدمن عبر Socket.IO
        io.emit('orderDeleted', {
            _id: orderId,
            customerName: order.customerName,
            refunded: refundResult ? true : false,
            refundId: refundResult?.refundId,
            timestamp: new Date(),
            type: 'order_deleted'
        });

        console.log('📡 Order deletion sent to admin dashboard');

        const response = {
            success: true,
            message: refundResult 
                ? 'تم إلغاء الطلب واسترداد المبلغ بنجاح' 
                : 'تم إلغاء الطلب بنجاح'
        };

        if (refundResult) {
            response.refundDetails = {
                refundId: refundResult.refundId,
                amount: refundResult.amount,
                estimatedDays: refundResult.estimatedDays
            };
        }

        res.json(response);
    } catch (error) {
        console.error('❌ Error deleting order:', error);
        next(error);
    }
});

export const getAllOrders = asyncHandler(async (req, res, next) => {
  try {
    console.log('📋 جاري جلب جميع الطلبات...');
    const { recent } = req.query; // معامل اختياري للطلبات الحديثة فقط
    
    let query = {};
    
    // إذا طُلب الطلبات الحديثة فقط (آخر 48 ساعة)
    if (recent === 'true') {
      const fortyEightHoursAgo = new Date(Date.now() - (48 * 60 * 60 * 1000));
      query.createdAt = { $gte: fortyEightHoursAgo };
      console.log('⏰ جلب الطلبات من آخر 48 ساعة فقط...');
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean(); // ترتيب من الأحدث للأقدم
    
    console.log(`✅ تم جلب ${orders.length} طلب من قاعدة البيانات`);
    
    // إرجاع البيانات بالشكل المتوقع في admin panel
    res.status(200).json({
      success: true,
      data: orders,
      total: orders.length,
      filter: recent === 'true' ? 'recent_48h' : 'all'
    });
  } catch (error) {
    console.error('❌ خطأ في جلب الطلبات:', error);
    next(error);
  }
});

export const getOrderById = asyncHandler(async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
});