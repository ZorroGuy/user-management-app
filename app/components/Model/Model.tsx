import React, { ReactNode } from "react";
import "./Model.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-content-header">
          {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold text-lg"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Modal;
