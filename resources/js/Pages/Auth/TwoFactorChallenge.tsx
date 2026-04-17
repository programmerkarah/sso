import { ClipboardPaste, KeyRound, LifeBuoy } from 'lucide-react';

import { FormEventHandler, useRef, useState } from 'react';

import { Head, useForm } from '@inertiajs/react';

import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import GuestLayout from '@/Layouts/GuestLayout';

export default function TwoFactorChallenge() {
    const [recovery, setRecovery] = useState(false);
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: '',
    });

    const handleDigitChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const newDigits = [...digits];
        newDigits[index] = digit;
        setDigits(newDigits);
        setData('code', newDigits.join(''));

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
            setData('code', newDigits.join(''));
            const lastIndex = Math.min(pasted.length - 1, 5);
            digitRefs.current[lastIndex]?.focus();
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/two-factor-challenge');
    };

    const switchMode = () => {
        setRecovery(!recovery);
        setDigits(['', '', '', '', '', '']);
        setData({ code: '', recovery_code: '' });
    };

    return (
        <GuestLayout>
            <Head title="Autentikasi Dua Faktor" />

            <form onSubmit={submit} className="space-y-6">
                <h2 className="text-center text-3xl font-bold text-white drop-shadow-lg">
                    Autentikasi Dua Faktor
                </h2>

                {(errors.code || errors.recovery_code) && (
                    <div className="rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-sm font-medium text-red-100 backdrop-blur-sm">
                        {errors.code || errors.recovery_code}
                    </div>
                )}

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
                            name="recovery_code"
                            value={data.recovery_code}
                            autoComplete="one-time-code"
                            autoFocus
                            onChange={(e) =>
                                setData('recovery_code', e.target.value)
                            }
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
