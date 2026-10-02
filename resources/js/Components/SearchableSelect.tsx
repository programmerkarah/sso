import { Search, X } from 'lucide-react';

import { useEffect, useMemo, useRef, useState } from 'react';

import ScrollArea from '@/Components/ScrollArea';

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
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bps-muted)]" />
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
                    className="ui-field w-full rounded-lg py-2.5 pl-10 pr-10 text-sm placeholder:text-[var(--bps-muted)]"
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
                        className="ui-icon-button absolute right-2.5 top-1/2 -translate-y-1/2 rounded border-transparent p-1"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {open && (
                <ScrollArea
                    className="ui-modal-surface absolute z-[75] mt-1.5 w-full rounded-lg shadow-xl"
                    viewportClassName="max-h-72 p-1.5"
                >
                    {filteredOptions.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-[var(--bps-muted)]">
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
                                className="ui-hover flex w-full flex-col rounded-md border border-transparent px-3 py-2.5 text-left"
                            >
                                <span className="text-sm font-medium text-[var(--bps-text)]">
                                    {option.label}
                                </span>
                                {option.description && (
                                    <span className="mt-0.5 text-xs text-[var(--bps-muted)]">
                                        {option.description}
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </ScrollArea>
            )}
        </div>
    );
}
