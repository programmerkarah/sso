import { FormEventHandler } from 'react';
import { UserPlus } from 'lucide-react';

import { Head, Link, useForm, usePage } from '@inertiajs/react';

import Input from '@/Components/Input';
import Label from '@/Components/Label';
import SearchableSelect, { SearchableSelectOption } from '@/Components/SearchableSelect';
import GuestLayout from '@/Layouts/GuestLayout';
import { PageProps } from '@/types';

interface Organization {
    id: number;
    name: string;
    type: string;
}

interface RegisterProps extends PageProps {
    organizations: Organization[];
}

export default function Register() {
    const { organizations } = usePage<RegisterProps>().props;
    const hasMultipleOrganizations = organizations.length > 1;
    const organizationSelectOptions: SearchableSelectOption[] = organizations.map((organization) => ({
        label: organization.name,
        description: organization.type,
        state_token: String(organization.id),
    }));

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        organization_id: hasMultipleOrganizations ? '' : String(organizations[0]?.id ?? ''),
    });

    const selectedOrganizationOption = data.organization_id
        ? organizationSelectOptions.find((option) => option.state_token === data.organization_id)
        : null;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun" />

            <div className="mb-7">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                    <UserPlus className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">Buat akun SSO</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                    Lengkapi identitas berikut. Akun baru dapat memerlukan verifikasi administrator sebelum digunakan.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <Label htmlFor="name" required className="text-slate-200 drop-shadow-none">Nama lengkap</Label>
                    <Input id="name" name="name" value={data.name} autoComplete="name" autoFocus onChange={(e) => setData('name', e.target.value)} error={errors.name} placeholder="Nama sesuai identitas" required />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="username" required className="text-slate-200 drop-shadow-none">Username</Label>
                        <Input id="username" name="username" value={data.username} autoComplete="username" onChange={(e) => setData('username', e.target.value)} error={errors.username} placeholder="username" required />
                    </div>
                    <div>
                        <Label htmlFor="email" required className="text-slate-200 drop-shadow-none">Email</Label>
                        <Input id="email" type="email" name="email" value={data.email} autoComplete="email" onChange={(e) => setData('email', e.target.value)} error={errors.email} placeholder="nama@contoh.com" required />
                    </div>
                </div>

                {hasMultipleOrganizations && (
                    <div>
                        <Label required className="text-slate-200 drop-shadow-none">Organisasi / jenis pengguna</Label>
                        <SearchableSelect
                            options={organizationSelectOptions}
                            selectedOption={selectedOrganizationOption ? { label: selectedOrganizationOption.label, description: selectedOrganizationOption.description } : null}
                            placeholder="Cari atau pilih organisasi"
                            onSelect={(option) => setData('organization_id', option.state_token)}
                            onClear={() => setData('organization_id', '')}
                        />
                        {errors.organization_id && <p className="mt-2 text-sm text-red-300">{errors.organization_id}</p>}
                    </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="password" required className="text-slate-200 drop-shadow-none">Password</Label>
                        <Input id="password" type="password" name="password" value={data.password} autoComplete="new-password" onChange={(e) => setData('password', e.target.value)} error={errors.password} placeholder="Minimal 8 karakter" required />
                    </div>
                    <div>
                        <Label htmlFor="password_confirmation" required className="text-slate-200 drop-shadow-none">Konfirmasi</Label>
                        <Input id="password_confirmation" type="password" name="password_confirmation" value={data.password_confirmation} autoComplete="new-password" onChange={(e) => setData('password_confirmation', e.target.value)} error={errors.password_confirmation} placeholder="Ulangi password" required />
                    </div>
                </div>

                <button type="submit" disabled={processing} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60">
                    <UserPlus className="h-4 w-4" />
                    {processing ? 'Membuat akun...' : 'Buat akun'}
                </button>
            </form>

            <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-400">
                Sudah memiliki akun?{' '}
                <Link href="/login" className="font-semibold text-sky-300 transition hover:text-sky-200">
                    Masuk
                </Link>
            </div>
        </GuestLayout>
    );
}
