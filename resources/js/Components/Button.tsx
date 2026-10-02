import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({
    children,
    variant = 'primary',
    className = '',
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'bg-[#5aaee8] text-white hover:bg-[#4aa3de] focus:ring-[#5aaee8]/30',
        secondary:
            'border border-[#d5e1e9] bg-white text-[#29465f] hover:bg-[#eef5f9] focus:ring-[#5aaee8]/20',
        danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500/30',
    };

    return (
        <button
            {...props}
            className={
                'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ' +
                variants[variant] +
                ' ' +
                className
            }
        >
            {children}
        </button>
    );
}
