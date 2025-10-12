import mongoose from 'mongoose';
import Product from './src/DB/modules/Product.js';
import connectDB from './src/DB/connection.js';

const originalMenu = [
  {
    name: "ورق عنب بدبس الرمان - صغير",
    price: 170,
    description: "ورق عنب طازج محشو بالأرز واللحمة المفرومة بدبس الرمان الأصلي",
    category: "stuffed"
  },
  {
    name: "فتة ورق عنب - صغير", 
    price: 200,
    description: "فتة ورق عنب مقدمة مع الليمون ودبس الرمان على الطريقة الشامية",
    category: "stuffed"
  },
  {
    name: "ورق عنب بدبس الرمان",
    price: 300,
    description: "ورق عنب طازج محشو بالأرز واللحمة المفرومة بدبس الرمان الأصلي",
    category: "stuffed"
  },
  {
    name: "ورق عنب بدبس الرمان",
    price: 500,
    description: "ورق عنب طازج محشو بالأرز واللحمة المفرومة بدبس الرمان الأصلي - حجم كبير",
    category: "stuffed"
  },
  {
    name: "فتة ورق عنب - كبير",
    price: 350,
    description: "فتة ورق عنب مقدمة مع الليمون ودبس الرمان على الطريقة الشامية - حجم كبير",
    category: "stuffed"
  },
  {
    name: "ورق عنب بالليمون",
    price: 280,
    description: "ورق عنب على الطريقة اللبنانية مع عصير الليمون الطازج",
    category: "stuffed"
  },
  {
    name: "ورق عنب بالليمون - كبير",
    price: 450,
    description: "ورق عنب على الطريقة اللبنانية مع عصير الليمون الطازج - حجم كبير",
    category: "stuffed"
  },
  {
    name: "كوسا لبنايه",
    price: 240,
    description: "كوسا محشية على الطريقة اللبنانية باللحمة والأرز",
    category: "stuffed"
  },
  {
    name: "طبق ملفوف محشي",
    price: 280,
    description: "ملفوف محشي بالأرز واللحمة على الطريقة الشامية التقليدية",
    category: "stuffed"
  },
  {
    name: "كوسا محشي بالأرز",
    price: 190,
    description: "كوسا محشية بالأرز والخضروات الطازجة على الطريقة الشامية الأصيلة",
    category: "stuffed"
  },
  {
    name: "طبق بصل محشي",
    price: 170,
    description: "بصل محشي بالأرز على الطريقة المصرية الأصيلة",
    category: "stuffed"
  },
  {
    name: "مكدوس شامي - 600 جرام",
    price: 220,
    description: "اذنجان محشو بالجوز والفلفل الأحمر والثوم على الطريقة الشامية الأصيلة",
    category: "stuffed"
  },
  {
    name: "طبق مشكل كبير",
    price: 550,
    description: "تشكيلة مميزة من المحاشي والمقبلات الشامية في طبق واحد لعشاق التنوع",
    category: "stuffed"
  },
  {
    name: "كبة سورية لحمة - صغير",
    price: 150,
    description: "10 قطع - كبة سورية طازجة محشوة باللحمة المفرومة والبرغل الناعم",
    category: "kebabs"
  },
  {
    name: "سمبوسة لحمة",
    price: 170,
    description: "سمبوسة مقرمشة محشوة باللحمة المتبلة - مقبلات خفيفة ولذيذة",
    category: "kebabs"
  },
  {
    name: "كبة سورية لحمة - متوسط",
    price: 220,
    description: "كبة سورية أصيلة محشوة باللحمة والصنوبر على الطريقة الحلبية",
    category: "kebabs"
  },
  {
    name: "سلطة التبولة",
    price: 80,
    description: "تبولة طازجة مع البقدونس والطماطم والبرغل بالليمون وزيت الزيتون",
    category: "salads"
  },
  {
    name: "سلطة الفتوش",
    price: 90,
    description: "فتوش مع الخضروات الطازجة والخبز المحمص ودبس الرمان",
    category: "salads"
  },
  {
    name: "أطباق الضيافة - كبير",
    price: 850,
    description: "طبق ضيافة فاخر يحتوي على تشكيلة مميزة من المحاشي والمقبلات الشامية",
    category: "special"
  },
  {
    name: "عرض ال3 بوكسات الكبير",
    price: 450,
    description: "3 بوكسات كبيرة تحتوي على تشكيلة متنوعة من المحاشي والمقبلات",
    category: "offers"
  },
  {
    name: "عرض ال3 بوكسات صغير", 
    price: 280,
    description: "3 بوكسات صغيرة تحتوي على تشكيلة متنوعة من المحاشي والمقبلات",
    category: "offers"
  }
];

const seedOriginalMenu = async () => {
  try {
    console.log('🍽️ جاري إضافة المنيو الأصلي لقاعدة البيانات...');
    
    // الاتصال بقاعدة البيانات
    await connectDB();
    
    // حذف المنتجات الموجودة أولاً
    await Product.deleteMany({});
    console.log('🗑️ تم حذف المنتجات السابقة');
    
    // إضافة المنيو الأصلي
    const addedProducts = await Product.insertMany(originalMenu);
    
    console.log(`✅ تم إضافة ${addedProducts.length} صنف من المنيو الأصلي لقاعدة البيانات`);
    
    // عرض المنتجات المضافة
    addedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.price} ج - ID: ${product._id}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إضافة المنيو:', error);
    process.exit(1);
  }
};

seedOriginalMenu();