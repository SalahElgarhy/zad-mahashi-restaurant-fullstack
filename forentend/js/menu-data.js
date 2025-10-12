// بيانات القائمة المتزامنة مع الأدمن
class MenuDataManager {
    constructor() {
        this.initializeMenu();
        this.startSyncService();
    }

    // تحديث البيانات من localStorage
    loadMenuData() {
        try {
            // جرب الكود الجديد أولاً
            let savedData = localStorage.getItem('zad-menu-data');
            
            if (savedData) {
                const menuData = JSON.parse(savedData);
                // تشخيص البنية للتأكد من صحة البيانات
                if (menuData.length > 0 && !menuData[0].items && !menuData[0].price) {
                    console.warn('⚠️ تنسيق بيانات غير مألوف - التشخيص:');
                    this.diagnoseDataStructure(menuData);
                }
                
                return menuData;
            }
            
            // جرب المفاتيح البديلة
            const alternativeKeys = ['menuData', 'zad-data', 'restaurant-menu'];
            for (const key of alternativeKeys) {
                savedData = localStorage.getItem(key);
                if (savedData) {
                    console.log(`📍 تم العثور على بيانات في: ${key}`);
                    const menuData = JSON.parse(savedData);
                    if (Array.isArray(menuData) && menuData.length > 0) {
                        return menuData;
                    }
                }
            }
            
            console.log('❌ لم يتم العثور على أي بيانات');
            
        } catch (error) {
            console.error('خطأ في تحميل بيانات القائمة:', error);
        }
        
        // إرجاع بيانات افتراضية للاختبار
        console.log('🔄 استخدام بيانات افتراضية للاختبار');
        return this.getDefaultMenuData();
    }
    
    // بيانات افتراضية للاختبار
    getDefaultMenuData() {
        return [
            {
                title: 'محشي ورق عنب بدبس الرمان',
                price: 190,
                category: 'grape'
            },
            {
                title: 'فتة ورق عنب',
                price: 170,
                category: 'grape'
            },
            {
                title: 'ورق عنب كبير',
                price: 500,
                category: 'grape'
            }
        ];
    }

    // خريطة ربط المنتجات بالأسماء والمعرفات
    getProductMapping() {
        return {
            'grape-small': {
                names: ['ورق عنب بدبس الرمان - صغير', 'محشي ورق عنب بدبس الرمان', 'ورق عنب صغير'],
                selector: '[data-item-id="grape-small"] .item-price'
            },
            'fattet-grape': {
                names: ['فتة ورق عنب - صغير', 'فتة ورق عنب', 'فته ورق عنب'],
                selector: '[data-item-id="fattet-grape"] .item-price'
            },
            'grape-large': {
                names: ['ورق عنب بدبس الرمان', 'محشي ورق عنب كبير', 'ورق عنب كبير'],
                selector: '[data-item-id="grape-large"] .item-price'
            }
        };
    }

