// Fallback offline / local data for Coach Sheikha platform

export const siteSettingsFallback = {
  id: 'default-settings',
  coach_name: 'كوتش شيخة',
  whatsapp: '967770870321',
  instagram: 'coach_sheikha',
  email: 'contact@coachsheikha.com',
  copyright: '© 2026 كوتش شيخة. جميع الحقوق محفوظة.',
  experience_years: 7,
  registration_open: true,
  // registration_closed_message: 'التسجيل مغلق حالياً، سيتم فتح باب الاشتراك قريباً.',
  registration_auto_reopen: false,
  registration_reopen_at: null
};

export const siteContentFallback = {
  hero: {
    eyebrow: 'أهلاً، أنا كوتش شيخة',
    title: 'صحتكِ تبدأ بخطة تناسبكِ',
    description: 'أساعدك على تحقيق أهدافك الصحية من خلال خطط غذائية مخصصة ومتابعة مستمرة تراعي احتياجاتك ونمط حياتك، لتصلي إلى نتائج مستدامة بخطوات بسيطة وفعّالة.',
    primary_button_text: 'تعرفي علي أكثر',
    secondary_button_text: 'أكتشف الباقات',
    image_url: '/hero.JPG'
  },
  stats: {
    items: [
      { value: '4', label: 'برامج غذائية متنوعة' },
      { value: '+100', label: 'مشتركة حققت أهدافها' },
      { value: '+7', label: 'سنوات الخبرة والمتابعة' }
    ]
  },
  about: {
    title: 'عن الكوتش',
    paragraph_1: 'بدأت رحلتي الصحية عام 2018 بوزن 68 كجم، وخلال سنة ونصف فقدت 28 كجم، حتى وصلت إلى نحافة شديدة جعلتني أدرك أن النحافة لا تعني دائماً الصحة.',
    paragraph_2: 'بعدها بدأت رحلة جديدة لاستعادة توازني وبناء جسمي بطريقة صحية، وتمكنت من تحقيق نتائج أفضل بنظرة محبة ومتزنة، لأن التوازن ورؤية الذات أهم من أي رقم على الميزان.',
    badge: 'رحلة ملهمة نحو التوازن'
  },
  journey: {
    title: 'كيف تبدئين رحلتك مع كوتش شيخة ؟',
    steps: [
      { number: '1', title: 'اختاري الباقة المناسبة', description: 'تصفحي الباقات واختاري الباقة التي تناسبك وأهدافك.' },
      { number: '2', title: 'املئي بيانات الاشتراك', description: 'أدخلي بياناتك الشخصية الأساسية واطلعي على الحسابات البنكية.' },
      { number: '3', title: 'أرفقي سند الدفع', description: 'قومي بتحويل قيمة الباقة وإرسال السند لتأكيد الاشتراك والتواصل فوراً.' }
    ]
  },
  package_comparison: {
    title: 'ما الفرق بين الباقة الأساسية والباقة المخصصة؟',
    description: 'اختاري البرنامج الذي يناسب احتياجاتك وأهدافك الصحية',
    card1: {
      title: 'الباقة الأساسية',
      description: 'برنامج منظم ومناسب لمن ترغب في البدء بخطة صحية واضحة ومتابعة مستمرة.',
      features: [
        'جدول كميات غذائية حسب فئة الوزن',
        'جدول تمارين مرفق',
        'دليل توجيهات وتعليمات',
        'خطة جاهزة ومبسطة',
        'مناسبة للمبتدئات',
        'المتابعة تختلف حسب الباقة المختارة (أسبوعية أو يومية)'
      ]
    },
    card2: {
      title: 'الباقة المخصصة',
      badge: 'الأكثر تفصيلاً',
      description: 'برنامج متكامل مصمم خصيصاً وفق احتياجاتك وأهدافك الدقيقة.',
      features: [
        'جدول كميات مخصص حسب الوزن والهدف',
        'توجيهات وتعليمات مفصلة',
        'جدول رياضي متكامل و مرفق',
        'تعلم كيفية تنظيم وحساب السعرات اليومية',
        'خيارات وبدائل غذائية متنوعة',
        'المتابعة تختلف حسب الباقة المختارة (أسبوعية أو يومية)'
      ]
    }
  },
  cta: {
    title: 'ابدئي رحلتك اليوم',
    description: 'نحو حياة صحية أكثر توازنًا وسعادة',
    button_text: 'اشتركي الآن'
  },
  testimonials: {
    title: 'قصص نجاح وتجارب مشتركاتنا',
    description: 'قصص حقيقية وتجارب ملهمة لمشتركات حققن أهدافهن الصحية والبدنية مع كوتش شيخة.'
  },
  footer: {
    about_text: 'منصة كوتش شيخة للياقة والتغذية الصحية، نساعدك على تحقيق أهدافك بأسلوب حياة صحي ومستدام.',
    contact_prompt: 'تواصلوا معنا عبر الواتساب للاستفسارات والاشتراكات'
  }
};

