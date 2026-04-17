import { ArrowLeft } from 'lucide-react';

import { FormEventHandler } from 'react';

import { Head, Link, useForm } from '@inertiajs/react';

import Button from '@/Components/Button';
import GlassCard from '@/Components/GlassCard';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import AppLayout from '@/Layouts/AppLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        domain: '',
        callback_url: '',
        logo_url: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/applications');
    };

    return (
        <AppLayout>
            <Head title="Tambah Aplikasi" />

            <div className="mx-auto max-w-5xl space-y-8">
                <div>
                    <Link
                        href="/admin/applications"
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/20"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke daftar
                    </Link>
                    <h1 className="mt-5 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-4xl font-black text-transparent drop-shadow-xl sm:text-5xl">
                        Tambah Aplikasi Baru
                    </h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        Daftarkan aplikasi baru agar bisa memakai Single Sign-On BPS Kota Sawahlunto dengan konfigurasi OAuth yang tepat.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <GlassCard>
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label htmlFor="name" required>
                                    Nama Aplikasi
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    error={errors.name}
                                    placeholder="Contoh: Manajemen Mitra"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Deskripsi</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={3}
                                    className={`w-full rounded-xl border bg-white/10 px-4 py-3 text-sm text-white shadow-sm backdrop-blur-sm transition focus:outline-none focus:ring-2 ${
                                        errors.description
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/40'
                                            : 'border-white/20 focus:border-white/40 focus:ring-white/20'
                                    }`}
                                    placeholder="Deskripsi singkat aplikasi"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="domain" required>
                                    Domain
                                </Label>
                                <Input
                                    id="domain"
                                    name="domain"
                                    value={data.domain}
                                    onChange={(e) =>
                                        setData('domain', e.target.value)
                                    }
                                    error={errors.domain}
                                    placeholder="mitra.sawahlunto.io"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="callback_url" required>
                                    Callback URL
                                </Label>
                                <Input
                                    id="callback_url"
                                    name="callback_url"
                                    value={data.callback_url}
                                    onChange={(e) =>
                                        setData('callback_url', e.target.value)
                                    }
                                    error={errors.callback_url}
                                    placeholder="https://mitra.sawahlunto.io/auth/callback"
                                    required
                                />
                                <p className="mt-1 text-sm text-zinc-200">
                                    URL yang akan menerima authorization code
                                    dari SSO
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="logo_url">Logo URL</Label>
                                <Input
                                    id="logo_url"
                                    name="logo_url"
                                    value={data.logo_url}
                                    onChange={(e) =>
                                        setData('logo_url', e.target.value)
                                    }
                                    error={errors.logo_url}
                                    placeholder="https://example.com/logo.png"
                                />
                                <p className="mt-1 text-sm text-white/60">
                                    URL logo aplikasi (opsional)
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t pt-6">
                                <Link href="/admin/applications">
                                    <Button type="button" variant="secondary">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </form>
                    </GlassCard>

                    <GlassCard>
                        <h2 className="text-xl font-bold text-white">Panduan Singkat</h2>
                        <div className="mt-4 space-y-4 text-sm text-white/75">
                            <div>
                                <div className="font-semibold text-white">Domain</div>
                                <p className="mt-1">Gunakan domain utama aplikasi tanpa protokol tambahan bila tidak diperlukan.</p>
                            </div>
                            <div>
                                <div className="font-semibold text-white">Callback URL</div>
                                <p className="mt-1">Harus mengarah ke endpoint callback OAuth aplikasi tujuan dan bisa diakses dari browser.</p>
                            </div>
                            <div>
                                <div className="font-semibold text-white">Logo</div>
                                <p className="mt-1">Opsional, tetapi disarankan agar daftar aplikasi lebih mudah dikenali pengguna.</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </AppLayout>
    );
}
