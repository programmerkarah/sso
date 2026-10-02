import { Eye, EyeOff } from 'lucide-react';

import { useState } from 'react';

import { Head, Link, usePage } from '@inertiajs/react';

import Input from '@/Components/Input';
import Label from '@/Components/Label';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status }: { status?: string }) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const csrfToken =
        typeof document !== 'undefined'
            ? (document
                  .querySelector('meta[name="csrf-token"]')
                  ?.getAttribute('content') ?? '')
            : '';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        if (processing) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        setProcessing(true);
        const form = e.currentTarget;

        try {
            const response = await fetch('/csrf-token', {
                method: 'GET',
                credentials: 'same-origin',
                headers: { Accept: 'application/json' },
            });
            const data = (await response.json()) as { token?: string };
            const hiddenToken = form.querySelector<HTMLInputElement>(
                'input[name="_token"]',
            );

            if (hiddenToken) {
                hiddenToken.value = data.token ?? csrfToken;
            }
        } catch {
            // Gunakan token yang tersedia bila refresh token tidak berhasil.
        }

        form.submit();
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="mb-7">
                <h2 className="text-2xl font-semibold tracking-tight text-[#18324a]">
                    Masuk
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6f8495]">
                    Gunakan akun SSO BPS Kota Sawahlunto.
                </p>
            </div>

            {status && (
                <div className="mb-5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-3 text-sm text-emerald-200">
                    {status}
                </div>
            )}

            {errors.username && (
                <div className="mb-5 rounded-lg border border-red-400/20 bg-red-400/10 px-3.5 py-3 text-sm text-red-200">
                    {errors.username}
                </div>
            )}

            <form
                method="POST"
                action="/login"
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <input type="hidden" name="_token" value={csrfToken} />

                <div>
                    <Label
                        htmlFor="username"
                        required
                        className="text-[#29465f] drop-shadow-none"
                    >
                        Username
                    </Label>
                    <Input
                        id="username"
                        type="text"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        placeholder="Username"
                        required
                    />
                </div>

                <div>
                    <Label
                        htmlFor="password"
                        required
                        className="text-[#29465f] drop-shadow-none"
                    >
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="current-password"
                            placeholder="Password"
                            className="pr-12"
                            required
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword((current) => !current)
                            }
                            className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#8799a7] transition hover:text-[#29465f]"
                            aria-label={
                                showPassword
                                    ? 'Sembunyikan password'
                                    : 'Tampilkan password'
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#6f8495]">
                    <input
                        type="checkbox"
                        name="remember"
                        value="1"
                        className="h-4 w-4 rounded border-cyan-900/60 bg-[#041b2d] text-[#00aeef] focus:ring-sky-500/30"
                    />
                    Ingat saya di perangkat ini
                </label>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-[#18324a] transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? 'Memproses...' : 'Masuk'}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#8799a7]">
                Belum memiliki akun?{' '}
                <Link
                    href="/register"
                    className="font-medium text-[#4a9fd7] transition hover:text-[#347fae]"
                >
                    Daftar
                </Link>
            </p>
        </GuestLayout>
    );
}