    // تحديث الأسعار في الصفحة
    updatePrices() {
        const menuData = this.loadMenuData();
        if (!menuData || menuData.length === 0) {
            console.log('❌ لا توجد بيانات للتحديث');
            return;
        }

        const mapping = this.getProductMapping();
        let updatedCount = 0;

        // تحويل بيانات الأدمن لصيغة مسطحة
        const flatMenuData = this.flattenMenuData(menuData);

        flatMenuData.forEach(item => {
            let itemUpdated = false;

            // البحث في خريطة الربط
            Object.keys(mapping).forEach(productId => {
                const product = mapping[productId];
                
                // فحص إذا كان اسم المنتج من الأدمن يطابق أي من الأسماء المعرفة
                const isMatch = product.names.some(name => 
                    this.isNameMatch(item.title, name) || this.isNameMatch(item.name, name)
                );

                if (isMatch && !itemUpdated) {
                    const priceElement = document.querySelector(product.selector);
                    if (priceElement) {
                        const oldPrice = priceElement.textContent;
                        
                        // فحص أن السعر موجود وليس undefined
                        const price = this.extractPrice(item.price);
                        if (price === null) {
                            return; // تجاهل الأسعار غير الصحيحة بصمت
                        }
                        
                        const newPrice = price + ' ج';
                        
                        // تحديث فقط إذا كان هناك اختلاف حقيقي
                        if (oldPrice !== newPrice) {
                            priceElement.textContent = newPrice;
                            this.addUpdateEffect(priceElement);
                            
                            console.log(`✅ تم تحديث: "${item.title || item.name}" من ${oldPrice} إلى ${newPrice}`);
                            updatedCount++;
                            itemUpdated = true;
                        }
                    }
                }
            });

            // إذا لم يتم العثور على تطابق في الخريطة، جرب البحث العام
            if (!itemUpdated) {
                const updateResult = this.updateByNameSearch(item);
                if (updateResult) updatedCount++;
            }
        });

        // إظهار الإشعار فقط إذا كان هناك تحديثات فعلية
        if (updatedCount > 0) {
            this.showUpdateNotification(updatedCount);
            console.log(`📊 تم تحديث ${updatedCount} منتج فعلياً`);
        }
    }
    
    // تحويل بيانات الأدمن لصيغة مسطحة
    flattenMenuData(menuData) {
        const flatData = [];
        
        menuData.forEach(group => {
            if (group.items && Array.isArray(group.items)) {
                // البنية الجديدة - مجموعات بها عناصر
                group.items.forEach(item => {
                    flatData.push({
                        title: group.title,
                        name: item.name,
                        price: item.price,
                        description: item.description
                    });
                });
            } else if (group.title && group.price) {
                // البنية القديمة - عناصر مباشرة
                flatData.push(group);
            }
        });
        
        return flatData;
    }
    
    // استخراج السعر من النص
    extractPrice(priceText) {
        if (typeof priceText === 'number') {
            return priceText;
        }
        
        if (typeof priceText === 'string') {
            // استخراج الأرقام من النص
            const match = priceText.match(/(\d+)/);
            if (match) {
                return parseInt(match[1]);
            }
        }
        
        return null;
    }

    // البحث العام بالاسم
    updateByNameSearch(item) {
        const allPriceElements = document.querySelectorAll('.box .options h6');
        let wasUpdated = false;
        
        allPriceElements.forEach(priceElement => {
            const box = priceElement.closest('.box');
            const titleElement = box.querySelector('h5');
            
            if (titleElement) {
                const title = titleElement.textContent.trim();
                const itemName = item.title || item.name;
                
                if (this.isNameMatch(itemName, title)) {
                    const oldPrice = priceElement.textContent;
                    
                    // استخراج السعر
                    const price = this.extractPrice(item.price);
                    if (price === null) {
                        return; // تجاهل الأسعار غير الصحيحة بصمت
                    }
                    
                    const newPrice = price + ' ج';
                    
                    if (oldPrice !== newPrice) {
                        priceElement.textContent = newPrice;
                        this.addUpdateEffect(priceElement);
                        console.log(`🔍 تحديث عام: "${title}" ← "${itemName}" إلى ${newPrice}`);
                        wasUpdated = true;
                    }
                }
            }
        });
        
        return wasUpdated;
    }

    // فحص تطابق الأسماء
    isNameMatch(adminName, htmlName) {
        const clean1 = this.cleanName(adminName);
        const clean2 = this.cleanName(htmlName);
        
        // مطابقة مباشرة
        if (clean1 === clean2) return true;
        
        // مطابقة جزئية
        if (clean1.includes(clean2) || clean2.includes(clean1)) return true;
        
        // مطابقة الكلمات المفتاحية
        const words1 = clean1.split(/\s+/).filter(w => w.length > 2);
        const words2 = clean2.split(/\s+/).filter(w => w.length > 2);
        
        if (words1.length === 0 || words2.length === 0) return false;
        
        const matchCount = words1.filter(w1 => 
            words2.some(w2 => w1.includes(w2) || w2.includes(w1))
        ).length;
        
        return matchCount >= Math.min(words1.length, words2.length) * 0.6;
    }

