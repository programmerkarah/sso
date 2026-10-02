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
            className={
                'mb-1.5 block text-sm font-medium text-slate-300 ' + className
            }
        >
            {children}
            {required && <span className="ml-1 text-red-400">*</span>}
        </label>
    );
}
