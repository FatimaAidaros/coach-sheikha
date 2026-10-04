import { supabase, hasSupabase } from '../lib/supabase';
import { compressImage } from '../utils/imageCompression';


const publishedQuery = (table) =>
  supabase
    .from(table)
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

// ==========================================
// 1. إعدادات ومحتوى الموقع
// ==========================================

const ALLOWED_SITE_SETTINGS_KEYS = [
  'coach_name',
  'whatsapp',
  'instagram',
  'email',
  'copyright',
  'registration_open',
  'registration_closed_message',
  'registration_auto_reopen',
  'registration_reopen_at'
];

export async function getSiteSettings() {
  if (!hasSupabase) return siteSettingsFallback || null;
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data || siteSettingsFallback;
  } catch {
    return siteSettingsFallback;
  }
}

export async function saveSiteSettings(updates) {
  if (!hasSupabase) return updates;

  // تنظيف الحقول المرسلة للتوافق التام مع أعمدة جدول site_settings في قاعدة البيانات
  const sanitized = {};
  ALLOWED_SITE_SETTINGS_KEYS.forEach((key) => {
    if (updates[key] !== undefined) {
      sanitized[key] = updates[key];
    }
  });

  // ضبط الحالة وقيم الفتح التلقائي بدقة
  if (sanitized.registration_open !== undefined) {
    sanitized.registration_open = Boolean(sanitized.registration_open);
  }
  if (sanitized.registration_auto_reopen !== undefined) {
    sanitized.registration_auto_reopen = Boolean(sanitized.registration_auto_reopen);
  }

  sanitized.updated_at = new Date().toISOString();

  const current = await getSiteSettings();
  if (current?.id && current.id !== 'default-settings') {
    const { data, error } = await supabase
      .from('site_settings')
      .update(sanitized)
      .eq('id', current.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('site_settings')
      .insert(sanitized)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
export const updateSiteSettings = saveSiteSettings;

/**
 * فحص ديناميكي دقيق لحالة التسجيل العامة:
 * 1. إذا كان registration_open = true -> مفتوح
 * 2. إذا كان registration_open = false و registration_auto_reopen = true وحان موعد registration_reopen_at -> مفتوح تلقائياً
 * 3. خلاف ذلك (بما في ذلك خيار "يبقى مغلقاً" registration_auto_reopen = false) -> مغلق
 */
export function isRegistrationCurrentlyOpen(settings) {
  if (!settings) return false;

  const isOpen = settings.registration_open === true || settings.registration_open === 'true';
  if (isOpen) return true;

  const autoReopen = settings.registration_auto_reopen === true || settings.registration_auto_reopen === 'true';
  if (autoReopen && settings.registration_reopen_at) {
    const reopenTimestamp = new Date(settings.registration_reopen_at).getTime();
    if (!isNaN(reopenTimestamp) && Date.now() >= reopenTimestamp) {
      return true;
    }
  }

  return false;
}

export async function getSiteContent() {
  if (!hasSupabase) {
    throw new Error('Supabase غير متصل.');
  }

  const { data, error } = await supabase
    .from('site_content')
    .select('section, content, image_url, is_published')
    .eq('is_published', true);

  if (error) {
    console.error('getSiteContent error:', error);
    throw error;
  }

  const contentMap = {};

  (data || []).forEach((row) => {
    contentMap[row.section] = {
      ...(row.content || {}),
      ...(row.image_url
        ? { image_url: row.image_url }
        : {})
    };
  });

  return contentMap;
}


export async function saveSiteContent(section, content, imageUrl = null) {
  if (!hasSupabase) {
    throw new Error('Supabase غير متصل.');
  }

  const payload = {
    section,
    content,
    is_published: true,
    updated_at: new Date().toISOString()
  };

  if (imageUrl) {
    payload.image_url = imageUrl;
  }

  const { data, error } = await supabase
    .from('site_content')
    .upsert(payload, {
      onConflict: 'section'
    })
    .select()
    .single();

  if (error) {
    console.error('saveSiteContent error:', error);
    throw error;
  }

  return data;
}

export const updateSiteContent = saveSiteContent;
// ==========================================
// 2. الباقات (Packages)
// ==========================================

export async function getPackages() {
  if (!hasSupabase) {
    throw new Error('Supabase غير متصل.');
  }

  const { data, error } = await publishedQuery('packages');

  if (error) {
    console.error('getPackages error:', error);
    throw error;
  }

  return data || [];
}

export async function getPackage(idOrSlug) {
  const all = await getPackages();
  return all.find((p) => String(p.id) === String(idOrSlug) || p.slug === idOrSlug) || null;
}

/**
 * فحص توفر الباقة للاشتراك:
 * is_available = true -> متوفر
 * is_available = false -> غير متوفر
 */
export function isPackageCurrentlyAvailable(pkg) {
  if (!pkg) return false;
  return pkg.is_available === true || pkg.is_available === 'true';
}

/**
 * إرجاع نص وشارة حالة الباقة:
 * is_available = true -> "متوفر"
 * is_available = false -> "غير متوفر"
 */
export function getPackageStatusInfo(pkg) {
  const isAvail = isPackageCurrentlyAvailable(pkg);
  return {
    isAvailable: isAvail,
    status: isAvail ? 'open' : 'closed',
    text: isAvail ? 'متوفر' : 'غير متوفر',
    badgeText: isAvail ? 'متوفر' : 'غير متوفر',
    buttonText: isAvail ? 'اختيار الباقة' : 'غير متوفر'
  };
}

export async function savePackage(item) {
  if (!hasSupabase) return item;
  const payload = { ...item };
  if (!payload.slug && payload.name) {
    payload.slug = payload.name.trim().toLowerCase().replace(/\s+/g, '-');
  }

  if (payload.is_available !== undefined) {
    payload.is_available = Boolean(payload.is_available);
  }

  // تنظيف أي حقول قديمة لضمان عدم استخدامها
  delete payload.package_auto_reopen;
  delete payload.package_reopen_at;

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from('packages').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deletePackage(id) {
  if (!hasSupabase) return;
  const { error } = await supabase.from('packages').delete().eq('id', id);
  if (error) throw error;
}

// ==========================================
// 3. الوصفات (Recipes)
// ==========================================

export async function getRecipes() {
  if (!hasSupabase) return recipesFallback;
  try {
    const { data, error } = await publishedQuery('recipes');
    if (error || !data || data.length === 0) return recipesFallback;
    return data.map((r) => ({
      ...r,
      image: r.image_url,
      ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
      preparation: Array.isArray(r.preparation) ? r.preparation : []
    }));
  } catch {
    return recipesFallback;
  }
}

export async function getRecipe(idOrSlug) {
  const all = await getRecipes();
  return all.find((r) => String(r.id) === String(idOrSlug) || r.slug === idOrSlug) || null;
}

export async function saveRecipe(item) {
  if (!hasSupabase) return item;
  const payload = { ...item };
  if (!payload.slug && payload.name) {
    payload.slug = payload.name.trim().toLowerCase().replace(/\s+/g, '-');
  }
  const { data, error } = await supabase.from('recipes').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRecipe(id) {
  if (!hasSupabase) return;
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

// ==========================================
// 4. الحسابات البنكية (Bank Accounts)
// ==========================================

export async function getBanks() {
  if (!hasSupabase) return banksFallback;
  try {
    const { data, error } = await publishedQuery('bank_accounts');
    if (error || !data || data.length === 0) return banksFallback;
    return data.map((b) => ({
      ...b,
      name: b.bank_name,
      owner: b.account_name,
      account: b.account_number
    }));
  } catch {
    return banksFallback;
  }
}

export async function saveBankAccount(item) {
  if (!hasSupabase) return item;
  const payload = {
    ...item,
    bank_name: item.bank_name || item.name,
    account_name: item.account_name || item.owner,
    account_number: item.account_number || item.account
  };
  const { data, error } = await supabase.from('bank_accounts').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBankAccount(id) {
  if (!hasSupabase) return;
  const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
  if (error) throw error;
}

// ==========================================
// 5. الشهادات (Certificates)
// ==========================================

export async function getCertificates() {
  if (!hasSupabase) return certificatesFallback;
  try {
    const { data, error } = await publishedQuery('certificates');
    if (error || !data || data.length === 0) return certificatesFallback;
    return data;
  } catch {
    return certificatesFallback;
  }
}

export async function saveCertificate(item) {
  if (!hasSupabase) return item;
  const { data, error } = await supabase.from('certificates').upsert(item).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCertificate(id) {
  if (!hasSupabase) return;
  const { error } = await supabase.from('certificates').delete().eq('id', id);
  if (error) throw error;
}

// ==========================================
// 6. قصص النجاح (Testimonials)
// ==========================================

export async function getTestimonials() {
  if (!hasSupabase) return testimonialsFallback;
  try {
    const { data, error } = await publishedQuery('testimonials');
    if (error || !data || data.length === 0) return testimonialsFallback;
    return data;
  } catch {
    return testimonialsFallback;
  }
}

export async function saveTestimonial(item) {
  if (!hasSupabase) return item;
  const { data, error } = await supabase.from('testimonials').upsert(item).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTestimonial(id) {
  if (!hasSupabase) return;
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw error;
}

// ==========================================
// 7. الاشتراكات وسندات الدفع (Subscriptions)
// ==========================================

export async function getSubscriptions() {
  if (!hasSupabase) return [];
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching subscriptions:', err.message);
    return [];
  }
}

export async function saveSubscription(item) {
  if (!hasSupabase) return item;
  const { data, error } = await supabase.from('subscriptions').upsert(item).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSubscription(id) {
  if (!hasSupabase) return;
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadReceiptFile(file) {
  if (!file) return '';

  try {
    // ==========================================
    // التحقق من نوع الملف
    // ==========================================

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        'نوع الملف غير مدعوم. يرجى رفع صورة JPG أو PNG أو WebP أو ملف PDF.'
      );
    }

    // ==========================================
    // الحد الأقصى للملف الأصلي
    // ==========================================

    const maxFileSize = 5 * 1024 * 1024; // 5 MB

    if (file.size > maxFileSize) {
      throw new Error(
        'حجم الملف كبير جدًا. الحد الأقصى المسموح به هو 5 ميجابايت.'
      );
    }

    let uploadFile;
    let fileName;
    let contentType;

    // ==========================================
    // إذا كان الملف PDF
    // ==========================================

    if (file.type === 'application/pdf') {
      uploadFile = file;

      fileName = `${crypto.randomUUID()}.pdf`;

      contentType = 'application/pdf';
    }

    // ==========================================
    // إذا كان الملف صورة
    // ==========================================

    else {
      uploadFile = await compressImage(file, 'receipt');

      fileName = `${crypto.randomUUID()}.webp`;

      contentType = 'image/webp';
    }

    // ==========================================
    // في حالة عدم وجود Supabase
    // ==========================================

    if (!hasSupabase) {
      return URL.createObjectURL(uploadFile);
    }

    // ==========================================
    // رفع الملف إلى Supabase Storage
    // ==========================================

    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .upload(fileName, uploadFile, {
        cacheControl: '3600',
        upsert: false,
        contentType
      });

    if (error) {
      console.error('تفاصيل خطأ رفع سند الدفع:', error);
      throw error;
    }

    console.log(
      `تم رفع سند الدفع بنجاح: ${fileName}`
    );

    return data.path;

  } catch (err) {
    console.error(
      'خطأ غير متوقع في رفع سند الدفع:',
      err
    );

    throw new Error(
      err.message ||
      'فشل رفع سند الدفع. يرجى المحاولة مرة أخرى.'
    );
  }
}


export async function createSubscription(values, file, selectedPackage) {
  // 1. التأكد من وجود Supabase
  if (!hasSupabase) {
    throw new Error('خدمة الاشتراك غير متاحة حالياً.');
  }

  // 2. التأكد من حالة التسجيل قبل رفع الملف
  const settings = await getSiteSettings();

  if (!isRegistrationCurrentlyOpen(settings)) {
    throw new Error(
      settings?.registration_closed_message ||
        'التسجيل مغلق حالياً، سيتم فتح باب الاشتراك قريباً.'
    );
  }

  // 3. رفع سند الدفع
  let payment_receipt_path = '';

  if (file) {
    payment_receipt_path = await uploadReceiptFile(file);
  }

  // 4. تجهيز بيانات الاشتراك
  const payload = {
    full_name: values.full_name,
    age: parseInt(values.age, 10),
    phone: values.phone,
    goal: values.goal || null,
    notes: values.notes || '',

    package_id:
      selectedPackage?.id &&
      String(selectedPackage.id).length > 20
        ? selectedPackage.id
        : null,

    package_name_snapshot:
      selectedPackage?.name || 'غير محدد',

    package_price_snapshot:
      Number(selectedPackage?.price) || 0,

    payment_receipt_path: payment_receipt_path || '',

    // مهم جدًا
    turnstileToken: values.turnstileToken || '',
  };

  // 5. إرسال البيانات إلى Edge Function
  // بدل الإدخال المباشر في جدول subscriptions
  const { data, error } = await supabase.functions.invoke(
    'quick-endpoint',
    {
      body: payload,
    }
  );

  if (error) {
    console.error(
      'خطأ في Edge Function:',
      error
    );

    // محاولة قراءة رسالة الخطأ القادمة من الدالة
    let functionMessage = '';

    try {
      if (error.context) {
        const responseBody = await error.context.json();
        functionMessage =
          responseBody?.error ||
          responseBody?.message ||
          '';
      }
    } catch {
      // تجاهل خطأ قراءة رسالة الاستجابة
    }

    throw new Error(
      functionMessage ||
        error.message ||
        'فشل تسجيل الاشتراك. يرجى المحاولة مرة أخرى.'
    );
  }

  if (!data?.success) {
    throw new Error(
      data?.error ||
        'فشل تسجيل الاشتراك. يرجى المحاولة مرة أخرى.'
    );
  }

  return {
    success: true,
  };
}



export const getReceiptUrl = getReceiptSignedUrl;

export async function getLocalReceiptFile(receiptPath) {
  if (!receiptPath) return null;
  if (hasSupabase) return await getReceiptSignedUrl(receiptPath);
  return receiptPath;
}

// ==========================================
// 8. عمليات عامة للأدمن (General Admin CRUD)
// ==========================================

export async function uploadPublicImage(bucket, file) {
  if (!file) {
    throw new Error('لم يتم اختيار صورة.');
  }

  // إذا لم يكن Supabase متاحًا
  if (!hasSupabase) {
    return URL.createObjectURL(file);
  }

  // تحديد نوع الصورة حسب الـ bucket
  let preset = 'default';

  if (bucket === 'certificates') {
    preset = 'certificate';
  } else if (bucket === 'recipes-images') {
    preset = 'recipe';
  }

  // ضغط وتحويل الصورة إلى WebP
  const compressedFile = await compressImage(file, preset);

  const cleanFileName = `${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(cleanFileName, compressedFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/webp'
    });

  if (error) {
    console.error('خطأ رفع الصورة:', error);
    throw error;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(cleanFileName);

  return data.publicUrl;
}

export async function adminRows(table) {
  if (!hasSupabase) return [];
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveRow(table, row) {
  if (!hasSupabase) return;
  const { error } = await supabase.from(table).upsert(row);
  if (error) throw error;
}

export async function removeRow(table, id) {
  if (!hasSupabase) return;
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}
export async function getReceiptSignedUrl(path) {
  if (!path || !hasSupabase) return '';

  const { data, error } = await supabase.storage
    .from('payment-receipts')
    .createSignedUrl(path, 60 * 10);

  if (error) {
    console.error('خطأ إنشاء رابط سند الدفع:', error);
    throw error;
  }

  return data.signedUrl;
}