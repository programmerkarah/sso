import {
    HTMLAttributes,
    PointerEvent as ReactPointerEvent,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

type Axis = 'vertical' | 'horizontal' | 'both';

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    axis?: Axis;
    viewportClassName?: string;
    contentClassName?: string;
}

interface Metrics {
    vSize: number;
    vOffset: number;
    hSize: number;
    hOffset: number;
    showV: boolean;
    showH: boolean;
}

export default function ScrollArea({
    children,
    axis = 'vertical',
    className = '',
    viewportClassName = '',
    contentClassName = '',
    ...props
}: ScrollAreaProps) {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const [metrics, setMetrics] = useState<Metrics>({
        vSize: 0,
        vOffset: 0,
        hSize: 0,
        hOffset: 0,
        showV: false,
        showH: false,
    });

    const update = useCallback(() => {
        const el = viewportRef.current;
        if (!el) return;

        const showV = axis !== 'horizontal' && el.scrollHeight > el.clientHeight + 1;
        const showH = axis !== 'vertical' && el.scrollWidth > el.clientWidth + 1;

        const vSize = showV ? Math.max(36, (el.clientHeight / el.scrollHeight) * el.clientHeight) : 0;
        const hSize = showH ? Math.max(36, (el.clientWidth / el.scrollWidth) * el.clientWidth) : 0;
        const vTravel = Math.max(0, el.clientHeight - vSize);
        const hTravel = Math.max(0, el.clientWidth - hSize);
        const vOffset =
            showV && el.scrollHeight > el.clientHeight
                ? (el.scrollTop / (el.scrollHeight - el.clientHeight)) * vTravel
                : 0;
        const hOffset =
            showH && el.scrollWidth > el.clientWidth
                ? (el.scrollLeft / (el.scrollWidth - el.clientWidth)) * hTravel
                : 0;

        setMetrics({ vSize, vOffset, hSize, hOffset, showV, showH });
    }, [axis]);

    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;

        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        if (el.firstElementChild) observer.observe(el.firstElementChild);

        el.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);

        return () => {
            observer.disconnect();
            el.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [update]);

    const drag = (
        event: ReactPointerEvent<HTMLDivElement>,
        orientation: 'vertical' | 'horizontal',
    ) => {
        event.preventDefault();
        const el = viewportRef.current;
        if (!el) return;

        const startPointer = orientation === 'vertical' ? event.clientY : event.clientX;
        const startScroll = orientation === 'vertical' ? el.scrollTop : el.scrollLeft;
        const maxScroll =
            orientation === 'vertical'
                ? el.scrollHeight - el.clientHeight
                : el.scrollWidth - el.clientWidth;
        const trackLength = orientation === 'vertical' ? el.clientHeight : el.clientWidth;
        const thumbLength = orientation === 'vertical' ? metrics.vSize : metrics.hSize;
        const maxTravel = Math.max(1, trackLength - thumbLength);

        const move = (moveEvent: PointerEvent) => {
            const current = orientation === 'vertical' ? moveEvent.clientY : moveEvent.clientX;
            const delta = current - startPointer;
            const next = startScroll + (delta / maxTravel) * maxScroll;
            if (orientation === 'vertical') el.scrollTop = next;
            else el.scrollLeft = next;
        };

        const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
        };

        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
    };

    const overflowClass =
        axis === 'vertical'
            ? 'overflow-y-auto overflow-x-hidden'
            : axis === 'horizontal'
              ? 'overflow-x-auto overflow-y-hidden'
              : 'overflow-auto';

    return (
        <div className={`relative ${className}`} {...props}>
            <div
                ref={viewportRef}
                className={`react-scroll-area-viewport h-full w-full ${overflowClass} ${viewportClassName}`}
            >
                <div className={contentClassName}>{children}</div>
            </div>

            {metrics.showV && (
                <div className="pointer-events-none absolute bottom-1 right-1 top-1 z-30 w-2">
                    <div
                        onPointerDown={(event) => drag(event, 'vertical')}
                        className="pointer-events-auto absolute right-0 w-1.5 cursor-grab rounded-full bg-slate-500/65 transition hover:bg-slate-400/80 active:cursor-grabbing"
                        style={{ height: metrics.vSize, transform: `translateY(${metrics.vOffset}px)` }}
                    />
                </div>
            )}

            {metrics.showH && (
                <div className="pointer-events-none absolute bottom-1 left-1 right-1 z-30 h-2">
                    <div
                        onPointerDown={(event) => drag(event, 'horizontal')}
                        className="pointer-events-auto absolute bottom-0 h-1.5 cursor-grab rounded-full bg-slate-500/65 transition hover:bg-slate-400/80 active:cursor-grabbing"
                        style={{ width: metrics.hSize, transform: `translateX(${metrics.hOffset}px)` }}
                    />
                </div>
            )}
        </div>
    );
}
