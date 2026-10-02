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
        button: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
        icon: 'text-amber-300',
        bg: 'bg-amber-500/10',
    },
    red: {
        button: 'bg-red-600 hover:bg-red-500 text-white',
        icon: 'text-red-300',
        bg: 'bg-red-500/10',
    },
    emerald: {
        button: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        icon: 'text-emerald-300',
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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
                <button
                    type="button"
                    onClick={onCancel}
                    className="absolute right-4 top-4 rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                >
                    <X className="h-5 w-5" />
                </button>

                <div
                    className={
                        'mb-4 flex h-10 w-10 items-center justify-center rounded-lg ' +
                        variantClasses[confirmVariant].bg
                    }
                >
                    <AlertTriangle
                        className={
                            'h-5 w-5 ' + variantClasses[confirmVariant].icon
                        }
                    />
                </div>

                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                    {description}
                </p>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={
                            'rounded-lg px-4 py-2 text-sm font-semibold transition ' +
                            variantClasses[confirmVariant].button
                        }
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
