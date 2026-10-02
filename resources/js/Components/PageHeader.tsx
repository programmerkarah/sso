import { PropsWithChildren, ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface PageHeaderProps extends PropsWithChildren {
    title?: string;
    description?: string;
    eyebrow?: string;
    actions?: ReactNode;
}

export default function PageHeader({
    title,
    description,
    eyebrow,
    actions,
}: PageHeaderProps) {
    const { ui } = usePage<PageProps>().props;
    const resolvedTitle = title ?? ui.page.title;
    const resolvedDescription = description ?? ui.page.description;

    return (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {eyebrow && (
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-400">
                        {eyebrow}
                    </p>
                )}
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {resolvedTitle}
                </h1>
                {resolvedDescription && (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                        {resolvedDescription}
                    </p>
                )}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
    );
}
