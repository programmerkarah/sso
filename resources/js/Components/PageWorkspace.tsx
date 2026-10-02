import { ReactNode } from 'react';

import { usePage } from '@inertiajs/react';

import ScrollArea from '@/Components/ScrollArea';
import { PageProps } from '@/types';

interface PageWorkspaceProps {
    summary: ReactNode;
    children: ReactNode;
    contentClassName?: string;
}

export default function PageWorkspace({
    summary,
    children,
    contentClassName = '',
}: PageWorkspaceProps) {
    const { ui } = usePage<PageProps>().props;
    const layout = ui.page.layout;

    if (layout.mode !== 'workspace' || !layout.content_scroll) {
        return (
            <div className="space-y-4 sm:space-y-6">
                {summary}
                <div className={contentClassName}>{children}</div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div
                className={
                    'shrink-0 pb-3 sm:pb-4 ' +
                    (layout.sticky_summary ? 'relative z-20' : '')
                }
            >
                <div className="space-y-3 sm:space-y-4">{summary}</div>
            </div>

            {layout.content_strategy === 'panes' ? (
                <div className={'min-h-0 flex-1 ' + contentClassName}>
                    {children}
                </div>
            ) : (
                <ScrollArea
                    className="min-h-0 flex-1"
                    viewportClassName="pb-4 pr-1 sm:pb-6"
                    contentClassName={contentClassName}
                >
                    {children}
                </ScrollArea>
            )}
        </div>
    );
}
