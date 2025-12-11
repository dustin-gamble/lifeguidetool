
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, maxWidth = 'max-w-lg' }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className={`modal-content bg-white p-6 rounded-2xl shadow-2xl w-full ${maxWidth} transition-transform duration-300 scale-100`}
                onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
            >
                {children}
            </div>
        </div>
    );
};

export default Modal;
