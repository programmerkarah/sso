import { AlertTriangle, KeyRound } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Head, useForm } from '@inertiajs/react';

import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import GuestLayout from '@/Layouts/GuestLayout';

interface ChangePasswordForm {
    password: string;
    password_confirmation: string;
}

export default function ChangePassword() {
    const { data, setData, post, processing, errors, reset } =
        useForm<ChangePasswordForm>({
            password: '',
            password_confirmation: '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/settings/change-password', {
            onError: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Ganti Password" />

            <div className="space-y-6">
                <h2 className="text-center text-2xl font-bold text-white drop-shadow-lg">
                    Ganti Password
                </h2>

                {/* Warning Banner */}
                <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200 backdrop-blur-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                        Password Anda telah direset oleh administrator. Anda
                        diwajibkan mengganti password sebelum melanjutkan.
                        Password baru tidak boleh sama dengan password yang Anda
                        gunakan sebelum reset dilakukan.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* New Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-white/90">
                            Password Baru
                        </Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="pl-10"
                                placeholder="Masukkan password baru"
                                required
                                autoFocus
                                autoComplete="new-password"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-300">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="password_confirmation"
                            className="text-white/90"
                        >
                            Konfirmasi Password Baru
                        </Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                className="pl-10"
                                placeholder="Ulangi password baru"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-sm text-red-300">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Password Baru'}
                    </Button>
                </form>
            </div>
        </GuestLayout>
    );
}
