'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft, ArrowUpLeft, BadgePercent, Box, Check, ChevronDown, CirclePlus,
  ClipboardList, ExternalLink, Eye, Heart, LayoutGrid, MessageCircle, Package,
  Plus, Search, Settings2, Share2, ShoppingBag, SlidersHorizontal, Sparkles,
  Store, Trash2, TrendingUp, X
} from 'lucide-react';
import styles from './page.module.css';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  emoji: string;
  tone: string;
  description: string;
};

const starterProducts: Product[] = [
  { id: 'p1', name: 'كوب سيراميك أنيق', category: 'هدايا', price: 850, stock: 12, emoji: '☕', tone: 'cream', description: 'كوب أنيق مناسب للاستخدام اليومي والهدايا.' },
  { id: 'p2', name: 'حقيبة يومية', category: 'إكسسوارات', price: 2400, stock: 7, emoji: '👜', tone: 'pink', description: 'حقيبة عملية بتصميم بسيط يناسب كل يوم.' },
  { id: 'p3', name: 'علبة هدايا مميزة', category: 'هدايا', price: 1600, stock: 4, emoji: '🎁', tone: 'lilac', description: 'علبة هدايا بتنسيق جميل للمناسبات الخاصة.' },
  { id: 'p4', name: 'دفتر بتصميم عصري', category: 'قرطاسية', price: 650, stock: 18, emoji: '📒', tone: 'mint', description: 'دفتر أنيق لتدوين الأفكار والملاحظات.' },
  { id: 'p5', name: 'سوار بسيط', category: 'إكسسوارات', price: 500, stock: 2, emoji: '📿', tone: 'peach', description: 'قطعة خفيفة تضيف لمسة لطيفة إلى إطلالتك.' },
  { id: 'p6', name: 'باقة ورد صناعي', category: 'ديكور', price: 1900, stock: 0, emoji: '💐', tone: 'blue', description: 'باقة ديكور جميلة لتزيين المنزل أو المكتب.' },
];

const categories = ['الكل', 'هدايا', 'إكسسوارات', 'قرطاسية', 'ديكور'];
const money = (amount: number) => new Intl.NumberFormat('ar-DZ').format(amount) + ' دج';

