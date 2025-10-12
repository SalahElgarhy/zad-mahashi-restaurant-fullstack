// مزامنة قائمة الطعام مع بيانات الأدمن
document.addEventListener('DOMContentLoaded', function() {
    syncMenuPrices();
    
    // تحديث الأسعار كل 5 ثواني لضمان التزامن
    setInterval(syncMenuPrices, 5000);
    
    // الاستماع لإشارات المزامنة الفورية
    setInterval(checkSyncSignal, 1000);
});

let lastUpdateTime = 0;
let updatedItemsCount = 0;

// خريطة تطابق مباشرة للمنتجات
const productMatchMap = {
    'ورق عنب بدبس الرمان - صغير': ['محشي ورق عنب بدبس الرمان', 'ورق عنب بدبس الرمان'],
    'فتة ورق عنب - صغير': ['فتة ورق عنب'],
    'ورق عنب بدبس الرمان': ['محشي ورق عنب بدبس الرمان'],
    'كوسة محشية - صغير': ['كوسة محشية'],
    'باذنجان محشي - صغير': ['باذنجان محشي'],
    'ملفوف محشي - صغير': ['ملفوف محشي'],
    'كبة لحمة مقلية': ['كبة لحمة'],
    'سمبوسة جبنة مقلية': ['سمبوسة جبنة'],
    'سلطة فتوش': ['فتوش'],
    'سلطة تبولة': ['تبولة'],
    'مشكل مقبلات شرقية': ['ميكس مقبلات'],
    'عصير برتقال طازج': ['عصير برتقال'],
    'عصير ليمون بالنعناع': ['عصير ليمون'],
    'شاي أحمر': ['شاي'],
    'قهوة عربية': ['قهوة']
};

function syncMenuPrices() {
    try {
        // قراءة بيانات القائمة من الأدمن
        const adminMenuData = JSON.parse(localStorage.getItem('zad-menu-data'));
        
        if (adminMenuData && adminMenuData.length > 0) {
            console.log('تم العثور على بيانات القائمة من الأدمن:', adminMenuData.length, 'صنف');
            
            // فحص وقت التحديث الأخير
            const adminDataStr = JSON.stringify(adminMenuData);
            const currentTime = Date.now();
            
            // إذا تغيرت البيانات أو مر أكثر من دقيقة
            if (window.lastAdminDataStr !== adminDataStr || currentTime - lastUpdateTime > 60000) {
                updatedItemsCount = 0;
                updateMenuPrices(adminMenuData);
                
                if (updatedItemsCount > 0) {
                    showUpdateNotification(updatedItemsCount);
                }
                
                window.lastAdminDataStr = adminDataStr;
                lastUpdateTime = currentTime;
            }
        } else {
            console.log('لم يتم العثور على بيانات القائمة في الأدمن');
        }
    } catch (error) {
        console.log('خطأ في قراءة بيانات القائمة:', error);
    }
}

function updateMenuPrices(menuData) {
    // تحديث الأسعار في الصفحة
    menuData.forEach(item => {
        updateItemPrice(item.name, item.price);
    });
}

function updateItemPrice(itemName, newPrice) {
    console.log(`محاولة تحديث سعر: "${itemName}" إلى ${newPrice} ج`);
    
    // البحث عن العنصر في الصفحة وتحديث سعره
    const menuBoxes = document.querySelectorAll('.box .detail-box');
    let foundMatch = false;
    
    menuBoxes.forEach((box, index) => {
        const titleElement = box.querySelector('h5');
        if (titleElement) {
            const title = titleElement.textContent.trim();
            
            console.log(`فحص المنتج ${index + 1}: "${title}"`);
            
            // مقارنة الأسماء (مع التعامل مع الاختلافات البسيطة)
            if (isMatchingItem(title, itemName)) {
                const priceElement = box.querySelector('.options h6');
                if (priceElement) {
                    const oldPrice = priceElement.textContent;
                    priceElement.textContent = newPrice + ' ج';
                    
                    // إضافة تأثير بصري للتحديث
                    priceElement.style.transition = 'all 0.3s ease';
                    priceElement.style.background = '#28a745';
                    priceElement.style.color = 'white';
                    priceElement.style.padding = '2px 8px';
                    priceElement.style.borderRadius = '5px';
                    
                    setTimeout(() => {
                        priceElement.style.background = '';
                        priceElement.style.color = '';
                        priceElement.style.padding = '';
                        priceElement.style.borderRadius = '';
                    }, 2000);
                    
                    console.log(`✅ تم تحديث سعر "${title}" ← "${itemName}" من ${oldPrice} إلى ${newPrice} ج`);
                    updatedItemsCount++;
                    foundMatch = true;
                }
            }
        }
    });
    
    if (!foundMatch) {
        console.log(`❌ لم يتم العثور على تطابق للمنتج: "${itemName}"`);
    }
}

