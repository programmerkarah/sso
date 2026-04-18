import { useState } from 'react';

import { Head, Link, usePage } from '@inertiajs/react';

import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status }: { status?: string }) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [processing, setProcessing] = useState(false);

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
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = (await response.json()) as { token?: string };
            const freshToken = data.token ?? csrfToken;

            const hiddenToken = form.querySelector<HTMLInputElement>(
                'input[name="_token"]',
            );
            if (hiddenToken) {
                hiddenToken.value = freshToken;
            }
        } catch {
            // Fall back to existing token in meta tag when token refresh endpoint is unavailable.
        }

        form.submit();
    };

    return (
        <GuestLayout>
            <Head title="Login" />

            {status && (
                <div className="mb-6 rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-sm font-medium text-green-200 backdrop-blur-sm">
                    {status}
                </div>
            )}

            <form
                method="POST"
                action="/login"
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <input type="hidden" name="_token" value={csrfToken} />
                <h2 className="text-center text-3xl font-bold text-white drop-shadow-lg">
                    Masuk ke Akun
                </h2>

                {errors.username && (
                    <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200 backdrop-blur-sm">
                        {errors.username}
                    </div>
                )}

                <div>
                    <Label htmlFor="username" required>
                        Username
                    </Label>
                    <Input
                        id="username"
                        type="text"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        placeholder="username"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="password" required>
                        Password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div>
                    <label className="flex cursor-pointer items-center">
                        <input
                            type="checkbox"
                            name="remember"
                            value="1"
                            className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 text-blue-500 backdrop-blur-sm focus:ring-2 focus:ring-white/30 focus:ring-offset-0"
                        />
                        <span className="ml-3 text-sm text-white/90">
                            Ingat saya
                        </span>
                    </label>
                </div>

                <div className="space-y-4">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        {processing ? 'Memproses...' : 'Masuk'}
                    </Button>

                    <div className="text-center">
                        <Link
                            href="/register"
                            className="text-sm text-white/80 transition hover:text-white hover:underline"
                        >
                            Belum punya akun?{' '}
                            <span className="font-semibold">Daftar disini</span>
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
