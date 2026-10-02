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
        <div className="rounded-2xl border border-[var(--bps-border)] bg-[var(--bps-surface)] p-3 sm:p-5">
            <div className="flex items-center gap-2.5 sm:gap-3">
                {icon && (
                    <div className="flex h-8 w-8 shrink-0 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[var(--bps-surface-soft)] text-[var(--bps-muted)]">
                        {icon}
                    </div>
                )}
                <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide sm:text-xs text-[var(--bps-muted)]">
                        {label}
                    </p>
                    <div className="mt-0.5 text-xl font-semibold sm:mt-1 sm:text-2xl text-[var(--bps-text)]">
                        {value}
                    </div>
                    {hint && (
                        <p className="mt-0.5 text-[11px] sm:mt-1 sm:text-xs text-[var(--bps-muted)]">
                            {hint}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
