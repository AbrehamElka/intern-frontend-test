// components/ConfirmModal.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isConfirming?: boolean; // To show loading state on confirm button
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  isConfirming = false,
}) => {
  if (!isOpen) {
    return null; // Don't render if not open
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isConfirming}
            className="border-gray-300"
          >
            {cancelButtonText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isConfirming}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isConfirming ? 'Deleting...' : confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};