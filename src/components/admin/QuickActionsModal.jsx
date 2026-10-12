import React from 'react';
import Modal from '../common/Modal';
import {
  UserPlus,
  PackagePlus,
  ChefHat,
  Award,
  MessageSquareQuote,
  Landmark
} from 'lucide-react';

export default function QuickActionsModal({
  isOpen,
  onClose,
  onOpenAddSubscription,
  onOpenAddPackage,
  onOpenAddRecipe,
  onOpenAddCertificate,
  onOpenAddTestimonial,
  onOpenAddBank
}) {
  const actions = [
    {
      title: 'إضافة اشتراك يدوي',
      desc: 'تسجيل عميلة جديدة مباشرة في النظام',
      icon: UserPlus,
      handler: () => {
        onClose();
        if (onOpenAddSubscription) onOpenAddSubscription();
      }
    },
    {
      title: 'إضافة باقة تدريبية',
      desc: 'برنامج غذائي أو متابعة جديدة',
      icon: PackagePlus,
      handler: () => {
        onClose();
        if (onOpenAddPackage) onOpenAddPackage();
      }
    },
    {
      title: 'إضافة وصفة صحية',
      desc: 'إضافة وجبة أو سموذي جديد بالمكونات',
      icon: ChefHat,
      handler: () => {
        onClose();
        if (onOpenAddRecipe) onOpenAddRecipe();
      }
    },
    {
      title: 'إضافة شهادة معتمدة',
      desc: 'توثيق اعتماد أو شهادة إتمام جديدة',
      icon: Award,
      handler: () => {
        onClose();
        if (onOpenAddCertificate) onOpenAddCertificate();
      }
    },
    {
      title: 'إضافة قصة نجاح',
      desc: 'إدراج تجربة مشتركة ملهمة في الرئيسية',
      icon: MessageSquareQuote,
      handler: () => {
        onClose();
        if (onOpenAddTestimonial) onOpenAddTestimonial();
      }
    },
    {
      title: 'إضافة حساب بنكي',
      desc: 'حساب جديد للتحويل في صفحة الاشتراك',
      icon: Landmark,
      handler: () => {
        onClose();
        if (onOpenAddBank) onOpenAddBank();
      }
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إجراء سريع" maxWidth="600px">
      <div className="quick-actions-grid">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              type="button"
              className="quick-action-item"
              onClick={act.handler}
            >
              <div className="quick-action-icon">
                <Icon size={24} />
              </div>
              <div className="quick-action-text">
                <strong>{act.title}</strong>
                <small>{act.desc}</small>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
