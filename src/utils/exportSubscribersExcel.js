import ExcelJS from '@depup/exceljs';

const COLORS = {
  brown: '8B5E3C',
  darkBrown: '42220F',
  lightBrown: 'F3EAE3',
  veryLightBrown: 'FAF6F2',
  border: 'D8C8BC',
  white: 'FFFFFF',
  green: '4F7958',
  red: 'A44D45',
  orange: 'A87545',
  gray: '6B625C'
};

function getStatusLabel(status) {
  const labels = {
    new: 'جديد',
    under_review: 'قيد المراجعة',
    accepted: 'مقبول',
    completed: 'مكتمل',
    rejected: 'مرفوض'
  };

  return labels[status] || status || '';
}

function getStatusColor(status) {
  switch (status) {
    case 'جديد':
      return COLORS.brown;

    case 'قيد المراجعة':
      return COLORS.orange;

    case 'مقبول':
    case 'مكتمل':
      return COLORS.green;

    case 'مرفوض':
      return COLORS.red;

    default:
      return COLORS.gray;
  }
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('ar-SA');
}

export async function exportSubscribersToExcel(subscriptions) {
  if (!subscriptions || subscriptions.length === 0) {
    alert('لا يوجد مشتركين لتصديرهم');
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Coach Sheikha';

    const worksheet = workbook.addWorksheet('المشتركين');

    // اتجاه الورقة من اليمين إلى اليسار
    worksheet.views = [
      {
        rightToLeft: true,
        showGridLines: false,
        state: 'frozen',
        ySplit: 1
      }
    ];

    // الأعمدة
    worksheet.columns = [
      {
        header: 'رقم',
        key: 'index',
        width: 8
      },
      {
        header: 'اسم المشترك',
        key: 'full_name',
        width: 25
      },
      {
        header: 'رقم الجوال',
        key: 'phone',
        width: 20
      },
      {
        header: 'العمر',
        key: 'age',
        width: 10
      },
      {
        header: 'هدف الاشتراك',
        key: 'goal',
        width: 25
      },
      {
        header: 'الباقة',
        key: 'package',
        width: 28
      },
      {
        header: 'السعر',
        key: 'price',
        width: 15
      },
      {
        header: 'مدة الاشتراك',
        key: 'duration',
        width: 18
      },
      {
        header: 'تاريخ الاشتراك',
        key: 'created_at',
        width: 18
      },
      {
        header: 'تاريخ البداية',
        key: 'start_date',
        width: 18
      },
      {
        header: 'تاريخ النهاية',
        key: 'end_date',
        width: 18
      },
      {
        header: 'الحالة',
        key: 'status',
        width: 18
      }
    ];

    // إضافة البيانات
    subscriptions.forEach((subscription, index) => {
      worksheet.addRow({
        index: index + 1,

        full_name: subscription.full_name || '',

        phone: subscription.phone || '',

        age: subscription.age || '',

        goal: subscription.goal || 'غير محدد',

        package:
          subscription.package_name_snapshot ||
          'باقة مخصصة',

        price:
          subscription.package_price_snapshot ?? '',

        duration: subscription.duration_value
          ? `${subscription.duration_value} ${
              subscription.duration_unit || 'يوم'
            }`
          : '',

        created_at: formatDate(
          subscription.created_at
        ),

        start_date: formatDate(
          subscription.start_date
        ),

        end_date: formatDate(
          subscription.end_date
        ),

        status: getStatusLabel(
          subscription.status
        )
      });
    });

    // ==========================================
    // تنسيق العناوين
    // ==========================================

    const headerRow = worksheet.getRow(1);

    headerRow.height = 35;

    headerRow.eachCell((cell) => {
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: {
          argb: COLORS.white
        }
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: COLORS.brown
        }
      };

      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };

      cell.border = {
        top: {
          style: 'thin',
          color: {
            argb: COLORS.white
          }
        },
        bottom: {
          style: 'thin',
          color: {
            argb: COLORS.white
          }
        },
        left: {
          style: 'thin',
          color: {
            argb: COLORS.white
          }
        },
        right: {
          style: 'thin',
          color: {
            argb: COLORS.white
          }
        }
      };
    });

    // ==========================================
    // تنسيق صفوف البيانات
    // ==========================================

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }

      row.height = 28;

      row.eachCell((cell) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: {
            argb: COLORS.darkBrown
          }
        };

        cell.alignment = {
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        };

        cell.border = {
          top: {
            style: 'thin',
            color: {
              argb: COLORS.border
            }
          },
          bottom: {
            style: 'thin',
            color: {
              argb: COLORS.border
            }
          },
          left: {
            style: 'thin',
            color: {
              argb: COLORS.border
            }
          },
          right: {
            style: 'thin',
            color: {
              argb: COLORS.border
            }
          }
        };

        // صفوف متناوبة
        if (rowNumber % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
              argb: COLORS.veryLightBrown
            }
          };
        }
      });
    });

    // ==========================================
    // رقم
    // ==========================================

    worksheet.getColumn('index').eachCell(
      (cell, rowNumber) => {
        if (rowNumber === 1) {
          return;
        }

        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };

        cell.font = {
          name: 'Arial',
          size: 10,
          bold: true,
          color: {
            argb: COLORS.gray
          }
        };
      }
    );

    // ==========================================
    // العمر
    // ==========================================

    worksheet.getColumn('age').eachCell(
      (cell, rowNumber) => {
        if (rowNumber === 1) {
          return;
        }

        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
      }
    );

    // ==========================================
    // الجوال
    // ==========================================

    worksheet.getColumn('phone').eachCell(
      (cell, rowNumber) => {
        if (rowNumber === 1) {
          return;
        }

        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
      }
    );

    // ==========================================
    // الهدف
    // ==========================================

    worksheet.getColumn('goal').eachCell(
      (cell, rowNumber) => {
        if (rowNumber === 1) {
          return;
        }

        cell.font = {
          name: 'Arial',
          size: 11,
          bold: true,
          color: {
            argb: COLORS.brown
          }
        };
      }
    );

    // ==========================================
    // الباقة
    // ==========================================

    worksheet.getColumn('package').eachCell(
      (cell, rowNumber) => {
        if (rowNumber === 1) {
          return;
        }

        cell.font = {
          name: 'Arial',
          size: 11,
          bold: true,
          color: {
            argb: COLORS.darkBrown
          }
        };
      }
    );

    // ==========================================
    // السعر
    // ==========================================

    worksheet.getColumn('price').eachCell(
      (cell, rowNumber) => {
        if (rowNumber === 1) {
          return;
        }

        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };

        cell.font = {
          name: 'Arial',
          size: 11,
          bold: true,
          color: {
            argb: COLORS.brown
          }
        };
      }
    );

    // ==========================================
    // التواريخ
    // ==========================================

    const dateColumns = [
      'created_at',
      'start_date',
      'end_date'
    ];

    dateColumns.forEach((columnName) => {
      worksheet.getColumn(columnName).eachCell(
        (cell, rowNumber) => {
          if (rowNumber === 1) {
            return;
          }

          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
          };

          cell.font = {
            name: 'Arial',
            size: 10,
            color: {
              argb: COLORS.gray
            }
          };
        }
      );
    });

    // ==========================================
    // الحالة
    // ==========================================

    worksheet.getColumn('status').eachCell(
      (cell, rowNumber) => {
        if (rowNumber === 1) {
          return;
        }

        const status = String(
          cell.value || ''
        );

        cell.font = {
          name: 'Arial',
          size: 11,
          bold: true,
          color: {
            argb: getStatusColor(status)
          }
        };

        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };

        if (status === 'مرفوض') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
              argb: 'F9E8E6'
            }
          };
        } else if (
          status === 'مقبول' ||
          status === 'مكتمل'
        ) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: 'EAF3EC'
          };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: COLORS.lightBrown
          };
        }
      }
    );

    // ==========================================
    // الفلتر
    // ==========================================

    worksheet.autoFilter = {
      from: 'A1',
      to: 'L1'
    };

    // ==========================================
    // إنشاء ملف XLSX
    // ==========================================

    const buffer =
      await workbook.xlsx.writeBuffer();

    const blob = new Blob(
      [buffer],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    );

    // ==========================================
    // تنزيل الملف
    // ==========================================

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    const date = new Date()
      .toISOString()
      .split('T')[0];

    link.download =
      `المشتركين_${date}.xlsx`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(
      'خطأ أثناء إنشاء ملف Excel:',
      error
    );

    alert(
      'حدث خطأ أثناء إنشاء ملف Excel.'
    );
  }
}