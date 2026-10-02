interface AppIconProps {
    className?: string;
    alt?: string;
}

export default function AppIcon({
    className = 'h-12 w-12',
    alt = 'SSO BPS Kota Sawahlunto',
}: AppIconProps) {
    return (
        <img
            src="/favicon.svg"
            alt={alt}
            className={`${className} object-contain`}
            draggable={false}
        />
    );
}
