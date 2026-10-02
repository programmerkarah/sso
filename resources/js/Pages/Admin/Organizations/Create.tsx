import { ArrowLeft } from 'lucide-react';

import { FormEventHandler } from 'react';

import { Head, Link, useForm } from '@inertiajs/react';

import GlassCard from '@/Components/GlassCard';
import OrganizationForm from '@/Components/OrganizationForm';
import PageHeader from '@/Components/PageHeader';
import PageWorkspace from '@/Components/PageWorkspace';
import AppLayout from '@/Layouts/AppLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: '',
        description: '',
        is_active: true,
    });

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        post('/admin/organizations');
    };

    return (
        <AppLayout>
            <Head title="Tambah Organisasi" />

            <PageWorkspace
                summary={
                    <PageHeader
                        actions={
                            <Link
                                href="/admin/organizations"
                                className="ui-hover inline-flex items-center gap-2 rounded-lg border border-[var(--bps-border)] bg-[var(--bps-surface)] px-3 py-2 text-sm font-medium text-[var(--bps-muted)]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Daftar organisasi
                            </Link>
                        }
                    />
                }
                contentClassName="mx-auto w-full max-w-3xl"
            >
                <GlassCard>
                    <OrganizationForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                        submitLabel="Simpan Organisasi"
                        typeHelp="Identifier dipakai oleh aturan akses aplikasi. Gunakan huruf kecil tanpa spasi, misalnya internal atau opd."
                    />
                </GlassCard>
            </PageWorkspace>
        </AppLayout>
    );
}
