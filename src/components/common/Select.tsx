import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] mb-1.5">
            {label}
            {props.required && <span className="text-[#B85D52] ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none rounded-xl border bg-white dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-sm pl-3.5 pr-10 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B9D83] focus:border-[#8B9D83] disabled:opacity-50 disabled:bg-[#F4EFEA] dark:disabled:bg-[#1A1E19] cursor-pointer ${
              error
                ? 'border-[#B85D52] dark:border-[#B85D52] focus:ring-[#B85D52] focus:border-[#B85D52]'
                : 'border-[#D9D1C5] dark:border-[#353E33]'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA]">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C867E] dark:text-[#8B9D83]">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';
