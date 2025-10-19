// اختبار سريع لإنشاء Order في Database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testOrderSchema = new mongoose.Schema({
  customerName: String,
  phoneNumber: String,
  address: String,
  items: Array,
  totalPrice: Number,
  status: String
}, { timestamps: true });

const TestOrder = mongoose.model('Order', testOrderSchema);

async function testDatabaseConnection() {
  try {
    console.log('🔌 جاري الاتصال بقاعدة البيانات...');
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI?.slice(0, 30) + '...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');
    
    // محاولة إنشاء طلب تجريبي
    console.log('\n📝 محاولة إنشاء طلب تجريبي...');
    
    const testOrder = await TestOrder.create({
      customerName: 'اختبار من السكريبت',
      phoneNumber: '01000000000',
      address: 'عنوان تجريبي',
      items: [
        { productName: 'محشي كرنب', quantity: 2, priceAtOrder: 50 }
      ],
      totalPrice: 100,
      status: 'pending'
    });
    
    console.log('✅ تم إنشاء الطلب التجريبي بنجاح!');
    console.log('📦 Order ID:', testOrder._id);
    console.log('📦 Order Details:', JSON.stringify(testOrder, null, 2));
    
    // جلب كل الطلبات
    console.log('\n📋 جلب كل الطلبات من Database...');
    const allOrders = await TestOrder.find().sort({ createdAt: -1 }).limit(5);
    console.log(`✅ عدد الطلبات: ${allOrders.length}`);
    
    allOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. Order ID: ${order._id}`);
      console.log(`   Customer: ${order.customerName}`);
      console.log(`   Phone: ${order.phoneNumber}`);
      console.log(`   Total: ${order.totalPrice} جنيه`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Created: ${order.createdAt}`);
    });
    
    // حذف الطلب التجريبي
    console.log('\n🗑️ حذف الطلب التجريبي...');
    await TestOrder.findByIdAndDelete(testOrder._id);
    console.log('✅ تم حذف الطلب التجريبي');
    
    console.log('\n✅ ========== الاختبار تم بنجاح! ==========');
    console.log('✅ قاعدة البيانات تعمل بشكل صحيح');
    console.log('✅ يمكن إنشاء وقراءة وحذف الطلبات');
    
  } catch (error) {
    console.error('\n❌ ========== خطأ في الاختبار ==========');
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 تم إغلاق الاتصال بقاعدة البيانات');
    process.exit(0);
  }
}

testDatabaseConnection();
