import { ChevronDown } from 'lucide-react';

import { useEffect, useMemo, useRef, useState } from 'react';

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
        const handleOutsideClick = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <div ref={containerRef}>
            {label && (
                <label
                    htmlFor={id}
                    className="mb-2 block text-sm font-medium text-white/80"
                >
                    {label}
                </label>
            )}

            <button
                id={id}
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`flex w-full items-center justify-between rounded-xl border bg-slate-900/60 px-3 py-2.5 text-left text-sm text-white outline-none transition focus:border-white/40 ${error ? 'border-rose-300/40' : 'border-white/20'}`}
            >
                <span className={selectedOption ? 'text-white' : 'text-white/65'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-white/70 transition ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="relative">
                    <div className="absolute z-[80] mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-white/20 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl">
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setOpen(false);
                            }}
                            className={`flex w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                                value === ''
                                    ? 'bg-white/15 text-white'
                                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {placeholder}
                        </button>

                        {options.map((option) => (
                            <button
                                key={`${option.value}-${option.label}`}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className={`flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm transition ${
                                    value === option.value
                                        ? 'bg-white/15 text-white'
                                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <span>{option.label}</span>
                                {option.description && (
                                    <span className="text-xs text-white/55">
                                        {option.description}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {error && <p className="mt-2 text-sm text-rose-200">{error}</p>}
        </div>
    );
}
