


const OrderTracking = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    status: { type: String, required: true }, // e.g., 'pending', 'shipped', 'delivered'
    updatedAt: { type: Date, default: Date.now },
    priceAtPurchase: { type: Number, required: true },
    notes: { type: String },
    quantity: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('OrderTracking', OrderTracking);