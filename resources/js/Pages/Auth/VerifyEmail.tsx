import { FormEventHandler } from 'react';

import { Head, useForm } from '@inertiajs/react';

import Button from '@/Components/Button';
import GuestLayout from '@/Layouts/GuestLayout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <div className="space-y-6">
                <h2 className="text-center text-3xl font-bold text-white drop-shadow-lg">
                    Verifikasi Email Anda
                </h2>

                <div className="rounded-xl border border-blue-400/30 bg-blue-400/10 p-6 text-sm text-blue-200 backdrop-blur-sm">
                    <p className="mb-4">
                        Terima kasih telah mendaftar! Sebelum memulai, bisakah
                        Anda memverifikasi alamat email Anda dengan mengklik
                        tautan yang baru saja kami kirimkan melalui email? Jika
                        Anda tidak menerima email tersebut, kami dengan senang
                        hati akan mengirimkan yang lain.
                    </p>

                    {status === 'verification-link-sent' && (
                        <div className="mt-4 rounded-lg border border-green-400/30 bg-green-400/10 p-4 text-green-200">
                            Link verifikasi baru telah dikirim ke alamat email
                            yang Anda berikan saat pendaftaran.
                        </div>
                    )}
                </div>

                <form onSubmit={submit}>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        {processing
                            ? 'Mengirim...'
                            : 'Kirim Ulang Email Verifikasi'}
                    </Button>
                </form>

                <div className="text-center">
                    <form method="POST" action="/logout">
                        <input
                            type="hidden"
                            name="_token"
                            value={
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') ?? ''
                            }
                        />
                        <button
                            type="submit"
                            className="text-sm text-white/80 transition hover:text-white hover:underline"
                        >
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
