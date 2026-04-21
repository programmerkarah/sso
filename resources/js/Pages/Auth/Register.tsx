import { FormEventHandler } from 'react';

import { Head, Link, useForm, usePage } from '@inertiajs/react';

import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import SearchableSelect, {
    SearchableSelectOption,
} from '@/Components/SearchableSelect';
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
    const organizationSelectOptions: SearchableSelectOption[] =
        organizations.map((organization) => ({
            label: organization.name,
            description: organization.type,
            state_token: String(organization.id),
        }));

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        username: string;
        email: string;
        password: string;
        password_confirmation: string;
        organization_id: string;
    }>({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        organization_id: hasMultipleOrganizations
            ? ''
            : String(organizations[0]?.id ?? ''),
    });
    const selectedOrganizationOption = data.organization_id
        ? organizationSelectOptions.find(
              (option) => option.state_token === data.organization_id,
          )
        : null;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-6">
                <h2 className="text-center text-3xl font-bold text-white drop-shadow-lg">
                    Daftar Akun Baru
                </h2>

                <div>
                    <Label htmlFor="name" required>
                        Nama Lengkap
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={data.name}
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        placeholder="Contoh: Ahmad Zulkarnain"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="username" required>
                        Username
                    </Label>
                    <Input
                        id="username"
                        name="username"
                        value={data.username}
                        autoComplete="username"
                        onChange={(e) => setData('username', e.target.value)}
                        error={errors.username}
                        placeholder="Contoh: ahmadzulkarnain"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="email" required>
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="email"
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        placeholder="nama@contoh.com"
                        required
                    />
                </div>

                {hasMultipleOrganizations && (
                    <div>
                        <Label required>Jenis User</Label>
                        <SearchableSelect
                            options={organizationSelectOptions}
                            selectedOption={
                                selectedOrganizationOption
                                    ? {
                                          label: selectedOrganizationOption.label,
                                          description:
                                              selectedOrganizationOption.description,
                                      }
                                    : null
                            }
                            placeholder="Cari atau pilih jenis user"
                            onSelect={(option) =>
                                setData('organization_id', option.state_token)
                            }
                            onClear={() => setData('organization_id', '')}
                        />
                        {errors.organization_id && (
                            <p className="mt-1 text-sm text-red-400">
                                {errors.organization_id}
                            </p>
                        )}
                    </div>
                )}

                <div>
                    <Label htmlFor="password" required>
                        Password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        placeholder="Minimal 8 karakter"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="password_confirmation" required>
                        Konfirmasi Password
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        error={errors.password_confirmation}
                        placeholder="Masukkan password yang sama"
                        required
                    />
                </div>

                <div className="space-y-4">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        {processing ? 'Memproses...' : 'Daftar Sekarang'}
                    </Button>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-sm text-white/80 transition hover:text-white hover:underline"
                        >
                            Sudah punya akun?{' '}
                            <span className="font-semibold">Masuk disini</span>
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
