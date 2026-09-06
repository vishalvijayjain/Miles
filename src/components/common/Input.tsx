import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] mb-1.5">
            {label}
            {props.required && <span className="text-[#B85D52] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#8C867E] dark:text-[#8B9D83] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl border bg-white dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-sm px-3.5 py-2 transition-colors placeholder:text-[#9E978D] dark:placeholder:text-[#7D887A] focus:outline-none focus:ring-2 focus:ring-[#8B9D83] focus:border-[#8B9D83] disabled:opacity-50 disabled:bg-[#F4EFEA] dark:disabled:bg-[#1A1E19] ${
              leftIcon ? 'pl-9' : ''
            } ${rightElement ? 'pr-10' : ''} ${
              error
                ? 'border-[#B85D52] dark:border-[#B85D52] focus:ring-[#B85D52] focus:border-[#B85D52]'
                : 'border-[#D9D1C5] dark:border-[#353E33]'
            } ${className}`}
            {...props}
          />
          {rightElement && <div className="absolute right-3 flex items-center">{rightElement}</div>}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-[#8A352C] dark:text-[#E29890]">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#8C867E] dark:text-[#9DB095]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