export const packages = [
  {
    id: 'basic-weekly',
    slug: 'basic-weekly',
    package_type: 'basic',
    name: 'الباقة الأساسية - متابعة أسبوعية',
    price: 15,
    badge: null,
    description: 'خطة غذائية مناسبة لاحتياجك مع متابعة أسبوعية وتعديلات دورية.',
    features: [
      'جدول يوضح كميات الأكل',
      'مرفق مع جدول تمارين',
      'أفكار لوجبات صحية',
      'متابعة أسبوعية للوزن والقياسات'
    ],
    duration_value: 7,
    duration_unit: 'يوم',
    is_available: true,
    is_published: true,
    display_order: 1
  },
  {
    id: 'basic-daily',
    slug: 'basic-daily',
    package_type: 'basic',
    name: 'الباقة الأساسية - متابعة يومية',
    price: 399,
    badge: null,
    description: 'خطة غذائية متكاملة مع متابعة يومية مستمرة ودعم مباشر.',
    features: [
      'متابعة يومية دقيقة للوجبات',
      'إرسال صور الوجبات للنقد والتعديل',
      'مرفق مع جدول تمارين وتحديات',
      'دعم فوري للإجابة على التساؤلات'
    ],
    duration_value: 30,
    duration_unit: 'يوم',
    is_available: true,
    is_published: true,
    display_order: 2
  },
  {
    id: 'custom-weekly',
    slug: 'custom-weekly',
    package_type: 'custom',
    name: 'الباقة المخصصة - متابعة أسبوعية',
    price: 499,
    badge: null,
    description: 'خطة تناسب أهدافك وأكلاتك المفضلة مع متابعة أسبوعية شاملة.',
    features: [
      'تصميم جدول غذائي مفصل 100%',
      'خيارات صحية وبدائل مهمة متنوعة',
      'تقرير أداء أسبوعي لتحليل التطور',
      'متابعة الوزن دورياً مع الكوتش'
    ],
    duration_value: 14,
    duration_unit: 'يوم',
    is_available: true,
    is_published: true,
    display_order: 3
  },
  {
    id: 'custom-daily',
    slug: 'custom-daily',
    package_type: 'custom',
    name: 'الباقة المخصصة - متابعة يومية',
    price: 699,
    badge: 'الأكثر شمولاً',
    description: 'تجربة تدريبية وغذائية كاملة بتخصيص 100% ومتابعة يومية دقيقة.',
    features: [
      'تصميم جدول مخصص وتحديثه دورياً',
      'تحديث الخطة يومياً عند الحاجة',
      'متابعة دقيقة للتطور النفسي والجسدي',
      'قياس الوزن أسبوعياً وتعديل السعرات'
    ],
    duration_value: 30,
    duration_unit: 'يوم',
    is_available: true,
    is_published: true,
    display_order: 4
  }
];

