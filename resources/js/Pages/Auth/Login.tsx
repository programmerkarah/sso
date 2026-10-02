import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
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
            ? (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '')
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
            const hiddenToken = form.querySelector<HTMLInputElement>('input[name="_token"]');
            if (hiddenToken) hiddenToken.value = data.token ?? csrfToken;
        } catch {
            // Gunakan token yang sudah ada bila refresh token tidak tersedia.
        }

        form.submit();
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="mb-7">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                    <LogIn className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">Masuk ke akun SSO</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                    Gunakan username dan password SSO Anda untuk melanjutkan.
                </p>
            </div>

            {status && (
                <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">
                    {status}
                </div>
            )}

            {errors.username && (
                <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
                    {errors.username}
                </div>
            )}

            <form method="POST" action="/login" onSubmit={handleSubmit} className="space-y-5">
                <input type="hidden" name="_token" value={csrfToken} />

                <div>
                    <Label htmlFor="username" required className="text-slate-200 drop-shadow-none">Username</Label>
                    <Input id="username" type="text" name="username" autoComplete="username" autoFocus placeholder="Masukkan username" required />
                </div>

                <div>
                    <Label htmlFor="password" required className="text-slate-200 drop-shadow-none">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="current-password"
                            placeholder="Masukkan password"
                            className="pr-12"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((current) => !current)}
                            className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-400">
                    <input type="checkbox" name="remember" value="1" className="h-4 w-4 rounded border-white/20 bg-slate-950 text-sky-600 focus:ring-sky-500/30" />
                    Tetap masuk di perangkat ini
                </label>

                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <ShieldCheck className="h-4 w-4" />
                    {processing ? 'Memproses...' : 'Masuk'}
                </button>
            </form>

            <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-400">
                Belum memiliki akun?{' '}
                <Link href="/register" className="font-semibold text-sky-300 transition hover:text-sky-200">
                    Daftar akun
                </Link>
            </div>
        </GuestLayout>
    );
}
