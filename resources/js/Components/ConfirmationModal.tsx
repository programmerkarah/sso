import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant?: 'amber' | 'red' | 'emerald';
    onCancel: () => void;
    onConfirm: () => void;
}

const variantClasses = {
    amber: {
        button: 'bg-amber-500 hover:bg-amber-600 text-white',
        icon: 'text-amber-400',
        border: 'border-amber-400/40',
        bg: 'bg-amber-500/10',
    },
    red: {
        button: 'bg-red-500 hover:bg-red-600 text-white',
        icon: 'text-red-400',
        border: 'border-red-400/40',
        bg: 'bg-red-500/10',
    },
    emerald: {
        button: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        icon: 'text-emerald-400',
        border: 'border-emerald-400/40',
        bg: 'bg-emerald-500/10',
    },
};

export default function ConfirmationModal({
    isOpen,
    title,
    description,
    confirmLabel,
    confirmVariant = 'red',
    onCancel,
    onConfirm,
}: ConfirmationModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
                <button
                    type="button"
                    onClick={onCancel}
                    className="absolute right-4 top-4 rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>

                <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full border ${variantClasses[confirmVariant].border} ${variantClasses[confirmVariant].bg}`}
                >
                    <AlertTriangle
                        className={`h-6 w-6 ${variantClasses[confirmVariant].icon}`}
                    />
                </div>

                <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
                <p className="mb-6 text-sm leading-6 text-white/75">
                    {description}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${variantClasses[confirmVariant].button}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
