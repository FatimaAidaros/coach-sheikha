import React from 'react';
import { Link } from 'react-router-dom';
import Modal from '../common/Modal';
import { CheckCircle2, MessageCircle, Home, ExternalLink } from 'lucide-react';

export default function SuccessModal({
  isOpen,
  onClose,
  whatsappUrl,
  customerName
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تأكيد الاشتراك" maxWidth="520px">
      <div className="subscription-success-card">
        <div className="success-icon-badge">
          <CheckCircle2 size={48} />
        </div>

        <h2>تم إرسال طلب الاشتراك بنجاح!</h2>
        {customerName && <p className="customer-greeting">أهلاً بكِ معنا يا {customerName} 🤎</p>}
        <p className="success-instruction">
          سيتم التواصل معك بعد مراجعة الطلب وتأكيد عملية التحويل. يمكنكِ الآن فتح محادثة WhatsApp مباشرة مع الكوتش لتأكيد حجزك.
        </p>

        <div className="success-modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button whatsapp-direct-btn"
              id="btn-whatsapp-chat"
            >
              <MessageCircle size={20} />
              <span>التواصل عبر WhatsApp</span>
              <ExternalLink size={16} />
            </a>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button"
              id="btn-open-whatsapp"
              style={{
                backgroundColor: '#25D366',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
                padding: '12px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
              }}
            >
              <MessageCircle size={20} />
              <span>فتح WhatsApp</span>
              <ExternalLink size={16} />
            </a>
          )}

          <Link to="/" className="button outline" onClick={onClose} style={{ marginTop: '4px' }}>
            <Home size={18} />
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        <p className="popup-notice" style={{ marginTop: '14px' }}>
          إذا منعت إعدادات المتصفح فتح المحادثة تلقائياً، يرجى الضغط على زر <strong>"فتح WhatsApp"</strong> أعلاه.
        </p>
      </div>
    </Modal>
  );
}
