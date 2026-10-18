import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '600px' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="custom-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="custom-modal-content"
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        <div className="custom-modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="custom-modal-close"
            onClick={onClose}
            aria-label="إغلاق النافذة"
          >
            <X size={20} />
          </button>
        </div>
        <div className="custom-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
