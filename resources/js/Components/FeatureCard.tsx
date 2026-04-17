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
    iconColor = 'text-blue-400',
}: FeatureCardProps) {
    return (
        <div className="group relative h-full">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 blur transition duration-500 group-hover:opacity-20"></div>
            <div className="relative flex h-full flex-col items-center space-y-4 rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-white/20">
                <div className="rounded-full bg-gradient-to-br from-white/20 to-white/5 p-4 backdrop-blur-sm">
                    <Icon className={`h-8 w-8 ${iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-center text-sm text-white/80">
                    {description}
                </p>
            </div>
        </div>
    );
}
