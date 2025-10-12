import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  notes: { type: String },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['cash-on-delivery', 'vodafone-cash', 'instapay', 'bank-card']
  },
  items: [{
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    priceAtOrder: { type: Number, required: true },
    category: { type: String },
    itemName: { type: String }
  }],
  totalPrice: { type: Number, required: true },
  
  // بيانات البطاقة (آمنة - فقط آخر 4 أرقام)
  cardDetails: {
    lastFourDigits: { type: String },
    cardType: { type: String } // Visa, Mastercard, etc.
  },
  
  // تفاصيل الدفع
  paymentDetails: {
    transactionId: { type: String },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    processingFee: { type: Number },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundId: { type: String }
  },
  
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'paid', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
  },
}, {
  timestamps: true // يضيف createdAt و updatedAt تلقائياً
});

export default mongoose.model('Order', orderSchema);