function isMatchingItem(htmlName, adminName) {
    // تنظيف الأسماء للمقارنة
    const cleanHtmlName = htmlName.toLowerCase().trim();
    const cleanAdminName = adminName.toLowerCase().trim();
    
    // فحص خريطة التطابق المباشرة أولاً
    if (productMatchMap[htmlName]) {
        return productMatchMap[htmlName].some(match => 
            match.toLowerCase().trim() === cleanAdminName
        );
    }
    
    // فحص عكسي - إذا كان اسم HTML في خريطة اسم الأدمن
    for (const [menuName, adminMatches] of Object.entries(productMatchMap)) {
        if (adminMatches.some(match => match.toLowerCase().trim() === cleanAdminName)) {
            if (menuName.toLowerCase().trim() === cleanHtmlName) {
                return true;
            }
        }
    }
    
    // مقارنة مباشرة
    if (cleanHtmlName === cleanAdminName) {
        return true;
    }
    
    // مقارنة جزئية (إذا كان اسم الأدمن جزء من اسم HTML)
    if (cleanHtmlName.includes(cleanAdminName) || cleanAdminName.includes(cleanHtmlName)) {
        return true;
    }
    
    // إزالة الكلمات الإضافية
    const removeWords = ['محشي', 'كبير', 'صغير', 'متوسط', 'حصة', 'فردية', 'قطعة', 'قطع'];
    let simplifiedHtml = cleanHtmlName;
    let simplifiedAdmin = cleanAdminName;
    
    removeWords.forEach(word => {
        simplifiedHtml = simplifiedHtml.replace(new RegExp(word, 'g'), '').trim();
        simplifiedAdmin = simplifiedAdmin.replace(new RegExp(word, 'g'), '').trim();
    });
    
    // تنظيف المسافات المتعددة
    simplifiedHtml = simplifiedHtml.replace(/\s+/g, ' ').trim();
    simplifiedAdmin = simplifiedAdmin.replace(/\s+/g, ' ').trim();
    
    // مقارنة بعد التبسيط
    if (simplifiedHtml === simplifiedAdmin) {
        return true;
    }
    
    // مقارنة جزئية بعد التبسيط
    if (simplifiedHtml.includes(simplifiedAdmin) || simplifiedAdmin.includes(simplifiedHtml)) {
        return true;
    }
    
    // مقارنة الكلمات المفتاحية
    const htmlKeywords = simplifiedHtml.split(/[\s\-،]/).filter(w => w.length > 2);
    const adminKeywords = simplifiedAdmin.split(/[\s\-،]/).filter(w => w.length > 2);
    
    if (htmlKeywords.length === 0 || adminKeywords.length === 0) {
        return false;
    }
    
    let matchingWords = 0;
    adminKeywords.forEach(adminWord => {
        htmlKeywords.forEach(htmlWord => {
            if (htmlWord.includes(adminWord) || adminWord.includes(htmlWord)) {
                matchingWords++;
            }
        });
    });
    
    // نسبة التطابق
    const matchRatio = matchingWords / Math.max(htmlKeywords.length, adminKeywords.length);
    
    return matchRatio >= 0.6; // على الأقل 60% من الكلمات متطابقة
}

// تحسين نظام إضافة المنتجات للعربة مع الأسعار المحدثة
function enhanceCartSystem() {
    // التأكد من تحديث الأسعار قبل إضافة المنتجات
    document.addEventListener('click', function(e) {
        if (e.target.closest('.fa-shopping-cart') && e.target.closest('.box')) {
            // التأكد من تحديث السعر قبل الإضافة
            const box = e.target.closest('.box');
            const itemName = box.querySelector('h5').textContent.trim();
            
            // قراءة السعر من بيانات الأدمن
            const adminMenuData = JSON.parse(localStorage.getItem('zad-menu-data') || '[]');
            const adminItem = adminMenuData.find(item => isMatchingItem(itemName, item.name));
            
            if (adminItem) {
                // تحديث السعر في الصفحة قبل إضافته للعربة
                const priceElement = box.querySelector('.options h6');
                if (priceElement) {
                    const currentPrice = priceElement.textContent.replace(' ج', '').trim();
                    if (currentPrice != adminItem.price) {
                        priceElement.textContent = adminItem.price + ' ج';
                        console.log(`تم تحديث سعر "${itemName}" إلى ${adminItem.price} ج قبل الإضافة للعربة`);
                    }
                }
            }
        }
    }, true); // true للتنفيذ قبل cart.js
}

// تشغيل التحسينات
setTimeout(enhanceCartSystem, 100);



// CSS للرسوم المتحركة
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

// فحص إشارات المزامنة الفورية من الأدمن
let lastSyncSignalTime = 0;

function checkSyncSignal() {
    try {
        const syncSignal = JSON.parse(localStorage.getItem('menu-sync-signal') || '{}');
        
        if (syncSignal.timestamp && syncSignal.timestamp > lastSyncSignalTime) {
            console.log('تم استلام إشارة مزامنة من الأدمن:', syncSignal.message);
            
            // تنفيذ المزامنة فوراً
            window.lastAdminDataStr = null; // إجبار التحديث
            syncMenuPrices();
            
            lastSyncSignalTime = syncSignal.timestamp;
            
            // إظهار رسالة تأكيد
            showUpdateNotification('فوري');
        }
    } catch (error) {
        // تجاهل الأخطاء
    }
}

function showUpdateNotification(type) {
    const message = type === 'فوري' ? 
        'تم تحديث الأسعار فوراً من لوحة الأدمن ⚡' : 
        `تم تحديث ${type} ${type === 1 ? 'سعر' : 'أسعار'} من لوحة الأدمن`;
        
    // إنشاء إشعار بصري
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 9999;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        ">
            <i class="fa fa-check-circle"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

console.log('نظام مزامنة القائمة جاهز - سيتم تحديث الأسعار تلقائياً');