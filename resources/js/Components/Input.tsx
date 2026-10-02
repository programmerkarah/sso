import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', error, ...props }, ref) => (
        <div className="w-full">
            <input
                {...props}
                ref={ref}
                className={
                    'w-full rounded-lg border bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:ring-2 ' +
                    (error
                        ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20 '
                        : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500/20 ') +
                    className
                }
            />
            {error && (
                <p className="mt-1.5 text-sm text-red-300">{error}</p>
            )}
        </div>
    ),
);

Input.displayName = 'Input';

export default Input;
