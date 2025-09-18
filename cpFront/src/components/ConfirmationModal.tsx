

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = true,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="sigum-modal-overlay">
      <div className="sigum-modal-content">
        <div className="sigum-modal-header">
          <i className={`fas ${isDanger ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}></i>
          <h2>{title}</h2>
          <button className="sigum-modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="sigum-modal-body">
          <p>{message}</p>
        </div>
        <div className="sigum-modal-actions">
          <button 
            className="sigum-modal-btn-cancelar" 
            onClick={onClose} 
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className={isDanger ? "sigum-modal-btn-confirm-danger" : "sigum-modal-btn-confirm"} 
            onClick={onConfirm} 
            disabled={isLoading}
          >
            {isLoading ? <span className="sigum-usuario-form-spinner"></span> : <i className="fas fa-trash-alt"></i>}
            {isLoading ? 'Excluindo...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}