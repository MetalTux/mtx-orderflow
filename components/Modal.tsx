// components/Modal.tsx
import React, { ReactNode } from 'react';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center" onClick={onClose}>
      <div className="relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full m-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}