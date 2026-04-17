import { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

export default function Label({
    children,
    required = false,
    className = '',
    ...props
}: LabelProps) {
    return (
        <label
            {...props}
            className={`mb-2 block text-sm font-semibold text-white drop-shadow-lg ${className}`}
        >
            {children}
            {required && <span className="ml-1 text-red-300">*</span>}
        </label>
    );
}
