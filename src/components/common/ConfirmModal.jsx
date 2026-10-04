import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد العملية',
  message = 'هل أنت متأكدة من الاستمرار في هذا الإجراء؟ لا يمكن التراجع بعد الحفظ.',
  confirmText = 'تأكيد الحذف',
  cancelText = 'إلغاء',
  isDanger = true,
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="450px">
      <div className="confirm-dialog-content">
        <div className={`confirm-icon ${isDanger ? 'danger' : 'info'}`}>
          <AlertTriangle size={32} />
        </div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button
            type="button"
            className="button outline small"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`button small ${isDanger ? 'btn-danger' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'جاري التنفيذ...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
