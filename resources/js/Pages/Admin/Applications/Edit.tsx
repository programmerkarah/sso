import { ArrowLeft } from 'lucide-react';

import { FormEventHandler } from 'react';

import { Head, Link, useForm } from '@inertiajs/react';

import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import AppLayout from '@/Layouts/AppLayout';
import { Application } from '@/types';

interface EditProps {
    application: Application;
}

export default function Edit({ application }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: application.name,
        description: application.description || '',
        domain: application.domain,
        callback_url: application.callback_url,
        logo_url: application.logo_url || '',
        is_active: application.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/admin/applications/${application.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit - ${application.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={`/admin/applications/${application.id}`}
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke detail
                        </Link>
                        <h1 className="mt-4 text-3xl font-bold text-gray-900">
                            Edit Aplikasi
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Perbarui informasi aplikasi {application.name}
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
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
                                    className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
                                        errors.description
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
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
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Aplikasi Aktif
                                    </span>
                                </label>
                                <p className="mt-1 text-sm text-gray-500">
                                    Nonaktifkan untuk mencegah aplikasi ini
                                    menggunakan SSO
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t pt-6">
                                <Link
                                    href={`/admin/applications/${application.id}`}
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
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
