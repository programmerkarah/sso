interface GoogleAuthButtonProps {
    label: string;
    href?: string;
}

export default function GoogleAuthButton({
    label,
    href = '/auth/google',
}: GoogleAuthButtonProps) {
    return (
        <a
            href={href}
            className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-[#d5e1e9] bg-white px-4 py-2.5 text-sm font-semibold text-[#29465f] transition hover:border-[#b8d9ee] hover:bg-[#f4f9fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
        >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-bold text-[#4285f4] shadow-sm">
                G
            </span>
            {label}
        </a>
    );
}
