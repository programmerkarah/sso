import { MailCheck, RefreshCcw } from 'lucide-react';

import { FormEventHandler } from 'react';

import { Head, Link, useForm } from '@inertiajs/react';

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
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-xl">
                    <MailCheck className="h-8 w-8" />
                </div>

                <div className="space-y-3 text-center">
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                        Cek Email Anda Dulu
                    </h2>
                    <p className="text-sm leading-7 text-white/80">
                        Kami sudah mengirim tautan verifikasi ke email Anda.
                        Buka inbox, klik tombol verifikasinya, lalu kembali ke
                        sini untuk mulai menggunakan akun.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/8 p-5 text-sm leading-7 text-white/75 backdrop-blur-sm">
                    <p>
                        Kalau emailnya belum masuk, coba cek folder spam atau
                        promosi. Masih belum ketemu juga? Anda bisa minta kami
                        mengirim ulang tautan verifikasinya.
                    </p>

                    {status === 'verification-link-sent' && (
                        <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">
                            Tautan verifikasi baru sudah kami kirim. Silakan cek
                            inbox Anda lagi.
                        </div>
                    )}
                </div>

                <form onSubmit={submit}>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        {processing
                            ? 'Mengirim ulang...'
                            : 'Kirim Ulang Tautan Verifikasi'}
                    </Button>
                </form>

                <div className="text-center">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="text-sm text-white/75 transition hover:text-white hover:underline"
                    >
                        Keluar dari akun ini
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
