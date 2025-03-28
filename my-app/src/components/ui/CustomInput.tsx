import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils'; // 確保已導入 cn 函式

const CustomInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
          className
        )}
        {...props}
      />
    );
  }
);

CustomInput.displayName = 'CustomInput';
export { CustomInput };
