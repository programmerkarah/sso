import { Search, X } from 'lucide-react';

import { useEffect, useMemo, useRef, useState } from 'react';

export interface SearchableSelectOption {
    label: string;
    description?: string;
    state_token: string;
}

interface SearchableSelectProps {
    options: SearchableSelectOption[];
    selectedOption?: Omit<SearchableSelectOption, 'state_token'> | null;
    placeholder?: string;
    onSelect: (option: SearchableSelectOption) => void;
    onClear?: () => void;
}

export default function SearchableSelect({
    options,
    selectedOption,
    placeholder = 'Cari...',
    onSelect,
    onClear,
}: SearchableSelectProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(selectedOption?.label ?? '');
    const [hasTypedSinceOpen, setHasTypedSinceOpen] = useState(false);

    useEffect(() => {
        setQuery(selectedOption?.label ?? '');
        setHasTypedSinceOpen(false);
    }, [selectedOption?.label]);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const filteredOptions = useMemo(() => {
        if (open && !hasTypedSinceOpen) return options;

        const normalized = query.trim().toLowerCase();
        if (!normalized) return options;

        return options.filter((option) =>
            (option.label + ' ' + (option.description ?? ''))
                .toLowerCase()
                .includes(normalized),
        );
    }, [options, query, open, hasTypedSinceOpen]);

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    value={query}
                    onFocus={() => {
                        setOpen(true);
                        setHasTypedSinceOpen(false);
                    }}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setOpen(true);
                        setHasTypedSinceOpen(true);
                    }}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-10 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
                {onClear && query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('');
                            setOpen(false);
                            setHasTypedSinceOpen(false);
                            onClear();
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {open && (
                <div className="absolute z-[75] mt-1.5 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-1.5 shadow-xl">
                    {filteredOptions.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-slate-500">
                            Tidak ada hasil.
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <button
                                key={option.state_token}
                                type="button"
                                onClick={() => {
                                    onSelect(option);
                                    setQuery(option.label);
                                    setOpen(false);
                                    setHasTypedSinceOpen(false);
                                }}
                                className="flex w-full flex-col rounded-md px-3 py-2.5 text-left transition-colors hover:bg-slate-800"
                            >
                                <span className="text-sm font-medium text-slate-100">
                                    {option.label}
                                </span>
                                {option.description && (
                                    <span className="mt-0.5 text-xs text-slate-500">
                                        {option.description}
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
