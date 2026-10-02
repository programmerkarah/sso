import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    iconColor?: string;
}

export default function FeatureCard({
    icon: Icon,
    title,
    description,
    iconColor = 'text-sky-300',
}: FeatureCardProps) {
    return (
        <div className="h-full rounded-xl border border-slate-800 bg-slate-900 p-5">
            <Icon className={'h-5 w-5 ' + iconColor} />
            <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
                {description}
            </p>
        </div>
    );
}
