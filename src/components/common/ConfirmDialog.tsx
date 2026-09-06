import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={false}>
      <div className="flex flex-col items-center text-center pt-2">
        {isDangerous && (
          <div className="w-12 h-12 rounded-2xl bg-[#B85D52]/15 text-[#B85D52] flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
        )}
        <h3 className="text-base font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
          {title}
        </h3>
        <p className="text-xs text-[#8C867E] dark:text-[#9DB095] mt-2 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full justify-center">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDangerous ? 'danger' : 'primary'}
            className="w-full"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
