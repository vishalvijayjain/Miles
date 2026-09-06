import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer select-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[34px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
    lg: 'px-5 py-2.5 text-base gap-2.5 min-h-[46px]',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#4A5D44] text-[#FDFBF7] hover:bg-[#3D4D38] active:bg-[#323F2E] focus:ring-[#8B9D83] shadow-xs dark:bg-[#8B9D83] dark:text-[#191E18] dark:hover:bg-[#9CB094] dark:active:bg-[#7B8D74]',
    secondary:
      'bg-[#EFEAE2] text-[#3D3D3D] hover:bg-[#E8E2D9] active:bg-[#DFD8CC] focus:ring-[#8B9D83] dark:bg-[#2B332A] dark:text-[#F1EFEA] dark:hover:bg-[#353E34]',
    outline:
      'border border-[#D9D1C5] bg-transparent text-[#4A5D44] hover:bg-[#F4EFEA] active:bg-[#EFEAE2] focus:ring-[#8B9D83] dark:border-[#353E33] dark:text-[#F1EFEA] dark:hover:bg-[#222821]',
    ghost:
      'bg-transparent text-[#4A5D44] hover:bg-[#F4EFEA] active:bg-[#EFEAE2] focus:ring-[#8B9D83] dark:text-[#F1EFEA] dark:hover:bg-[#222821]',
    danger:
      'bg-[#B85D52] text-white hover:bg-[#A34E44] active:bg-[#8E4138] focus:ring-[#B85D52] shadow-xs',
    success:
      'bg-[#4A5D44] text-white hover:bg-[#3D4D38] active:bg-[#323F2E] focus:ring-[#8B9D83] shadow-xs',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
