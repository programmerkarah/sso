import { FormEventHandler } from 'react';

import { Head, Link, useForm } from '@inertiajs/react';

import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <GuestLayout>
            <Head title="Login" />

            {status && (
                <div className="mb-6 rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-sm font-medium text-green-200 backdrop-blur-sm">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
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
                        value={data.username}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('username', e.target.value)}
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
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div>
                    <label className="flex cursor-pointer items-center">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
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
