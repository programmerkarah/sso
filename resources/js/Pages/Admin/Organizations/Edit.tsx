import { ArrowLeft } from 'lucide-react';

import { FormEventHandler } from 'react';

import { Head, Link, useForm } from '@inertiajs/react';

import GlassCard from '@/Components/GlassCard';
import OrganizationForm from '@/Components/OrganizationForm';
import PageHeader from '@/Components/PageHeader';
import PageWorkspace from '@/Components/PageWorkspace';
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

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        put(`/admin/organizations/${organization.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit - ${organization.name}`} />

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
                        submitLabel="Simpan Perubahan"
                        typeHelp="Identifier ini dipakai oleh aturan akses aplikasi. Ubah hanya bila integrasi yang bergantung pada tipe organisasi juga telah disesuaikan."
                        activeHelp="Jika dinonaktifkan, organisasi tidak dapat dipilih pada pendaftaran baru."
                    />
                </GlassCard>
            </PageWorkspace>
        </AppLayout>
    );
}
