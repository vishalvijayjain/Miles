import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
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

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1A1E19]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog Box / Bottom Sheet */}
      <div
        className={`relative w-full ${maxWidthClasses} bg-[#FDFBF7] dark:bg-[#222821] rounded-t-[28px] sm:rounded-[28px] shadow-2xl border-t sm:border border-[#E8E2D9] dark:border-[#353E33] my-0 sm:my-8 overflow-hidden z-10 max-h-[92vh] sm:max-h-[88vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-[#8C867E]/30 dark:bg-[#8B9D83]/30" />
        </div>

        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#E8E2D9] dark:border-[#2E372D] shrink-0">
            <div className="min-w-0 flex-1 pr-2">
              {typeof title === 'string' ? (
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5] tracking-tight truncate">
                  {title}
                </h2>
              ) : (
                title
              )}
              {description && (
                <p className="text-xs text-[#8C867E] dark:text-[#9DB095] mt-0.5 truncate">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-[#8C867E] hover:text-[#4A5D44] dark:text-[#9DB095] dark:hover:text-[#F1EFEA] min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
