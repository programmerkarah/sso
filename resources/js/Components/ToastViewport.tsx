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
    success:
        'border-emerald-300/35 bg-emerald-500/20 text-emerald-50 shadow-emerald-900/30',
    info: 'border-sky-300/35 bg-sky-500/20 text-sky-50 shadow-sky-900/30',
    error: 'border-red-300/35 bg-red-500/20 text-red-50 shadow-red-900/30',
    status: 'border-white/20 bg-white/15 text-white shadow-black/20',
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
        const timer = window.setTimeout(() => onDismiss(item.id), 1500);

        return () => window.clearTimeout(timer);
    }, [item.id, onDismiss]);

    return (
        <div
            className={`pointer-events-auto rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur-2xl ${toneClasses[item.tone]}`}
        >
            <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-white/12 p-2">
                    <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                    {item.title && (
                        <div className="text-sm font-semibold">
                            {item.title}
                        </div>
                    )}
                    <div className="text-sm leading-6 opacity-95">
                        {item.message}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onDismiss(item.id)}
                    className="rounded-lg p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
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
    topClassName = 'top-24',
}: ToastViewportProps) {
    if (items.length === 0) {
        return null;
    }

    return createPortal(
        <div
            className={`pointer-events-none fixed right-4 ${topClassName} z-[9999] flex w-[min(92vw,380px)] flex-col gap-3`}
        >
            {items.map((item) => (
                <ToastCard key={item.id} item={item} onDismiss={onDismiss} />
            ))}
        </div>,
        document.body,
    );
}
