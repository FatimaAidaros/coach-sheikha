const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const body = await req.json();

    const {
      full_name,
      age,
      phone,
      goal,
      notes,
      turnstileToken,
      package_id,
      payment_receipt_path,
    } = body;

    // 1. التحقق من Turnstile

    if (!turnstileToken) {
      return new Response(
        JSON.stringify({
          error: 'فشل التحقق الأمني.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const turnstileSecret = Deno.env.get(
      'TURNSTILE_SECRET_KEY'
    );

    if (!turnstileSecret) {
      return new Response(
        JSON.stringify({
          error: 'إعدادات الحماية غير مكتملة على الخادم.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const formData = new FormData();

    formData.append('secret', turnstileSecret);
    formData.append('response', turnstileToken);

    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData,
      }
    );

    const turnstileResult =
      await turnstileResponse.json();

    if (!turnstileResult.success) {
      return new Response(
        JSON.stringify({
          error:
            'فشل التحقق الأمني. يرجى تحديث الصفحة والمحاولة مرة أخرى.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 2. إعدادات Supabase

    const supabaseUrl =
      Deno.env.get('SUPABASE_URL');

    const serviceRoleKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          error: 'إعدادات الخادم غير مكتملة.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 3. التحقق من البيانات

    const parsedAge = Number(age);

    if (
      !full_name ||
      String(full_name).trim().length < 2
    ) {
      return new Response(
        JSON.stringify({
          error: 'يرجى إدخال الاسم بشكل صحيح.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (
      !Number.isInteger(parsedAge) ||
      parsedAge < 12 ||
      parsedAge > 100
    ) {
      return new Response(
        JSON.stringify({
          error: 'العمر يجب أن يكون بين 12 و100 سنة.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (
      !phone ||
      String(phone).trim().length < 5
    ) {
      return new Response(
        JSON.stringify({
          error: 'يرجى إدخال رقم الهاتف بشكل صحيح.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 4. التحقق من حالة التسجيل

    const settingsResponse = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?select=registration_open,registration_auto_reopen,registration_reopen_at,registration_closed_message&limit=1`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!settingsResponse.ok) {
      throw new Error(
        'تعذر قراءة إعدادات التسجيل.'
      );
    }

    const settings =
      await settingsResponse.json();

    const siteSettings = settings?.[0];

    if (!siteSettings) {
      throw new Error(
        'إعدادات الموقع غير موجودة.'
      );
    }

    const now = new Date();

    const registrationOpen =
      siteSettings.registration_open === true ||
      (
        siteSettings.registration_auto_reopen === true &&
        siteSettings.registration_reopen_at &&
        now >=
          new Date(
            siteSettings.registration_reopen_at
          )
      );

    if (!registrationOpen) {
      return new Response(
        JSON.stringify({
          error:
            siteSettings.registration_closed_message ||
            'التسجيل مغلق حالياً، سيتم فتح باب الاشتراك قريباً.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 5. التحقق من الباقة

    let finalPackageId = null;
    let finalPackageName = 'غير محدد';
    let finalPackagePrice = 0;

    if (package_id) {
      const packageResponse = await fetch(
        `${supabaseUrl}/rest/v1/packages?id=eq.${encodeURIComponent(
          package_id
        )}&select=id,name,price,published&limit=1`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      if (!packageResponse.ok) {
        throw new Error(
          'تعذر التحقق من الباقة.'
        );
      }

      const packages =
        await packageResponse.json();

      const selectedPackage =
        packages?.[0];

      if (!selectedPackage) {
        return new Response(
          JSON.stringify({
            error: 'الباقة المحددة غير موجودة.',
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (selectedPackage.published === false) {
        return new Response(
          JSON.stringify({
            error:
              'هذه الباقة غير متاحة حالياً.',
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      finalPackageId = selectedPackage.id;
      finalPackageName = selectedPackage.name;
      finalPackagePrice =
        Number(selectedPackage.price) || 0;
    }

    // 6. إنشاء الاشتراك

    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions`,
      {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          full_name:
            String(full_name).trim(),

          age: parsedAge,

          phone:
            String(phone).trim(),

          goal:
            goal || null,

          package_id:
            finalPackageId,

          package_name_snapshot:
            finalPackageName,

          package_price_snapshot:
            finalPackagePrice,

          payment_receipt_path:
            payment_receipt_path || '',

          notes:
            notes || '',

          status: 'new',
        }),
      }
    );

    if (!insertResponse.ok) {
      const errorText =
        await insertResponse.text();

      console.error(
        'Supabase subscription insert failed:',
        errorText
      );

      return new Response(
        JSON.stringify({
          error:
            'فشل تسجيل الاشتراك. يرجى المحاولة مرة أخرى.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 7. نجاح

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error(
      'quick-endpoint error:',
      error
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'حدث خطأ غير متوقع.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});