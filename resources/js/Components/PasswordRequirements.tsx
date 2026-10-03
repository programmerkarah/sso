import { CheckCircle2, Circle, XCircle } from 'lucide-react';

interface PasswordRequirementsProps {
    password: string;
    name?: string;
    username?: string;
    email?: string;
    compact?: boolean;
}

function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/gi, '');
}

export function passwordMeetsRequirements(
    password: string,
    identity?: { name?: string; username?: string; email?: string },
): boolean {
    if (!password) return false;

    const emailLocal = identity?.email?.includes('@')
        ? identity.email.split('@')[0]
        : '';
    const normalizedPassword = normalize(password);
    const disallowedTerms = [
        identity?.name ?? '',
        identity?.username ?? '',
        emailLocal,
    ].filter((term) => term.trim() !== '');

    const containsIdentity = disallowedTerms.some((term) => {
        if (password.toLowerCase().includes(term.trim().toLowerCase())) {
            return true;
        }

        const normalizedTerm = normalize(term.trim());
        return (
            normalizedTerm !== '' &&
            normalizedPassword.includes(normalizedTerm)
        );
    });

    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /\d/.test(password) &&
        /[!@#$%^&*]/.test(password) &&
        !containsIdentity
    );
}

export default function PasswordRequirements({
    password,
    name = '',
    username = '',
    email = '',
    compact = false,
}: PasswordRequirementsProps) {
    if (!password) return null;

    const emailLocal = email.includes('@') ? email.split('@')[0] : '';
    const normalizedPassword = normalize(password);
    const disallowedTerms = [name, username, emailLocal].filter(
        (term) => term.trim() !== '',
    );
    const avoidsIdentity = !disallowedTerms.some((term) => {
        if (password.toLowerCase().includes(term.trim().toLowerCase())) {
            return true;
        }

        const normalizedTerm = normalize(term.trim());
        return (
            normalizedTerm !== '' &&
            normalizedPassword.includes(normalizedTerm)
        );
    });

    const rules = [
        { label: 'Minimal 8 karakter', valid: password.length >= 8 },
        { label: 'Mengandung huruf besar (A-Z)', valid: /[A-Z]/.test(password) },
        { label: 'Mengandung angka (0-9)', valid: /\d/.test(password) },
        { label: 'Mengandung simbol !@#$%^&*', valid: /[!@#$%^&*]/.test(password) },
        {
            label: 'Tidak mengandung nama, username, atau bagian depan email',
            valid: avoidsIdentity,
        },
    ];

    const nextRule = rules.find((rule) => !rule.valid);

    if (!nextRule) return null;

    return (
        <div
            className={
                compact
                    ? 'mt-2'
                    : 'mt-2 rounded-lg border border-rose-200/70 bg-rose-50/60 px-3 py-2 dark:border-rose-900/50 dark:bg-rose-950/20'
            }
        >
            <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                <XCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{nextRule.label}</span>
            </div>
        </div>
    );
}

export function PasswordMatchHint({
    password,
    confirmation,
}: {
    password: string;
    confirmation: string;
}) {
    if (!confirmation || password === confirmation) return null;

    return (
        <p className="mt-2 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <XCircle className="h-3.5 w-3.5 shrink-0" />
            Password belum sama.
        </p>
    );
}

export function CurrentPasswordHint({
    value,
    status,
    focused = false,
}: {
    value: string;
    status: 'idle' | 'checking' | 'match' | 'mismatch';
    focused?: boolean;
}) {
    if (!value || status === 'idle') return null;

    if (status === 'checking') {
        return (
            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Circle className="h-3.5 w-3.5 shrink-0 animate-pulse" />
                Memeriksa password...
            </p>
        );
    }

    if (status === 'match') {
        if (!focused) return null;

        return (
            <p className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                Password sesuai dengan password yang tersimpan.
            </p>
        );
    }

    return (
        <p className="mt-2 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <XCircle className="h-3.5 w-3.5 shrink-0" />
            Password berbeda dengan password yang tersimpan.
        </p>
    );
}
