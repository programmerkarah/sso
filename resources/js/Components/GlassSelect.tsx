import { ChevronDown } from 'lucide-react';

import { useEffect, useMemo, useRef, useState } from 'react';
import ScrollArea from '@/Components/ScrollArea';

interface GlassSelectOption {
    label: string;
    value: string;
    description?: string;
}

interface GlassSelectProps {
    id?: string;
    label?: string;
    value: string;
    options: GlassSelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
}

export default function GlassSelect({
    id,
    label,
    value,
    options,
    onChange,
    placeholder = '-- Pilih opsi --',
    error,
}: GlassSelectProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);

    const selectedOption = useMemo(
        () => options.find((option) => option.value === value),
        [options, value],
    );

    useEffect(() => {
        if (!open) return;

        const handleOutsideClick = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () =>
            document.removeEventListener('mousedown', handleOutsideClick);
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            {label && (
                <label
                    htmlFor={id}
                    className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                    {label}
                </label>
            )}

            <button
                id={id}
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={
                    'flex w-full items-center justify-between rounded-lg border bg-slate-950 px-3.5 py-2.5 text-left text-sm outline-none transition-colors focus:ring-2 ' +
                    (error
                        ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500/20')
                }
            >
                <span
                    className={
                        selectedOption ? 'text-slate-100' : 'text-slate-500'
                    }
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={
                        'h-4 w-4 text-slate-500 transition-transform ' +
                        (open ? 'rotate-180' : '')
                    }
                />
            </button>

            {open && (
                <ScrollArea className="absolute z-[80] mt-1.5 h-64 max-h-64 w-full rounded-lg border border-slate-700 bg-slate-900 shadow-xl" viewportClassName="p-1.5">
                    <button
                        type="button"
                        onClick={() => {
                            onChange('');
                            setOpen(false);
                        }}
                        className={
                            'flex w-full rounded-md px-3 py-2 text-left text-sm transition-colors ' +
                            (value === ''
                                ? 'bg-slate-800 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white')
                        }
                    >
                        {placeholder}
                    </button>

                    {options.map((option) => (
                        <button
                            key={option.value + '-' + option.label}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                            className={
                                'flex w-full flex-col rounded-md px-3 py-2 text-left text-sm transition-colors ' +
                                (value === option.value
                                    ? 'bg-slate-800 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white')
                            }
                        >
                            <span>{option.label}</span>
                            {option.description && (
                                <span className="mt-0.5 text-xs text-slate-500">
                                    {option.description}
                                </span>
                            )}
                        </button>
                    ))}
                </ScrollArea>
            )}

            {error && <p className="mt-1.5 text-sm text-red-300">{error}</p>}
        </div>
    );
}
