import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ToastItem {
    id: string;
    message: string;
    tone: 'success' | 'info' | 'error' | 'status';
    title?: string;
}

interface ToastViewportProps {
    items: ToastItem[];
    onDismiss: (id: string) => void;
    topClassName?: string;
}

const toneClasses: Record<ToastItem['tone'], string> = {
    success: 'border-[#b9dcb3] text-[#4f8a49]',
    info: 'border-[#b8d9ee] text-[#347fae]',
    error: 'border-[#efc3bd] text-[#b85d52]',
    status: 'border-[var(--bps-border)] text-[var(--bps-text)]',
};

const toneIcons = {
    success: CheckCircle2,
    info: Info,
    error: XCircle,
    status: Info,
};

function ToastCard({
    item,
    onDismiss,
}: {
    item: ToastItem;
    onDismiss: (id: string) => void;
}) {
    const Icon = toneIcons[item.tone];

    useEffect(() => {
        const timer = window.setTimeout(() => onDismiss(item.id), 3000);
        return () => window.clearTimeout(timer);
    }, [item.id, onDismiss]);

    return (
        <div
            className={
                'pointer-events-auto rounded-xl border bg-[var(--bps-surface)] px-4 py-3 shadow-xl ' +
                toneClasses[item.tone]
            }
        >
            <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                    {item.title && (
                        <div className="text-sm font-semibold">
                            {item.title}
                        </div>
                    )}
                    <div className="mt-0.5 text-sm leading-5 text-[var(--bps-muted)]">
                        {item.message}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => onDismiss(item.id)}
                    className="rounded p-1 text-[var(--bps-muted)] transition hover:bg-[var(--bps-surface-soft)] hover:text-[var(--bps-text)]"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default function ToastViewport({
    items,
    onDismiss,
    topClassName = 'top-20',
}: ToastViewportProps) {
    if (items.length === 0) return null;

    return createPortal(
        <div
            className={
                'pointer-events-none fixed right-4 z-[9999] flex w-[min(92vw,360px)] flex-col gap-2 ' +
                topClassName
            }
        >
            {items.map((item) => (
                <ToastCard key={item.id} item={item} onDismiss={onDismiss} />
            ))}
        </div>,
        document.body,
    );
}
