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

    return (
        <div
            className={
                compact
                    ? 'mt-2 grid gap-1'
                    : 'mt-2 grid gap-1.5 rounded-lg border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-700/70 dark:bg-slate-900/30'
            }
        >
            {rules.map((rule) => {
                const Icon = rule.valid ? CheckCircle2 : XCircle;

                return (
                    <div
                        key={rule.label}
                        className={
                            rule.valid
                                ? 'flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400'
                                : 'flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400'
                        }
                    >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span>{rule.label}</span>
                    </div>
                );
            })}
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
    if (!confirmation) return null;

    const matches = password === confirmation;
    const Icon = matches ? CheckCircle2 : XCircle;

    return (
        <p
            className={
                matches
                    ? 'mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400'
                    : 'mt-2 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400'
            }
        >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {matches ? 'Password sudah sama.' : 'Password belum sama.'}
        </p>
    );
}

export function CurrentPasswordHint({
    value,
    status,
}: {
    value: string;
    status: 'idle' | 'checking' | 'match' | 'mismatch';
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

    const matches = status === 'match';
    const Icon = matches ? CheckCircle2 : XCircle;

    return (
        <p
            className={
                matches
                    ? 'mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400'
                    : 'mt-2 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400'
            }
        >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {matches
                ? 'Password sama dengan password yang tersimpan.'
                : 'Password berbeda dengan password yang tersimpan.'}
        </p>
    );
}
