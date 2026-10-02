import { ReactNode } from 'react';
import { X } from 'lucide-react';

import ScrollArea from '@/Components/ScrollArea';

interface ModalPanelProps {
    title: string;
    description?: ReactNode;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    maxWidthClassName?: string;
    bodyClassName?: string;
}

export default function ModalPanel({
    title,
    description,
    onClose,
    children,
    footer,
    maxWidthClassName = 'max-w-3xl',
    bodyClassName = '',
}: ModalPanelProps) {
    return (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-5">
            <button
                type="button"
                aria-label="Tutup modal"
                className="ui-modal-overlay absolute inset-0"
                onClick={onClose}
            />

            <div
                className={
                    'ui-modal-surface relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl ' +
                    maxWidthClassName
                }
            >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--bps-border)] px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-[var(--bps-text)]">
                            {title}
                        </h3>
                        {description && (
                            <div className="mt-1 text-sm leading-5 text-[var(--bps-muted)]">
                                {description}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ui-icon-button shrink-0 rounded-lg p-2"
                        aria-label="Tutup"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <ScrollArea
                    className="min-h-0 max-h-[calc(100dvh-10rem)]"
                    viewportClassName="px-5 py-4 sm:px-6"
                    contentClassName={bodyClassName}
                >
                    {children}
                </ScrollArea>

                {footer && (
                    <div className="shrink-0 border-t border-[var(--bps-border)] bg-[var(--bps-surface)] px-5 py-4 sm:px-6">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
