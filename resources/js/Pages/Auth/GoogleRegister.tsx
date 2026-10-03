import { Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Head, useForm } from '@inertiajs/react';

import Input from '@/Components/Input';
import Label from '@/Components/Label';
import PasswordRequirements, {
    PasswordMatchHint,
    passwordMeetsRequirements,
} from '@/Components/PasswordRequirements';
import SearchableSelect, {
    SearchableSelectOption,
} from '@/Components/SearchableSelect';
import GuestLayout from '@/Layouts/GuestLayout';

interface Organization {
    id: number;
    name: string;
    type: string;
}

interface GoogleRegisterProps {
    google: {
        name: string;
        email: string;
    };
    organizations: Organization[];
}

export default function GoogleRegister({
    google,
    organizations,
}: GoogleRegisterProps) {
    const hasMultipleOrganizations = organizations.length > 1;
    const options: SearchableSelectOption[] = organizations.map((organization) => ({
        label: organization.name,
        state_token: String(organization.id),
    }));

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: google.name,
        username: '',
        organization_id: hasMultipleOrganizations
            ? ''
            : String(organizations[0]?.id ?? ''),
        password: '',
        password_confirmation: '',
    });

    const selectedOrganization = options.find(
        (option) => option.state_token === data.organization_id,
    );

    const passwordValid = passwordMeetsRequirements(data.password, {
        name: data.name,
        username: data.username,
        email: google.email,
    });
    const confirmationValid =
        data.password_confirmation !== '' &&
        data.password_confirmation === data.password;
    const usernameValid =
        data.username.trim() !== '' && /^[a-zA-Z0-9_.]+$/.test(data.username);
    const formValid =
        data.name.trim() !== '' &&
        usernameValid &&
        passwordValid &&
        confirmationValid &&
        (!hasMultipleOrganizations || data.organization_id !== '');

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (!formValid || processing) return;

        post('/auth/google/register');
    };

    return (
        <GuestLayout>
            <Head title="Lengkapi Profil SSO" />

            <div className="space-y-5">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-[var(--bps-text)] sm:text-2xl">
                        Lengkapi profil SSO
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--bps-muted)]">
                        Identitas Google sudah diverifikasi. Lengkapi data yang
                        tetap dibutuhkan oleh SSO.
                    </p>
                </div>

                <div className="ui-surface-soft rounded-xl border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--bps-muted)]">
                        Email Google
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-[var(--bps-text)]">
                        {google.email}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="name" required>
                            Nama
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            error={errors.name}
                            placeholder="Nama lengkap"
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="username" required>
                            Username
                        </Label>
                        <Input
                            id="username"
                            value={data.username}
                            onChange={(event) =>
                                setData('username', event.target.value)
                            }
                            error={errors.username}
                            placeholder="Username untuk login lokal"
                            autoComplete="username"
                            required
                        />
                    </div>

                    {hasMultipleOrganizations && (
                        <div>
                            <Label required>Organisasi</Label>
                            <SearchableSelect
                                options={options}
                                selectedOption={
                                    selectedOrganization
                                        ? { label: selectedOrganization.label }
                                        : null
                                }
                                placeholder="Pilih organisasi"
                                onSelect={(option) =>
                                    setData('organization_id', option.state_token)
                                }
                                onClear={() => setData('organization_id', '')}
                            />
                            {errors.organization_id && (
                                <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                                    {errors.organization_id}
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="password" required>
                            Password lokal
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(event) =>
                                    setData('password', event.target.value)
                                }
                                error={errors.password}
                                autoComplete="new-password"
                                placeholder="Buat password untuk login lokal"
                                className="pr-11"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--bps-muted)] transition hover:text-[var(--bps-text)]"
                                aria-label={
                                    showPassword
                                        ? 'Sembunyikan password'
                                        : 'Lihat password'
                                }
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
                            email={google.email}
                        />
                    </div>

                    <div>
                        <Label htmlFor="password_confirmation" required>
                            Konfirmasi password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showConfirmation ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(event) =>
                                    setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                                error={errors.password_confirmation}
                                autoComplete="new-password"
                                placeholder="Ulangi password lokal"
                                className="pr-11"
                                required
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmation((value) => !value)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--bps-muted)] transition hover:text-[var(--bps-text)]"
                                aria-label={
                                    showConfirmation
                                        ? 'Sembunyikan konfirmasi password'
                                        : 'Lihat konfirmasi password'
                                }
                            >
                                {showConfirmation ? (
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

                    <p className="text-xs leading-5 text-[var(--bps-muted)]">
                        Setelah pendaftaran, akun tetap mengikuti verifikasi
                        email, verifikasi administrator, dan aktivasi 2FA seperti
                        akun SSO lainnya.
                    </p>

                    <button
                        type="submit"
                        disabled={processing || !formValid}
                        className="w-full rounded-lg bg-[var(--bps-blue-strong)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-[var(--bps-disabled-bg)] disabled:text-[var(--bps-disabled-text)]"
                    >
                        {processing ? 'Membuat akun...' : 'Buat akun SSO'}
                    </button>
                </form>
            </div>
        </GuestLayout>
    );
}
