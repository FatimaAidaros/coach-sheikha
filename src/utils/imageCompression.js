import imageCompression from 'browser-image-compression';

/**
 * ضغط الصور قبل رفعها إلى Supabase Storage
 *
 * presets:
 * - receipt: سند الدفع
 * - certificate: الشهادة
 * - recipe: الوصفة
 */
export async function compressImage(file, preset = 'default') {
  if (!file) {
    throw new Error('لم يتم اختيار صورة.');
  }

  // التأكد أن الملف صورة
  if (!file.type?.startsWith('image/')) {
    throw new Error('الملف المختار ليس صورة.');
  }

  const settings = {
    receipt: {
      maxSizeMB: 0.35,
      maxWidthOrHeight: 1600
    },

    certificate: {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1800
    },

    recipe: {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1400
    },

    default: {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1600
    }
  };

  const selected = settings[preset] || settings.default;

  const options = {
    maxSizeMB: selected.maxSizeMB,
    maxWidthOrHeight: selected.maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.82
  };

  try {
    console.log(
      `الحجم الأصلي: ${(file.size / 1024 / 1024).toFixed(2)} MB`
    );

    const compressedBlob = await imageCompression(file, options);

    // نتأكد أن اسم الملف والصيغة WebP
    const originalName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-');

    const compressedFile = new File(
      [compressedBlob],
      `${originalName || 'image'}.webp`,
      {
        type: 'image/webp',
        lastModified: Date.now()
      }
    );

    console.log(
      `الحجم بعد الضغط: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
    );

    return compressedFile;
  } catch (error) {
    console.error('خطأ أثناء ضغط الصورة:', error);
    throw new Error('تعذر ضغط الصورة. يرجى تجربة صورة أخرى.');
  }
}