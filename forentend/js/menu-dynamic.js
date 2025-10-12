// تحديث القائمة ديناميكياً من الباك إند
class MenuDynamicUpdater {
    constructor() {
        this.menuContainer = document.querySelector('.menu_container');
        this.isotopeInstance = null;
        this.init();
    }

    init() {
        // ربط العناصر الموجودة مع قاعدة البيانات أولاً
        setTimeout(() => {
            this.linkExistingItemsByName();
        }, 1000);
        
        // تسجيل listener للتحديثات المباشرة
        if (window.apiService && window.apiService.socket) {
            window.apiService.socket.on('menuItemUpdated', (data) => {
                this.handleMenuItemUpdate(data);
            });
        }
    }

    // تحميل القائمة من الباك إند
    async loadMenuFromBackend() {
        try {
            console.log('🔄 جاري تحميل القائمة من الداتابيز...');
            const response = await window.apiService.getMenu();
            if (response.success && response.data) {
                console.log('📦 البيانات المستلمة:', response.data);
                this.rebuildMenuFromDatabase(response.data);
                console.log('✅ تم تحميل القائمة من الباك إند بنجاح');
            } else {
                throw new Error('لا توجد بيانات في الاستجابة');
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل القائمة:', error);
            // في حالة فشل التحميل، أربط العناصر الموجودة بأسمائها
            this.linkExistingItemsByName();
        }
    }

    // إعادة بناء القائمة من الداتابيز
    rebuildMenuFromDatabase(menuItems) {
        if (!this.menuContainer) return;

        // حفظ العناصر الأصلية كـ backup
        const originalContent = this.menuContainer.innerHTML;
        
        // تنظيف المحتوى الحالي
        this.menuContainer.innerHTML = '';

        // تنظيم العناصر حسب الفئة
        const categories = this.organizeByCategory(menuItems);
        
        // إنشاء العناصر الجديدة
        Object.keys(categories).forEach(category => {
            categories[category].forEach(item => {
                const menuItemHTML = this.createMenuItemHTML(item);
                this.menuContainer.insertAdjacentHTML('beforeend', menuItemHTML);
            });
        });

        // إعادة تفعيل Isotope بعد إضافة العناصر
        this.reinitializeIsotope();
    }

    // إنشاء HTML لعنصر القائمة
    createMenuItemHTML(item) {
        const categoryClass = this.getCategoryClass(item.category);
        
        return `
            <div class="col-sm-6 col-lg-4 all ${categoryClass}" data-menu-id="${item._id}">
                <div class="box">
                    <div>
                        <div class="img-box">
                            <img src="${item.image}" alt="${item.name}" onerror="this.src='images/f1.png'">
                        </div>
                        <div class="detail-box">
                            <h5 class="menu-name">${item.name}</h5>
                            <p class="menu-description">${item.description}</p>
                            <div class="options">
                                <h6 class="price">$${item.price}</h6>
                                <a href="#" onclick="addToCart('${item._id}', '${item.name}', ${item.price}, '${item.image}')">
                                    <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 456.029 456.029" style="enable-background:new 0 0 456.029 456.029;" xml:space="preserve">
                                        <g>
                                            <g>
                                                <path d="M345.6,338.862c-29.184,0-53.248,23.552-53.248,53.248c0,29.184,23.552,53.248,53.248,53.248
                                                 c29.184,0,53.248-23.552,53.248-53.248C398.336,362.926,374.784,338.862,345.6,338.862z"/>
                                            </g>
                                        </g>
                                        <g>
                                            <g>
                                                <path d="M439.296,84.91c-1.024,0-2.56-0.512-4.096-0.512H112.64l-5.12-34.304C104.448,27.566,84.992,10.67,61.952,10.67H20.48
                                                 C9.216,10.67,0,19.886,0,31.15c0,11.264,9.216,20.48,20.48,20.48h41.472c2.56,0,4.608,2.048,5.12,4.608l31.744,216.064
                                                 c4.096,27.136,27.648,47.616,55.296,47.616h212.992c26.624,0,49.664-18.944,55.296-45.056l33.28-166.4
                                                 C457.728,97.71,450.56,84.91,439.296,84.91z"/>
                                            </g>
                                        </g>
                                        <g>
                                            <g>
                                                <path d="M215.04,389.55c-1.024-28.16-24.576-50.688-52.736-50.688c-29.696,1.536-52.224,26.112-51.2,55.296
                                                 c1.024,28.16,24.064,50.688,52.224,50.688C192.512,443.31,216.576,418.734,215.04,389.55z"/>
                                            </g>
                                        </g>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // تحديد كلاس الفئة
    getCategoryClass(category) {
        const categoryMap = {
            'grape': 'grape',
            'stuffed': 'stuffed',
            'kebabs': 'kebabs',
            'salads': 'salads',
            'mix': 'mix'
        };
        return categoryMap[category] || 'all';
    }

    // إعادة تفعيل Isotope
    reinitializeIsotope() {
        // انتظار تحميل العناصر
        setTimeout(() => {
            if (typeof $ !== 'undefined' && $.fn.isotope) {
                this.isotopeInstance = $('.menu_container').isotope({
                    itemSelector: '.menu_container > div',
                    layoutMode: 'fitRows'
                });
                
                // إعادة ربط أزرار الفلتر
                $('.filters_menu li').off('click').on('click', (e) => {
                    const filterValue = $(e.target).attr('data-filter');
                    this.isotopeInstance.isotope({ filter: filterValue });
                    
                    $('.filters_menu li').removeClass('active');
                    $(e.target).addClass('active');
                });
            }
        }, 500);
    }

    // تنظيم العناصر حسب الفئة
    organizeByCategory(items) {
        const categories = {};
        items.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });
        return categories;
    }

    // ربط العناصر الموجودة بأسمائها من الداتابيز
    async linkExistingItemsByName() {
        try {
            console.log('🔄 محاولة ربط العناصر بأسمائها...');
            const response = await window.apiService.getMenu();
            if (response.success && response.data) {
                const menuItems = response.data;
                console.log('📦 منتجات من قاعدة البيانات:', menuItems);
                
                const boxes = document.querySelectorAll('.box');
                console.log(`🔍 العثور على ${boxes.length} عنصر في الصفحة`);
                
                boxes.forEach((box, index) => {
                    const nameElement = box.querySelector('h5');
                    if (nameElement) {
                        const itemName = nameElement.textContent.trim();
                        console.log(`📝 معالجة العنصر ${index + 1}: "${itemName}"`);
                        
                        // البحث عن المنتج المطابق في قاعدة البيانات
                        const matchingItem = menuItems.find(item => {
                            const dbName = item.name.trim().toLowerCase();
                            const pageName = itemName.toLowerCase();
                            
                            return dbName === pageName || 
                                   dbName.includes(pageName) || 
                                   pageName.includes(dbName) ||
                                   this.normalizeArabicText(dbName) === this.normalizeArabicText(pageName);
                        });
                        
                        if (matchingItem) {
                            // إضافة ID من قاعدة البيانات
                            box.setAttribute('data-menu-id', matchingItem._id);
                            console.log(`🔗 تم ربط "${itemName}" بـ ID: ${matchingItem._id}`);
                            
                            // تحديث السعر من قاعدة البيانات
                            const priceElement = box.querySelector('h6, .price, .options h6');
                            if (priceElement) {
                                priceElement.innerHTML = `${matchingItem.price} ج`;
                                console.log(`💰 تحديث السعر إلى: ${matchingItem.price} ج`);
                            }
                            
                            // تحديث الوصف إذا موجود
                            if (matchingItem.description) {
                                const descElement = box.querySelector('p');
                                if (descElement) {
                                    descElement.textContent = matchingItem.description;
                                }
                            }
                        } else {
                            console.log(`❌ لم يتم العثور على مطابق لـ "${itemName}" في قاعدة البيانات`);
                        }
                    }
                });
                
                console.log('✅ انتهى ربط العناصر بقاعدة البيانات');
            }
        } catch (error) {
            console.error('❌ فشل في ربط العناصر:', error);
        }
    }
    
    // تطبيع النص العربي للمقارنة
    normalizeArabicText(text) {
        return text
            .replace(/أ|إ|آ/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    // معالجة تحديث عنصر واحد
    handleMenuItemUpdate(data) {
        const { item } = data;
        console.log('🔄 استقبال تحديث للعنصر:', item);
        
        // البحث عن العنصر بالـ ID
        const element = document.querySelector(`[data-menu-id="${item._id}"]`);
        
        if (element) {
            console.log(`✅ تم العثور على العنصر: ${item.name}`);
            
            // تحديث السعر - البحث عن جميع عناصر السعر المحتملة
            const priceSelectors = ['.price', 'h6', '.item-price', '.options h6'];
            let priceUpdated = false;
            
            priceSelectors.forEach(selector => {
                const priceElement = element.querySelector(selector);
                if (priceElement && !priceUpdated) {
                    priceElement.innerHTML = `<span class="price">${item.price} ج</span>`;
                    priceUpdated = true;
                    console.log(`💰 تم تحديث السعر إلى: ${item.price} ج`);
                }
            });
            
            // تحديث الاسم
            const nameElement = element.querySelector('.menu-name, h5');
            if (nameElement) {
                nameElement.textContent = item.name;
            }
            
            // تحديث الوصف
            const descElement = element.querySelector('.menu-description, p');
            if (descElement && item.description) {
                descElement.textContent = item.description;
            }
            
            // تأثير بصري للتحديث
            element.style.transition = 'all 0.5s ease';
            element.style.transform = 'scale(1.02)';
            element.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.3)';
            element.style.borderColor = '#28a745';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.boxShadow = '';
                element.style.borderColor = '';
            }, 800);
            
            console.log('✅ تم تحديث العنصر بنجاح:', item.name);
        } else {
            console.log(`❌ لم يتم العثور على العنصر بـ ID: ${item._id}`);
            // محاولة البحث بالاسم
            this.findAndUpdateByName(item);
        }
        
        // عرض إشعار للمستخدم
        this.showUpdateNotification(item);
    }

    // البحث والتحديث بالاسم (fallback)
    findAndUpdateByName(item) {
        const boxes = document.querySelectorAll('.box');
        for (let box of boxes) {
            const nameElement = box.querySelector('h5');
            if (nameElement && nameElement.textContent.trim() === item.name) {
                // إضافة الـ ID للعنصر
                box.setAttribute('data-menu-id', item._id);
                
                // تحديث السعر
                const priceElement = box.querySelector('h6, .price');
                if (priceElement) {
                    priceElement.innerHTML = `<span class="price">${item.price} ج</span>`;
                }
                
                console.log(`🔗 تم ربط وتحديث العنصر بالاسم: ${item.name}`);
                break;
            }
        }
    }

    // عرض إشعار التحديث
    showUpdateNotification(item) {
        const notification = document.createElement('div');
        notification.className = 'alert alert-info menu-update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 350px;
            animation: slideInRight 0.5s ease-out;
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
            color: white;
            border: none;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(23, 162, 184, 0.3);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fa fa-bell" style="font-size: 20px; color: #ffbe33;"></i>
                <div>
                    <strong>📝 تحديث القائمة</strong><br>
                    <small>${item.name} - السعر الجديد: $${item.price}</small>
                </div>
            </div>
        `;

        // إضافة الستايل للأنيميشن إذا لم يكن موجود
        if (!document.querySelector('#menu-update-styles')) {
            const style = document.createElement('style');
            style.id = 'menu-update-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .menu-update-notification {
                    animation: slideInRight 0.5s ease-out;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // إخفاء الإشعار بعد 4 ثواني
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }
}

// تشغيل المحدث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // انتظار تحميل API Service
    const checkApiService = () => {
        if (window.apiService) {
            new MenuDynamicUpdater();
            console.log('🔄 Menu Dynamic Updater مفعل');
        } else {
            setTimeout(checkApiService, 100);
        }
    };
    
    checkApiService();
});