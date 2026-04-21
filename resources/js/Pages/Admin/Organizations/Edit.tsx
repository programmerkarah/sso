import { ArrowLeft } from 'lucide-react';

import { FormEventHandler } from 'react';

import { Head, Link, useForm } from '@inertiajs/react';

import Button from '@/Components/Button';
import GlassCard from '@/Components/GlassCard';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import AppLayout from '@/Layouts/AppLayout';
import { Organization, PageProps } from '@/types';

interface EditProps extends PageProps {
    organization: Organization;
}

export default function Edit({ organization }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: organization.name,
        type: organization.type,
        description: organization.description || '',
        is_active: organization.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/admin/organizations/${organization.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit - ${organization.name}`} />

            <div className="mx-auto max-w-2xl space-y-8">
                <div>
                    <Link
                        href="/admin/organizations"
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/20"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke daftar
                    </Link>
                    <h1 className="mt-5 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-4xl font-black text-transparent drop-shadow-xl sm:text-5xl">
                        Edit Organisasi
                    </h1>
                </div>

                <GlassCard>
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Label htmlFor="name" required>
                                Nama Organisasi
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                error={errors.name}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="type" required>
                                Tipe (identifier unik)
                            </Label>
                            <Input
                                id="type"
                                name="type"
                                value={data.type}
                                onChange={(e) =>
                                    setData('type', e.target.value)
                                }
                                error={errors.type}
                            />
                            <p className="mt-1 text-xs text-white/50">
                                Gunakan huruf kecil dan underscore. Ubah dengan
                                hati-hati — ini berdampak pada akses aplikasi.
                            </p>
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
                                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white shadow-sm backdrop-blur-sm transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-300">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                    className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-white/30"
                                />
                                <span className="text-sm text-white/85">
                                    Aktif
                                </span>
                            </label>
                            <p className="mt-1 text-xs text-white/50">
                                Menonaktifkan organisasi menyembunyikannya dari
                                form pendaftaran.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-6">
                            <Link href="/admin/organizations">
                                <Button type="button" variant="secondary">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </AppLayout>
    );
}
