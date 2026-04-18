import { ArrowLeft } from 'lucide-react';

import { FormEventHandler } from 'react';

import { Head, Link, useForm } from '@inertiajs/react';

import Button from '@/Components/Button';
import GlassCard from '@/Components/GlassCard';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import AppLayout from '@/Layouts/AppLayout';
import { Application } from '@/types';

interface EditProps {
    application: Application;
    availableOrganizationTypes: string[];
}

export default function Edit({ application, availableOrganizationTypes }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: application.name,
        description: application.description || '',
        domain: application.domain,
        callback_url: application.callback_url,
        logo_url: application.logo_url || '',
        is_active: application.is_active,
        allowed_organization_types: application.allowed_organization_types ?? [],
    });

    const toggleOrgType = (type: string) => {
        const current = data.allowed_organization_types;
        setData(
            'allowed_organization_types',
            current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/admin/applications/${application.route_key}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit - ${application.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={`/admin/applications/${application.route_key}`}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke detail
                        </Link>
                        <h1 className="mt-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-4xl font-black text-transparent drop-shadow-xl sm:text-5xl">
                            Edit Aplikasi
                        </h1>
                        <p className="mt-2 text-white/75">
                            Perbarui informasi aplikasi {application.name}
                        </p>
                    </div>

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
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
                                            : 'border-white/25 focus:border-white/40 focus:ring-white/20'
                                    }`}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-300">
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
                                    required
                                />
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
                                />
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={data.is_active}
                                        onChange={(e) =>
                                            setData(
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                        className="rounded border-white/30 bg-white/10 text-blue-500 shadow-sm focus:ring-white/30"
                                    />
                                    <span className="ml-2 text-sm text-white/85">
                                        Aplikasi Aktif
                                    </span>
                                </label>
                                <p className="mt-1 text-sm text-white/55">
                                    Nonaktifkan untuk mencegah aplikasi ini
                                    menggunakan SSO
                                </p>
                            </div>

                            {availableOrganizationTypes.length > 0 && (
                                <div>
                                    <Label>Tipe Organisasi yang Diizinkan</Label>
                                    <p className="mb-2 text-sm text-white/55">
                                        Hanya pengguna dari tipe organisasi yang dipilih yang dapat mengakses aplikasi ini. Kosongkan untuk izinkan semua.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {availableOrganizationTypes.map((type) => {
                                            const isSelected = data.allowed_organization_types.includes(type);
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => toggleOrgType(type)}
                                                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                                                        isSelected
                                                            ? 'bg-blue-500 text-white shadow'
                                                            : 'border border-white/20 bg-white/10 text-white/70 hover:bg-white/20'
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 border-t pt-6">
                                <Link
                                    href={`/admin/applications/${application.route_key}`}
                                >
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
            </div>
        </AppLayout>
    );
}
