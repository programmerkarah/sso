import GoogleLogo from '@/Components/GoogleLogo';

interface GoogleAuthButtonProps {
    label: string;
    href?: string;
}

export default function GoogleAuthButton({
    label,
    href = '/auth/google',
}: GoogleAuthButtonProps) {
    return (
        <a
            href={href}
            className="ui-surface ui-hover inline-flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-semibold"
        >
            <GoogleLogo className="h-[18px] w-[18px] shrink-0" />
            {label}
        </a>
    );
}