    // تنظيف الأسماء للمقارنة
    cleanName(name) {
        return name
            .toLowerCase()
            .replace(/[^\u0600-\u06FF\u0750-\u077F\s]/g, '') // إبقاء العربية والمسافات فقط
            .replace(/\s+/g, ' ')
            .trim();
    }

    // إضافة تأثير بصري للتحديث
    addUpdateEffect(element) {
        element.style.transition = 'all 0.5s ease';
        element.style.background = '#28a745';
        element.style.color = 'white';
        element.style.padding = '3px 8px';
        element.style.borderRadius = '5px';
        element.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            element.style.background = '';
            element.style.color = '';
            element.style.padding = '';
            element.style.borderRadius = '';
            element.style.transform = '';
        }, 2000);
    }

    // إظهار إشعار التحديث
    showUpdateNotification(count) {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                z-index: 9999;
                box-shadow: 0 5px 20px rgba(40, 167, 69, 0.3);
                animation: slideInRight 0.5s ease;
                font-weight: bold;
            ">
                <i class="fa fa-check-circle" style="margin-left: 8px;"></i>
                تم تحديث ${count} ${count === 1 ? 'منتج' : 'منتجات'} ✨
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // بدء خدمة المزامنة
    startSyncService() {
        console.log('🚀 تم تشغيل خدمة مزامنة القائمة');
        
        // تحديث فقط عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => this.updatePrices(), 1000);
        });

        // فحص عند تبديل النوافذ (لو المستخدم رجع للصفحة)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => this.updatePrices(), 500);
            }
        });
        
        // الاستماع لإشارات المزامنة من الأدمن فقط
        setInterval(() => this.checkSyncSignal(), 2000);
    }

    // فحص إشارات المزامنة الفورية
    checkSyncSignal() {
        try {
            const signal = JSON.parse(localStorage.getItem('menu-sync-signal') || '{}');
            const lastCheck = parseInt(localStorage.getItem('last-sync-check') || '0');
            
            if (signal.timestamp && signal.timestamp > lastCheck) {
                console.log('📡 استلام إشارة مزامنة فورية');
                this.updatePrices();
                localStorage.setItem('last-sync-check', signal.timestamp.toString());
            }
        } catch (error) {
            // تجاهل الأخطاء
        }
    }

    // تهيئة القائمة
    initializeMenu() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updatePrices();
        });
    }
    
    // تشخيص بنية البيانات
    diagnoseDataStructure(menuData) {
        console.log('🔬 تشخيص بنية البيانات:');
        
        if (!Array.isArray(menuData)) {
            console.log('❌ البيانات ليست مصفوفة');
            return;
        }
        
        console.log(`📊 عدد العناصر: ${menuData.length}`);
        
        menuData.slice(0, 3).forEach((item, index) => {
            console.log(`\n🔎 العنصر ${index + 1}:`);
            console.log('   📝 الخصائص:', Object.keys(item));
            
            if (item.title) console.log(`   📌 العنوان: "${item.title}"`);
            if (item.price) console.log(`   💰 السعر: "${item.price}"`);
            
            if (item.items && Array.isArray(item.items)) {
                console.log(`   📦 عدد العناصر الفرعية: ${item.items.length}`);
                if (item.items.length > 0) {
                    const firstSubItem = item.items[0];
                    console.log('   🔍 أول عنصر فرعي:', firstSubItem);
                    if (firstSubItem.price) {
                        console.log(`   💰 سعر العنصر الفرعي: "${firstSubItem.price}"`);
                    }
                }
            }
        });
    }
}

// تشغيل المدير
const menuManager = new MenuDataManager();

// إضافة للنافذة العامة للوصول من أدوات التجربة
window.menuManager = menuManager;

// إضافة CSS للرسوم المتحركة
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);