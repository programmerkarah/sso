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
    success: 'border-emerald-500/30 text-emerald-100',
    info: 'border-sky-500/30 text-sky-100',
    error: 'border-red-500/30 text-red-100',
    status: 'border-slate-700 text-slate-100',
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
                'pointer-events-auto rounded-xl border bg-slate-900 px-4 py-3 shadow-xl ' +
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
                    <div className="mt-0.5 text-sm leading-5 text-slate-300">
                        {item.message}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => onDismiss(item.id)}
                    className="rounded p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
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
