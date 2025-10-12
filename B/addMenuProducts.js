import mongoose from 'mongoose';
import Product from './src/DB/modules/Product.js';
import connectDB from './src/DB/connection.js';

// كل المنتجات الموجودة في المنيو
const menuProducts = [
  // ورق عنب
  { name: 'ورق عنب بدبس الرمان - صغير', price: 190, description: '15 قطعة - أوراق عنب طازجة محشوة بالأرز والخضروات مع نكهة دبس الرمان المميزة.' },
  { name: 'فتة ورق عنب - صغير', price: 170, description: 'حصة فردية - ورق عنب مفروم مع الخبز المحمص والزبادى الشهية' },
  { name: 'ورق عنب بدبس الرمان - كبير', price: 500, description: 'كبير: 55 قطعة - مثالي للعائلات والضيوف، ورق عنب محشو بأفضل المكونات' },
  { name: 'ورق عنب بدبس الرمان - متوسط', price: 270, description: 'متوسط: 30 قطعة - يكفي لشخصين، أوراق عنب محشوة بالأرز والخضروات مع دبس الرمان' },
  { name: 'فتة ورق عنب - كبير', price: 240, description: 'يكفي لشخصين وثلاثة - ورق عنب مفروم مع الخبز المحمص والزبادى الشهية' },
  { name: 'ورق عنب بالليمون - صغير', price: 190, description: 'صغير: 15 قطعة - نكهة منعشة ولذيذة، أوراق عنب محشوة بنكهة الليمون المنعشة' },
  { name: 'ورق عنب بالليمون - كبير', price: 340, description: '30 قطعة - نكهة منعشة ولذيذة، أوراق عنب محشوة بنكهة الليمون المنعشة' },

  // محاشي
  { name: 'كوسا لبنايه', price: 180, description: 'كوسا محشية الأرز مطبوخة باللبن الرائب على الطريقة اللبنانية' },
  { name: 'طبق ملفوف محشي', price: 180, description: 'ملفوف محشي بالأرز والخضار على الطريقة المصرية الأصيلة' },
  { name: 'كوسا محشي بالأرز', price: 190, description: 'كوسا محشية بالأرز والخضروات الطازجة على الطريقة الشامية الأصيلة' },
  { name: 'طبق بصل محشي', price: 170, description: 'بصل محشي بالأرز على الطريقة المصرية الأصيلة' },
  { name: 'مكدوس شامي - 600 جرام', price: 220, description: 'اذنجان محشو بالجوز والفلفل الأحمر والثوم على الطريقة الشامية الأصيلة' },
  { name: 'طبق مشكل كبير', price: 550, description: 'تشكيلة مميزة من المحاشي والمقبلات الشامية في طبق واحد لعشاق التنوع' },

  // كبة وسمبوسة
  { name: 'كبة سورية لحمة - صغير', price: 150, description: '10 قطع - كبة سورية طازجة محشوة باللحمة المفرومة والبرغل الناعم' },
  { name: 'سمبوسة لحمة', price: 170, description: 'سمبوسة مقرمشة محشوة باللحمة المتبلة - مقبلات خفيفة ولذيذة' },
  { name: 'كبة سورية لحمة - متوسط', price: 300, description: 'كبة سورية أصيلة محشوة باللحمة المفرومة والتوابل' },

  // سلطات  
  { name: 'سلطة التبولة', price: 90, description: 'بقدونس مفروم ناعم مع الطماطم والليمون والنعناع - سلطة لبنانية منعشة' },
  { name: 'سلطة الفتوش', price: 95, description: 'سلطة لبنانية منعشة بالخضروات الطازجة، الخبز المحمص، وصوص الرمان' },

  // عروض ومكس
  { name: 'أطباق الضيافة - كبير', price: 700, description: 'تشكيلة كاملة من جميع الأصناف المحشوة - للمناسبات الكبيرة والعزائم' },
  { name: 'عرض ال3 بوكسات الكبير', price: 1100, description: 'بوكس ورق عنب كبير + بوكس ميكس كبير + بوكس فته وسط' },
  { name: 'عرض ال3 بوكسات صغير', price: 350, description: 'عباره عن 3 اطباق ورق عنب بالرومان + طبق بالفلفل + طبق بالليمون' },
  { name: 'عرض الطبقين', price: 305, description: 'العرض طبقين واحد ورق عنب + طبق فته' },

  // مشروبات
  { name: 'بيبسي كولا', price: 25, description: 'مشروب البيبسي كولا الطازج والمنعش - عبوة 330 مل' },
  { name: 'سفن أب', price: 25, description: 'مشروب السفن أب الطازج بنكهة الليمون المنعشة - عبوة 330 مل' },
  { name: 'في كولا', price: 25, description: 'مشروب الكولا الطبيعي بطعم مميز ومنعش - عبوة 330 مل' }
];

// تشغيل الإضافة
(async () => {
  try {
    console.log('🔗 الاتصال بالداتابيز...');
    await connectDB();
    
  console.log('🧹 مسح المنتجات الموجودة...');
  await Product.deleteMany({}); // حذف كل المنتجات القديمة
    
    console.log('📦 إضافة منتجات المنيو...');
    
    let addedCount = 0;
    for (const product of menuProducts) {
      try {
        // التحقق من وجود المنتج
        const existingProduct = await Product.findOne({ name: product.name });
        
        if (!existingProduct) {
          await Product.create(product);
          console.log(`✅ تم إضافة: ${product.name} - ${product.price} ج`);
          addedCount++;
        } else {
          console.log(`⚠️ موجود بالفعل: ${product.name}`);
        }
      } catch (error) {
        console.error(`❌ خطأ في إضافة ${product.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 تم الانتهاء! تم إضافة ${addedCount} منتج جديد`);
    console.log(`📊 إجمالي المنتجات: ${await Product.countDocuments()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ عام:', error);
    process.exit(1);
  }
})();