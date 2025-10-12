// Payment Service - محاكاة نظام الدفع
// في المستقبل هنربطه ببوابة دفع حقيقية زي Stripe أو Paymob

/**
 * محاكاة عملية دفع بالبطاقة البنكية
 * @param {Object} cardDetails - بيانات البطاقة
 * @param {number} amount - المبلغ بالجنية المصري
 * @param {string} orderId - رقم الطلب
 * @returns {Promise<Object>} نتيجة العملية
 */
export const processCardPayment = async (cardDetails, amount, orderId) => {
  console.log('🔄 Processing card payment...');
  console.log('💳 Card ending in:', cardDetails.number?.slice(-4));
  console.log('💰 Amount:', amount, 'EGP');
  console.log('📝 Order ID:', orderId);

  // محاكاة تأخير الشبكة (1-3 ثواني)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

  // التحقق من صحة بيانات البطاقة (محاكاة)
  const validationResult = validateCardDetails(cardDetails);
  if (!validationResult.valid) {
    console.log('❌ Card validation failed:', validationResult.error);
    return {
      success: false,
      error: validationResult.error,
      errorCode: 'INVALID_CARD'
    };
  }

  // محاكاة نتائج مختلفة للدفع (85% نجاح، 15% فشل)
  const success = Math.random() > 0.15;
  
  if (success) {
    const transactionId = generateTransactionId();
    console.log('✅ Payment successful! Transaction ID:', transactionId);
    
    return {
      success: true,
      transactionId,
      amount,
      currency: 'EGP',
      status: 'completed',
      message: 'تم الدفع بنجاح',
      processingFee: Math.round(amount * 0.025), // رسوم معالجة 2.5%
      timestamp: new Date().toISOString()
    };
  } else {
    // محاكاة أسباب مختلفة للفشل
    const failureReasons = [
      { code: 'INSUFFICIENT_FUNDS', message: 'رصيد غير كافي' },
      { code: 'CARD_DECLINED', message: 'البطاقة مرفوضة من البنك' },
      { code: 'EXPIRED_CARD', message: 'البطاقة منتهية الصلاحية' },
      { code: 'NETWORK_ERROR', message: 'خطأ في الشبكة، حاول مرة أخرى' }
    ];
    
    const randomFailure = failureReasons[Math.floor(Math.random() * failureReasons.length)];
    
    console.log('❌ Payment failed:', randomFailure.message);
    
    return {
      success: false,
      error: randomFailure.message,
      errorCode: randomFailure.code,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * التحقق من صحة بيانات البطاقة
 * @param {Object} cardDetails - بيانات البطاقة
 * @returns {Object} نتيجة التحقق
 */
const validateCardDetails = (cardDetails) => {
  console.log('🔍 Full card details received:', JSON.stringify(cardDetails, null, 2));
  const { number, expiry, cvv, expiryDate: expDateField, cardNumber, expiryMonth, expiryYear } = cardDetails;
  
  // توحيد أسماء الحقول - قد يأتي من الفرونت بأسماء مختلفة
  const cardNum = number || cardNumber;
  
  // تجميع تاريخ الانتهاء من المصادر المختلفة
  let expiryVal;
  if (expiryMonth && expiryYear) {
    // إذا جاء كـ expiryMonth و expiryYear منفصلين (من الباك إند)
    const formattedMonth = expiryMonth.toString().padStart(2, '0');
    const formattedYear = expiryYear.toString().padStart(2, '0');
    expiryVal = `${formattedMonth}/${formattedYear}`;
  } else {
    // إذا جاء كـ expiry أو expiryDate (من الفرونت إند)
    expiryVal = expiry || expDateField;
  }

  // التحقق من رقم البطاقة (16 رقم)
  if (!cardNum || !/^\d{16}$/.test(cardNum.replace(/\s/g, ''))) {
    console.log('❌ Invalid card number:', cardNum);
    return { valid: false, error: 'رقم البطاقة غير صحيح' };
  }

  // التحقق من تاريخ الانتهاء (MM/YY format)
  console.log('🔍 Checking expiry date:', expiryVal, 'type:', typeof expiryVal);
  if (!expiryVal || !/^\d{2}\/\d{2}$/.test(expiryVal)) {
    console.log('❌ Invalid expiry format:', expiryVal);
    console.log('❌ Regex test result:', /^\d{2}\/\d{2}$/.test(expiryVal));
    return { valid: false, error: 'تاريخ انتهاء البطاقة غير صحيح' };
  }

  // التحقق من أن البطاقة لم تنته صلاحيتها
  const [month, year] = expiryVal.split('/').map(num => parseInt(num));
  console.log('📅 Parsed month:', month, 'year:', year);
  const currentDate = new Date();
  
  // تحويل YY إلى YYYY بطريقة ذكية
  let fullYear;
  if (year >= 0 && year <= 30) {
    fullYear = 2000 + year; // 00-30 = 2000-2030
  } else if (year >= 31 && year <= 99) {
    fullYear = 1900 + year; // 31-99 = 1931-1999 (بطاقات منتهية)
  } else {
    fullYear = year; // إذا كانت 4 أرقام بالفعل
  }
  
  console.log('🗓️ Full year calculated:', fullYear);
  const expiryDate = new Date(fullYear, month - 1);
  console.log('📅 Expiry date object:', expiryDate);
  
  // إضافة شهر كامل لتاريخ الانتهاء (البطاقة صالحة حتى آخر يوم في الشهر)
  expiryDate.setMonth(expiryDate.getMonth() + 1);
  expiryDate.setDate(0); // آخر يوم في الشهر السابق
  console.log('📅 Final expiry date:', expiryDate);
  console.log('📅 Current date:', currentDate);
  
  if (expiryDate < currentDate) {
    console.log('❌ Card expired');
    return { valid: false, error: 'البطاقة منتهية الصلاحية' };
  }

  // التحقق من CVV (3 أرقام)
  if (!cvv || !/^\d{3}$/.test(cvv)) {
    return { valid: false, error: 'رمز الأمان CVV غير صحيح' };
  }

  return { valid: true };
};

/**
 * توليد رقم معاملة فريد
 * @returns {string} رقم المعاملة
 */
const generateTransactionId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN_${timestamp}_${random}`;
};

/**
 * استرداد المبلغ (محاكاة)
 * @param {string} transactionId - رقم المعاملة
 * @param {number} amount - المبلغ المراد استرداده
 * @returns {Promise<Object>} نتيجة عملية الاسترداد
 */
export const refundPayment = async (transactionId, amount) => {
  console.log('🔄 Processing refund...');
  console.log('🔙 Transaction ID:', transactionId);
  console.log('💰 Refund Amount:', amount, 'EGP');

  // محاكاة تأخير المعالجة
  await new Promise(resolve => setTimeout(resolve, 1500));

  // محاكاة نجاح الاسترداد (95% نجاح)
  const success = Math.random() > 0.05;

  if (success) {
    const refundId = generateTransactionId();
    console.log('✅ Refund successful! Refund ID:', refundId);
    
    return {
      success: true,
      refundId,
      originalTransactionId: transactionId,
      amount,
      currency: 'EGP',
      status: 'refunded',
      message: 'تم استرداد المبلغ بنجاح',
      estimatedDays: '3-5 أيام عمل',
      timestamp: new Date().toISOString()
    };
  } else {
    console.log('❌ Refund failed');
    
    return {
      success: false,
      error: 'فشل في عملية الاسترداد، تواصل مع الدعم الفني',
      errorCode: 'REFUND_FAILED',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * التحقق من حالة المعاملة
 * @param {string} transactionId - رقم المعاملة
 * @returns {Promise<Object>} حالة المعاملة
 */
export const checkTransactionStatus = async (transactionId) => {
  console.log('🔍 Checking transaction status:', transactionId);

  // محاكاة تأخير الاستعلام
  await new Promise(resolve => setTimeout(resolve, 500));

  // محاكاة حالات مختلفة للمعاملة
  const statuses = ['completed', 'pending', 'failed', 'refunded'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    transactionId,
    status: randomStatus,
    timestamp: new Date().toISOString(),
    message: getStatusMessage(randomStatus)
  };
};

/**
 * الحصول على رسالة الحالة
 * @param {string} status - حالة المعاملة
 * @returns {string} رسالة الحالة
 */
const getStatusMessage = (status) => {
  const messages = {
    completed: 'تمت المعاملة بنجاح',
    pending: 'المعاملة قيد المعالجة',
    failed: 'فشلت المعاملة',
    refunded: 'تم استرداد المبلغ'
  };
  return messages[status] || 'حالة غير معروفة';
};