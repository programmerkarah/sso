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
        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        if (open && !hasTypedSinceOpen) {
            return options;
        }

        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return options;
        }

        return options.filter((option) => {
            const haystack =
                `${option.label} ${option.description ?? ''}`.toLowerCase();

            return haystack.includes(normalized);
        });
    }, [options, query]);

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
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
                    className="w-full rounded-xl border border-white/25 bg-white/10 py-3 pl-10 pr-11 text-sm text-white placeholder:text-white/45 backdrop-blur-sm transition focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {open && (
                <div className="absolute z-[75] mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-white/15 bg-slate-950/90 p-2 shadow-2xl backdrop-blur-2xl">
                    {filteredOptions.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-white/55">
                            Tidak ada hasil yang cocok.
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <button
                                key={`${option.label}-${option.description}`}
                                type="button"
                                onClick={() => {
                                    onSelect(option);
                                    setQuery(option.label);
                                    setOpen(false);
                                    setHasTypedSinceOpen(false);
                                }}
                                className="flex w-full flex-col rounded-xl px-3 py-3 text-left transition hover:bg-white/10"
                            >
                                <span className="text-sm font-semibold text-white">
                                    {option.label}
                                </span>
                                {option.description && (
                                    <span className="text-xs text-white/55">
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