export default function Home() {
  const [products, setProducts] = useState<Product[]>(starterProducts);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('الكل');
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');
  const [shopName, setShopName] = useState('متجري الصغير');
  const [whatsapp, setWhatsapp] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'هدايا', price: '', stock: '', emoji: '🎁', description: '' });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('souqi-products');
      const savedName = localStorage.getItem('souqi-shop-name');
      const savedWhatsapp = localStorage.getItem('souqi-whatsapp');
      if (saved) setProducts(JSON.parse(saved));
      if (savedName) setShopName(savedName);
      if (savedWhatsapp) setWhatsapp(savedWhatsapp);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('souqi-products', JSON.stringify(products)); } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('souqi-shop-name', shopName);
      localStorage.setItem('souqi-whatsapp', whatsapp);
    } catch {}
  }, [shopName, whatsapp]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const visibleProducts = useMemo(() => products.filter((p) => {
    const matchesSearch = (p.name + ' ' + p.category).toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (category === 'الكل' || p.category === category);
  }), [products, search, category]);

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 3).length;
  const inStock = products.filter((p) => p.stock > 0).length;

  const addProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price || Number(newProduct.price) < 0) {
      setToast('أدخل اسم المنتج وسعرًا صحيحًا أولًا');
      return;
    }
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: Number(newProduct.price),
      stock: Math.max(0, Number(newProduct.stock) || 0),
      emoji: newProduct.emoji || '📦',
      tone: ['cream', 'pink', 'lilac', 'mint', 'peach', 'blue'][products.length % 6],
      description: newProduct.description.trim() || 'منتج جديد من متجرنا.',
    };
    setProducts((current) => [product, ...current]);
    setNewProduct({ name: '', category: 'هدايا', price: '', stock: '', emoji: '🎁', description: '' });
    setShowForm(false);
    setToast('تمت إضافة المنتج إلى كتالوجك');
  };

  const orderProduct = (product: Product) => {
    if (!whatsapp.trim()) {
      setShowSettings(true);
      setToast('أضف رقم واتساب المتجر لاستقبال الطلبات');
      return;
    }
    const number = whatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent('السلام عليكم، أريد طلب: ' + product.name + ' — السعر ' + money(product.price));
    window.open('https://wa.me/' + number + '?text=' + message, '_blank', 'noopener,noreferrer');
  };

  const shareShop = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setToast('تم نسخ رابط الصفحة الحالية');
    } catch {
      setToast('انسخ رابط الموقع من شريط المتصفح لمشاركته');
    }
  };

  return (
    <main className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}><Store size={23} /></div>
          <div><strong>سوقي</strong><span>متجرك، بطريقتك</span></div>
        </div>
        <div className={styles.sideLabel}>مساحة العمل</div>
        <button className={styles.navActive}><LayoutGrid size={18} /> نظرة عامة</button>
        <button className={styles.navItem} onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}><Package size={18} /> المنتجات <span className={styles.navCount}>{products.length}</span></button>
        <button className={styles.navItem} onClick={() => setShowSettings(true)}><Settings2 size={18} /> إعدادات المتجر</button>
        <div className={styles.sideSpacer} />
        <div className={styles.helpCard}>
          <div className={styles.helpIcon}><Sparkles size={18} /></div>
          <strong>متجرك يبدأ بخطوة</strong>
          <p>أضف منتجاتك وشاركها مع زبائنك بسهولة.</p>
          <button onClick={() => setShowForm(true)}>أضف أول منتج <ArrowUpLeft size={15} /></button>
        </div>
        <div className={styles.sidebarFoot}><span className={styles.onlineDot} /> بياناتك محفوظة على هذا الجهاز</div>
      </aside>

      <section className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}><span>مساحة العمل</span><span className={styles.crumbSlash}>/</span><strong>نظرة عامة</strong></div>
          <div className={styles.topActions}>
            <button className={styles.outlineButton} onClick={() => setShowSettings(true)}><Settings2 size={16} /> إعدادات المتجر</button>
            <button className={styles.primaryButton} onClick={() => setShowForm(true)}><Plus size={17} /> إضافة منتج</button>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.welcome}>
            <div className={styles.welcomeCopy}>
              <div className={styles.eyebrow}><Sparkles size={14} /> مساحة تجارتك الصغيرة</div>
              <h1>أهلًا بك في <span>{shopName || 'متجري الصغير'}</span> 👋</h1>
              <p>رتّب منتجاتك، تابع مخزونك، واجعل طلبات زبائنك أقرب إليك.</p>
              <div className={styles.welcomeButtons}>
                <button className={styles.lightButton} onClick={() => setShowForm(true)}><CirclePlus size={17} /> أضف منتجًا جديدًا</button>
                <button className={styles.textButton} onClick={shareShop}><Share2 size={16} /> مشاركة الصفحة</button>
              </div>
            </div>
            <div className={styles.heroArt}>
              <div className={styles.heroCircle}><ShoppingBag size={55} strokeWidth={1.4} /></div>
              <span className={styles.floatTag}><Check size={14} /> متجرك جاهز</span>
              <span className={styles.floatSpark}>✦</span>
              <span className={styles.floatDot} />
            </div>
          </section>

          <section className={styles.stats}>
            <article className={styles.statCard}>
              <div className={styles.statTop}><span>إجمالي المنتجات</span><div className={styles.statIcon + ' ' + styles.purple}><Package size={19} /></div></div>
              <div className={styles.statValue}>{products.length}<small>منتج</small></div>
              <div className={styles.statFoot}><span className={styles.statPositive}><TrendingUp size={13} /> كتالوجك</span><span>عدد المنتجات المضافة</span></div>
            </article>
            <article className={styles.statCard}>
              <div className={styles.statTop}><span>منتجات متوفرة</span><div className={styles.statIcon + ' ' + styles.green}><Box size={19} /></div></div>
              <div className={styles.statValue}>{inStock}<small>منتج</small></div>
              <div className={styles.statFoot}><span className={styles.greenText}>متاح للبيع</span><span>من أصل {products.length}</span></div>
            </article>
            <article className={styles.statCard}>
              <div className={styles.statTop}><span>مخزون منخفض</span><div className={styles.statIcon + ' ' + styles.orange}><BadgePercent size={19} /></div></div>
              <div className={styles.statValue}>{lowStock}<small>منتج</small></div>
              <div className={styles.statFoot}><span className={lowStock ? styles.orangeText : styles.greenText}>{lowStock ? 'يحتاج إلى انتباه' : 'كل شيء جيد'}</span><span>3 قطع أو أقل</span></div>
            </article>
            <article className={styles.statCard}>
              <div className={styles.statTop}><span>قيمة المخزون</span><div className={styles.statIcon + ' ' + styles.blue}><TrendingUp size={19} /></div></div>
              <div className={styles.statValue + ' ' + styles.moneyValue}>{money(totalValue)}</div>
              <div className={styles.statFoot}><span>تقدير تقريبي</span><span>السعر × الكمية</span></div>
            </article>
          </section>

          <section className={styles.catalog} id="catalog">
            <div className={styles.catalogHeader}>
              <div><h2>منتجاتك</h2><p>إدارة بسيطة لكل ما تعرضه للبيع</p></div>
              <button className={styles.primaryButton} onClick={() => setShowForm(true)}><Plus size={16} /> إضافة منتج</button>
            </div>
            <div className={styles.toolbar}>
              <div className={styles.searchBox}><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن منتج أو تصنيف..." /><SlidersHorizontal size={16} /></div>
              <div className={styles.categoryTabs}>
                {categories.map((item) => <button key={item} className={category === item ? styles.categoryActive : ''} onClick={() => setCategory(item)}>{item}</button>)}
              </div>
            </div>

            {visibleProducts.length ? <div className={styles.productGrid}>
              {visibleProducts.map((product) => <article className={styles.productCard} key={product.id}>
                <div className={styles.productVisual + ' ' + styles[product.tone]}>
                  <span className={styles.productCategory}>{product.category}</span>
                  <span className={styles.productEmoji} role="img" aria-label={product.name}>{product.emoji}</span>
                  <button className={styles.favoriteButton} aria-label="إزالة المنتج" onClick={() => { setProducts((current) => current.filter((p) => p.id !== product.id)); setToast('تم حذف المنتج'); }}><Trash2 size={15} /></button>
                  <span className={styles.visualSpark}>✦</span>
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.productNameRow}><h3>{product.name}</h3><span className={styles.stockBadge + ' ' + (product.stock === 0 ? styles.outStock : product.stock <= 3 ? styles.lowStock : styles.available)}>{product.stock === 0 ? 'نفد المخزون' : product.stock <= 3 ? 'كمية قليلة' : 'متوفر'}</span></div>
                  <p>{product.description}</p>
                  <div className={styles.productMeta}><strong>{money(product.price)}</strong><span>الكمية: {product.stock}</span></div>
                  <button className={styles.orderButton} onClick={() => orderProduct(product)}><MessageCircle size={16} /> اطلب عبر واتساب <ArrowDownLeft size={15} /></button>
                </div>
              </article>)}
            </div> : <div className={styles.emptyState}><div><Search size={25} /></div><strong>لم نعثر على منتجات</strong><p>جرّب تغيير كلمة البحث أو التصنيف.</p><button onClick={() => { setSearch(''); setCategory('الكل'); }}>عرض كل المنتجات</button></div>}
            <div className={styles.catalogFoot}><span>عرض {visibleProducts.length} من {products.length} منتجات</span><span><Eye size={14} /> معاينة كتالوجك</span></div>
          </section>
          <footer className={styles.footer}>صُنع ببساطة لأصحاب المشاريع الصغيرة <span>✦</span> سوقي</footer>
        </div>
      </section>

      {showForm && <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
        <form className={styles.modal} onSubmit={addProduct}>
          <div className={styles.modalHeader}><div><span className={styles.modalIcon}><Package size={19} /></span><h2>إضافة منتج جديد</h2><p>أدخل تفاصيل المنتج لعرضه في كتالوجك.</p></div><button type="button" className={styles.closeButton} onClick={() => setShowForm(false)}><X size={19} /></button></div>
          <label>اسم المنتج<input autoFocus required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="مثال: حقيبة يدوية" /></label>
          <div className={styles.formRow}>
            <label>السعر (دج)<input required type="number" min="0" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="1500" /></label>
            <label>الكمية المتوفرة<input type="number" min="0" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="10" /></label>
          </div>
          <div className={styles.formRow}>
            <label>التصنيف<select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>{categories.filter((c) => c !== 'الكل').map((c) => <option key={c}>{c}</option>)}</select><ChevronDown className={styles.selectChevron} size={14} /></label>
            <label>رمز المنتج<select value={newProduct.emoji} onChange={(e) => setNewProduct({ ...newProduct, emoji: e.target.value })}>{['🎁','☕','👜','📒','📿','💐','🎧','👕','🕯️','🧸','🧴','📦'].map((e) => <option key={e} value={e}>{e}</option>)}</select></label>
          </div>
          <label>وصف قصير <span className={styles.optional}>(اختياري)</span><textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="اكتب وصفًا يشجع الزبون على الشراء..." rows={3} /></label>
          <div className={styles.modalActions}><button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>إلغاء</button><button type="submit" className={styles.primaryButton}><Plus size={16} /> حفظ المنتج</button></div>
        </form>
      </div>}

      {showSettings && <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}>
        <form className={styles.modal} onSubmit={(e) => { e.preventDefault(); setShowSettings(false); setToast('تم حفظ إعدادات المتجر'); }}>
          <div className={styles.modalHeader}><div><span className={styles.modalIcon}><Settings2 size={19} /></span><h2>إعدادات المتجر</h2><p>خصص اسم متجرك وطريقة التواصل مع الزبائن.</p></div><button type="button" className={styles.closeButton} onClick={() => setShowSettings(false)}><X size={19} /></button></div>
          <label>اسم المتجر<input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="اسم مشروعك" /></label>
          <label>رقم واتساب مع رمز الدولة<input dir="ltr" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="213xxxxxxxxx" /><span className={styles.fieldHint}>مثال الجزائر: 213 ثم رقم الهاتف دون الصفر الأول.</span></label>
          <div className={styles.settingsNote}><MessageCircle size={17} /><span>عند ضغط الزبون على «اطلب عبر واتساب»، ستفتح محادثة برسالة تحتوي على اسم المنتج وسعره.</span></div>
          <div className={styles.modalActions}><button type="button" className={styles.cancelButton} onClick={() => setShowSettings(false)}>إلغاء</button><button type="submit" className={styles.primaryButton}><Check size={16} /> حفظ الإعدادات</button></div>
        </form>
      </div>}

      {toast && <div className={styles.toast}><span><Check size={16} /></span>{toast}</div>}
    </main>
  );
}
