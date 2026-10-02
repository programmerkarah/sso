import { FormEventHandler } from 'react';

import { Head, Link, useForm, usePage } from '@inertiajs/react';

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
            state_token: String(organization.id),
        }));

    const { data, setData, post, processing, errors } = useForm({
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
            <Head title="Daftar Akun" />

            <div className="mb-7">
                <h2 className="text-2xl font-semibold tracking-tight text-[#18324a]">
                    Daftar akun
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6f8495]">
                    Isi data berikut untuk membuat akun SSO.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <Label
                        htmlFor="name"
                        required
                        className="text-[#29465f] drop-shadow-none"
                    >
                        Nama lengkap
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={data.name}
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        placeholder="Nama lengkap"
                        required
                    />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <Label
                            htmlFor="username"
                            required
                            className="text-[#29465f] drop-shadow-none"
                        >
                            Username
                        </Label>
                        <Input
                            id="username"
                            name="username"
                            value={data.username}
                            autoComplete="username"
                            onChange={(e) =>
                                setData('username', e.target.value)
                            }
                            error={errors.username}
                            placeholder="Username"
                            required
                        />
                    </div>

                    <div>
                        <Label
                            htmlFor="email"
                            required
                            className="text-[#29465f] drop-shadow-none"
                        >
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
                            placeholder="Email"
                            required
                        />
                    </div>
                </div>

                {hasMultipleOrganizations && (
                    <div>
                        <Label
                            required
                            className="text-[#29465f] drop-shadow-none"
                        >
                            Organisasi
                        </Label>
                        <SearchableSelect
                            options={organizationSelectOptions}
                            selectedOption={
                                selectedOrganizationOption
                                    ? {
                                          label: selectedOrganizationOption.label,
                                      }
                                    : null
                            }
                            placeholder="Pilih organisasi"
                            onSelect={(option) =>
                                setData('organization_id', option.state_token)
                            }
                            onClear={() => setData('organization_id', '')}
                        />
                        {errors.organization_id && (
                            <p className="mt-2 text-sm text-red-300">
                                {errors.organization_id}
                            </p>
                        )}
                    </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <Label
                            htmlFor="password"
                            required
                            className="text-[#29465f] drop-shadow-none"
                        >
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            error={errors.password}
                            placeholder="Minimal 8 karakter"
                            required
                        />
                    </div>

                    <div>
                        <Label
                            htmlFor="password_confirmation"
                            required
                            className="text-[#29465f] drop-shadow-none"
                        >
                            Konfirmasi password
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
                            placeholder="Ulangi password"
                            required
                        />
                    </div>
                </div>

                <p className="text-xs leading-5 text-[#8799a7]">
                    Akun baru dapat memerlukan verifikasi administrator sebelum
                    digunakan untuk mengakses aplikasi.
                </p>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-[#18324a] transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? 'Menyimpan...' : 'Daftar'}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#8799a7]">
                Sudah memiliki akun?{' '}
                <Link
                    href="/login"
                    className="font-medium text-[#4a9fd7] transition hover:text-[#347fae]"
                >
                    Masuk
                </Link>
            </p>
        </GuestLayout>
    );
}