export const recipes = [
  {
    id: 'oats-bowl',
    slug: 'oats-bowl',
    name: 'طبق الشوفان الصحي',
    short_description: 'فطور مشبع وسهل التحضير لبداية يوم متوازنة وغنية بالألياف.',
    description: 'وجبة إفطار متوازنة تمنحك طاقة مستدامة طوال الصباح بفضل احتوائها على الشوفان المعقد والألياف والبروتين الطبيعي.',
    image_url: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=80',
    ingredients: ['½ كوب شوفان كامل الحبة', 'كوب حليب أو زبادي يوناني', 'نصف حبة موز مقطعة', 'حفنة توت مشكل', 'ملعقة صغيرة عسل طبيعي'],
    preparation: ['اخلطي الشوفان مع الحليب أو الزبادي في وعاء مناسب.', 'اتركيه لمدة خمس دقائق حتى يتشرب جيداً.', 'أضيفي شرائح الموز والتوت ورشة العسل وقدميه مباشرة.'],
    calories: 340,
    protein: 14,
    carbs: 52,
    fats: 9,
    health_benefits: 'يعزز صحة الجهاز الهضمي، يضبط مستويات السكر بالدم، ويمنح شعوراً طويلاً بالشبع والامتلاء.',
    notes: 'يمكنكِ استبدال الحليب بماء ساخن إذا كنتِ تفضلين وجبة أخف سعرات.',
    is_published: true,
    display_order: 1
  },
  {
    id: 'chicken-salad',
    slug: 'chicken-salad',
    name: 'سلطة الدجاج المشبعة',
    short_description: 'وجبة غداء خفيفة وغنية بالبروتين النظيف لتعزيز الشبع والنشاط.',
    description: 'سلطة منعشة تجمع بين الخضار الورقية الطازجة ومصدر بروتين نظيف من صدور الدجاج المشوية بتتبيلة الليمون وزيت الزيتون البكر.',
    image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    ingredients: ['150غ صدر دجاج مشوي مقطع', 'خس روماني وجرجير طازج', 'طماطم كرزية مقطعة', 'نصف حبة أفوكادو', 'ملعقة زيت زيتون بكر', 'عصير نصف ليمونة'],
    preparation: ['اغسلي الخضار وقطعيها في طبق التقديم.', 'أضيفي قطع الدجاج المشوي الدافئة.', 'امزجي زيت الزيتون مع الليمون والملح واسكبيه فوق السلطة.'],
    calories: 410,
    protein: 38,
    carbs: 21,
    fats: 19,
    health_benefits: 'غنية بالبروتين عالي الجودة لبناء وتجديد العضلات، وتحتوي على دهون غير مشبعة تدعم صحة القلب.',
    notes: 'أضيفي التتبيلة قبل التناول مباشرة لتحافظي على قرمشة الخضار.',
    is_published: true,
    display_order: 2
  },
  {
    id: 'green-smoothie',
    slug: 'green-smoothie',
    name: 'سموذي أخضر منعش',
    short_description: 'مشروب سريع يدعم نشاطك ومناعتك بين الوجبات الرئيسية.',
    description: 'سموذي خفيف ومنعش يجمع بين أوراق السبانخ والتفاح الأخضر والموز لمد الجسم بالفيتامينات والمعادن الأساسية ومضادات الأكسدة.',
    image_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=900&q=80',
    ingredients: ['كوب سبانخ طازجة', 'حبة موز مثلجة', 'نصف حبة تفاح أخضر', 'كوب ماء بارد', 'عصير ليمونة', 'أوراق نعناع طازجة'],
    preparation: ['ضعي السبانخ والموز والتفاح في خلاط عالي السرعة.', 'أضيفي الماء البارد وعصير الليمون والنعناع.', 'اخلطي جيداً حتى يصبح القوام ناعماً ومتجانساً وقدميه بارداً.'],
    calories: 190,
    protein: 4,
    carbs: 42,
    fats: 1,
    health_benefits: 'يساعد في ترطيب الجسم وتزويده بمضادات الأكسدة والحديد ومصدر طاقة طبيعي وسريع.',
    notes: 'يمكن إضافة ملعقة من بذور الشيا لزيادة الألياف والدهون الصحية.',
    is_published: true,
    display_order: 3
  }
];

export const banks = [
  { id: '1', bank_name: 'شركة العمقي وإخوانه', account_name: 'شيخة', account_number: '254092562', is_published: true, display_order: 1 },
  { id: '2', bank_name: 'بي كاش اليسري', account_name: 'شيخة', account_number: '730607417', is_published: true, display_order: 2 },
  { id: '3', bank_name: 'بنك الكريمي', account_name: 'شيخة', account_number: '3194929737', is_published: true, display_order: 3 },
  { id: '4', bank_name: 'بنك دول التجاري', account_name: 'شيخة', account_number: '329047', is_published: true, display_order: 4 }
];

export const certificates = [
  {
    id: 'cert-1',
    title: 'Mezan Academy Certificate of Completion',
    description: 'شهادة إتمام معتمدة في تدريب وتغذية رياضية متقدمة.',
    image_url: '/لوقو شيخه.jpeg',
    is_published: true,
    display_order: 1
  },
  {
    id: 'cert-2',
    title: 'إدراك - Level Completion Certificate',
    description: 'شهادة تخصص في تصميم خطة إنقاص وزن شخصية ومستدامة.',
    image_url: '/لوقو شيخه.jpeg',
    is_published: true,
    display_order: 2
  }
];

export const testimonials = [
  {
    id: 't-1',
    name: 'نورا محمد',
    content: 'كوتش رسمنا ما شاء الله، اللهم بارك مقاسي تغير من L إلى M والنفسية فرقت كثير!',
    image_url: null,
    is_published: true,
    display_order: 1
  },
  {
    id: 't-2',
    name: 'بنت شيفاء',
    content: 'والحمدلله اليوم صار وزني مثالي ولي سنتين ثابتة على الوزن بنمط متزن.',
    image_url: null,
    is_published: true,
    display_order: 2
  },
  {
    id: 't-3',
    name: 'شيماء علي',
    content: 'نزلت 12 كيلو معاك كوتش، كان حلم بالنسبة لي واليوم أعيش حلمي بثقة وسعادة.',
    image_url: null,
    is_published: true,
    display_order: 3
  }
];
