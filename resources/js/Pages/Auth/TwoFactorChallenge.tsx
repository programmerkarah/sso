import { ClipboardPaste, KeyRound, LifeBuoy } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { Head, usePage } from '@inertiajs/react';

import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import ToastViewport, { ToastItem } from '@/Components/ToastViewport';
import GuestLayout from '@/Layouts/GuestLayout';

export default function TwoFactorChallenge() {
    const [recovery, setRecovery] = useState(false);
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [processing, setProcessing] = useState(false);
    const [code, setCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');

    const { errors } = usePage<{ errors: Record<string, string> }>().props;

    const localizeTwoFactorMessage = (message?: string): string => {
        if (!message) {
            return 'Kode verifikasi tidak valid. Silakan coba lagi.';
        }

        if (
            message ===
            'The provided two factor authentication code was invalid.'
        ) {
            return 'Kode autentikasi dua faktor yang Anda masukkan tidak valid.';
        }

        if (message === 'The provided two factor recovery code was invalid.') {
            return 'Kode pemulihan dua faktor yang Anda masukkan tidak valid.';
        }

        return message;
    };

    useEffect(() => {
        const message = localizeTwoFactorMessage(
            errors.code ?? errors.recovery_code,
        );
        if (errors.code || errors.recovery_code) {
            setToasts([
                {
                    id: `two-factor-${Date.now()}`,
                    tone: 'error',
                    title: 'Verifikasi 2FA Gagal',
                    message,
                },
            ]);
        }
    }, [errors.code, errors.recovery_code]);

    const handleDigitChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const newDigits = [...digits];
        newDigits[index] = digit;
        setDigits(newDigits);
        const combined = newDigits.join('');
        setCode(combined);

        if (digit && index < 5) {
            digitRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            digitRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            digitRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            digitRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 6);
        if (pasted.length > 0) {
            e.preventDefault();
            const newDigits = Array.from(
                { length: 6 },
                (_, i) => pasted[i] ?? '',
            );
            setDigits(newDigits);
            setCode(newDigits.join(''));
            const lastIndex = Math.min(pasted.length - 1, 5);
            digitRefs.current[lastIndex]?.focus();
        }
    };

    const csrfToken =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? '';

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setProcessing(true);
        const form = e.currentTarget;
        const hiddenToken = form.querySelector<HTMLInputElement>(
            'input[name="_token"]',
        );
        if (hiddenToken) {
            hiddenToken.value = csrfToken;
        }
    };

    const switchMode = () => {
        setRecovery(!recovery);
        setDigits(['', '', '', '', '', '']);
        setCode('');
        setRecoveryCode('');
    };

    return (
        <GuestLayout>
            <Head title="Autentikasi Dua Faktor" />
            <ToastViewport
                items={toasts}
                onDismiss={(id) =>
                    setToasts((current) =>
                        current.filter((item) => item.id !== id),
                    )
                }
                topClassName="top-4"
            />

            <form
                method="POST"
                action="/two-factor-challenge"
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <input type="hidden" name="_token" value={csrfToken} />
                {recovery ? (
                    <input
                        type="hidden"
                        name="recovery_code"
                        value={recoveryCode}
                    />
                ) : (
                    <input type="hidden" name="code" value={code} />
                )}
                <h2 className="text-center text-3xl font-bold text-white drop-shadow-lg">
                    Autentikasi Dua Faktor
                </h2>

                <div className="rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-200 backdrop-blur-sm">
                    {!recovery ? (
                        <p>
                            Masukkan kode 6 digit dari aplikasi autentikator
                            Anda.
                        </p>
                    ) : (
                        <p>Masukkan salah satu kode pemulihan darurat Anda.</p>
                    )}
                </div>

                {!recovery ? (
                    <div className="space-y-4">
                        <div className="block text-sm font-semibold text-white drop-shadow-lg">
                            <KeyRound className="mr-1.5 inline h-4 w-4 opacity-80" />
                            Kode Autentikasi
                        </div>
                        <div className="flex justify-center gap-2">
                            {digits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        digitRefs.current[index] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={2}
                                    value={digit}
                                    onChange={(e) =>
                                        handleDigitChange(index, e.target.value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    onFocus={(e) => e.target.select()}
                                    autoFocus={index === 0}
                                    autoComplete="one-time-code"
                                    className="h-14 w-11 rounded-xl border border-white/30 bg-white/10 text-center text-2xl font-bold text-white backdrop-blur-sm transition-all focus:border-white/70 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 sm:w-12"
                                />
                            ))}
                        </div>
                        <p className="text-center text-xs text-white/50">
                            <ClipboardPaste className="mr-1 inline h-3.5 w-3.5" />
                            Tempel kode dari clipboard untuk mengisi otomatis
                        </p>
                    </div>
                ) : (
                    <div>
                        <Label htmlFor="recovery_code" required>
                            <LifeBuoy className="mr-1.5 inline h-4 w-4 opacity-80" />
                            Kode Pemulihan
                        </Label>
                        <Input
                            id="recovery_code"
                            type="text"
                            name="recovery_code_display"
                            value={recoveryCode}
                            autoComplete="one-time-code"
                            autoFocus
                            onChange={(e) => setRecoveryCode(e.target.value)}
                            placeholder="abcd-efgh"
                            required
                        />
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={switchMode}
                        className="text-sm text-white/80 transition hover:text-white hover:underline"
                    >
                        {!recovery
                            ? 'Gunakan kode pemulihan'
                            : 'Gunakan kode autentikasi'}
                    </button>
                </div>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'Memverifikasi...' : 'Verifikasi'}
                </Button>
            </form>
        </GuestLayout>
    );
}
