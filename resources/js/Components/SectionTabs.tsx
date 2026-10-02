import { ReactNode } from 'react';

export interface SectionTab<T extends string> {
    id: T;
    label: string;
    icon?: ReactNode;
    description?: string;
}

interface SectionTabsProps<T extends string> {
    items: SectionTab<T>[];
    active: T;
    onChange: (id: T) => void;
}

export default function SectionTabs<T extends string>({ items, active, onChange }: SectionTabsProps<T>) {
    return (
        <div className="overflow-x-auto">
            <div className="inline-flex min-w-full gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 sm:min-w-0">
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onChange(item.id)}
                        className={
                            'inline-flex min-w-max items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ' +
                            (active === item.id
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200')
                        }
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
