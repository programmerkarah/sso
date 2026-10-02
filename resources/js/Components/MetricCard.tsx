import { ReactNode } from 'react';

interface MetricCardProps {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
    hint?: string;
}

export default function MetricCard({
    label,
    value,
    icon,
    hint,
}: MetricCardProps) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                        {icon}
                    </div>
                )}
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {label}
                    </p>
                    <div className="mt-1 text-2xl font-semibold text-white">
                        {value}
                    </div>
                    {hint && (
                        <p className="mt-1 text-xs text-slate-500">{hint}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
