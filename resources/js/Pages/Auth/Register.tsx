import { FormEventHandler, useState } from 'react';

import { Head, Link, useForm, usePage } from '@inertiajs/react';

import { Eye, EyeOff } from 'lucide-react';

import GoogleAuthButton from '@/Components/GoogleAuthButton';
import Input from '@/Components/Input';
import PasswordRequirements, {
    PasswordMatchHint,
    passwordMeetsRequirements,
} from '@/Components/PasswordRequirements';
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
    googleAuthEnabled?: boolean;
}

export default function Register() {
    const { organizations, googleAuthEnabled = false } =
        usePage<RegisterProps>().props;
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);
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

    const passwordValid = passwordMeetsRequirements(data.password, {
        name: data.name,
        username: data.username,
        email: data.email,
    });
    const confirmationValid =
        data.password_confirmation !== '' &&
        data.password_confirmation === data.password;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    const usernameValid =
        data.username.trim() !== '' && /^[a-zA-Z0-9_.]+$/.test(data.username);
    const formValid =
        data.name.trim() !== '' &&
        usernameValid &&
        emailValid &&
        passwordValid &&
        confirmationValid &&
        (!hasMultipleOrganizations || data.organization_id !== '');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!formValid || processing) return;

        post('/register');
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun" />

            <div className="mb-5 sm:mb-7">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl text-[#18324a]">
                    Daftar akun
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6f8495]">
                    Isi data berikut untuk membuat akun SSO.
                </p>
            </div>

            {googleAuthEnabled && (
                <div className="mb-5 space-y-3">
                    <GoogleAuthButton label="Daftar dengan Google" />
                    <div className="flex items-center gap-3 text-xs text-[#9aabb7]">
                        <span className="h-px flex-1 bg-[#dbe5ec]" />
                        <span>atau daftar dengan akun lokal</span>
                        <span className="h-px flex-1 bg-[#dbe5ec]" />
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4 sm:space-y-5">
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

                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
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

                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                    <div>
                        <Label
                            htmlFor="password"
                            required
                            className="text-[#29465f] drop-shadow-none"
                        >
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            error={errors.password}
                            placeholder="Minimal 8 karakter"
                            className="pr-11"
                            required
                        />
                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <PasswordRequirements
                            password={data.password}
                            name={data.name}
                            username={data.username}
                            email={data.email}
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
                        <div className="relative">
                            <Input
                            id="password_confirmation"
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            error={errors.password_confirmation}
                            placeholder="Ulangi password"
                            className="pr-11"
                            required
                        />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowPasswordConfirmation((value) => !value)
                                }
                                aria-label={
                                    showPasswordConfirmation
                                        ? 'Sembunyikan konfirmasi password'
                                        : 'Lihat konfirmasi password'
                                }
                                title={
                                    showPasswordConfirmation
                                        ? 'Sembunyikan konfirmasi password'
                                        : 'Lihat konfirmasi password'
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                {showPasswordConfirmation ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <PasswordMatchHint
                            password={data.password}
                            confirmation={data.password_confirmation}
                        />
                    </div>
                </div>

                <p className="text-xs leading-5 text-[#8799a7]">
                    Akun baru dapat memerlukan verifikasi administrator sebelum
                    digunakan untuk mengakses aplikasi.
                </p>

                <button
                    type="submit"
                    disabled={processing || !formValid}
                    className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
                >
                    {processing ? 'Menyimpan...' : 'Daftar'}
                </button>
            </form>

            <p className="mt-5 text-center text-sm sm:mt-6 text-[#8799a7]">
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
