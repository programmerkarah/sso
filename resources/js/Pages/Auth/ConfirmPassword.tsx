import { FormEventHandler } from 'react';

import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/user/confirm-password', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Password" />

            <div className="mb-6 text-center">
                <div className="mb-4 inline-flex rounded-2xl bg-yellow-500/20 p-4">
                    <ShieldCheck className="h-8 w-8 text-yellow-300" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">
                    Konfirmasi Password
                </h2>
                <p className="text-sm text-white/70">
                    Ini adalah area yang aman. Harap konfirmasi password Anda
                    sebelum melanjutkan.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <Label htmlFor="password" required>
                        Password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoFocus
                        error={errors.password}
                        placeholder="Masukkan password Anda"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={processing}
                    variant="primary"
                >
                    {processing ? 'Memverifikasi...' : 'Konfirmasi'}
                </Button>
            </form>
        </GuestLayout>
    );
}
