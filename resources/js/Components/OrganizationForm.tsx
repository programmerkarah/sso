import { Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Label from '@/Components/Label';

interface OrganizationFormData {
    name: string;
    type: string;
    description: string;
    is_active: boolean;
}

interface OrganizationFormProps {
    data: OrganizationFormData;
    setData: <K extends keyof OrganizationFormData>(
        key: K,
        value: OrganizationFormData[K],
    ) => void;
    errors: Partial<Record<keyof OrganizationFormData, string>>;
    processing: boolean;
    onSubmit: FormEventHandler<HTMLFormElement>;
    submitLabel: string;
    typeHelp: string;
    activeHelp?: string;
}

export default function OrganizationForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
    typeHelp,
    activeHelp,
}: OrganizationFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div>
                <Label htmlFor="name" required>
                    Nama Organisasi
                </Label>
                <Input
                    id="name"
                    name="name"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    error={errors.name}
                    placeholder="Contoh: Pemerintah Daerah"
                    required
                />
            </div>

            <div>
                <Label htmlFor="type" required>
                    Tipe organisasi
                </Label>
                <Input
                    id="type"
                    name="type"
                    value={data.type}
                    onChange={(event) => setData('type', event.target.value)}
                    error={errors.type}
                    placeholder="Contoh: opd"
                    required
                />
                <p className="mt-1.5 text-xs leading-5 text-[var(--bps-muted)]">
                    {typeHelp}
                </p>
            </div>

            <div>
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                    id="description"
                    name="description"
                    value={data.description}
                    onChange={(event) =>
                        setData('description', event.target.value)
                    }
                    rows={4}
                    className="ui-field w-full resize-y rounded-xl px-4 py-3 text-sm placeholder:text-[var(--bps-muted)]"
                    placeholder="Deskripsi singkat organisasi"
                />
                {errors.description && (
                    <p className="mt-1.5 text-sm text-[#b85d52]">
                        {errors.description}
                    </p>
                )}
            </div>

            <div className="ui-surface-soft rounded-xl border p-4">
                <label className="flex cursor-pointer items-start gap-3">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(event) =>
                            setData('is_active', event.target.checked)
                        }
                        className="mt-0.5 rounded border-[var(--bps-border)] text-[#4a9fd7] focus:ring-[#4a9fd7]/25"
                    />
                    <span>
                        <span className="block text-sm font-medium text-[var(--bps-text)]">
                            Organisasi aktif
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-[var(--bps-muted)]">
                            {activeHelp ??
                                'Organisasi aktif dapat digunakan sesuai aturan akses SSO.'}
                        </span>
                    </span>
                </label>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[var(--bps-border)] pt-5 sm:flex-row sm:justify-end">
                <Link href="/admin/organizations" className="sm:w-auto">
                    <Button type="button" variant="secondary" className="w-full">
                        Batal
                    </Button>
                </Link>
                <Button
                    type="submit"
                    disabled={processing}
                    className="sm:w-auto"
                >
                    {processing ? 'Menyimpan...' : submitLabel}
                </Button>
            </div>
        </form>
    );
}
