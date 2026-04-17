import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', error, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    {...props}
                    ref={ref}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-white/50 shadow-sm backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 ${
                        error
                            ? 'border-red-400/50 bg-white/10 focus:border-red-400 focus:bg-white/20 focus:ring-red-400/30'
                            : 'border-white/30 bg-white/10 focus:border-white/50 focus:bg-white/20 focus:ring-white/30'
                    } ${className}`}
                />
                {error && (
                    <p className="mt-2 text-sm text-red-300 drop-shadow-lg">
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';

export default Input;
