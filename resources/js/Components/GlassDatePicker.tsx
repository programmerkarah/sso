import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';

import {
    ButtonHTMLAttributes,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';

import GlassSelect from '@/Components/GlassSelect';
import Label from '@/Components/Label';
import ScrollArea from '@/Components/ScrollArea';

type GlassDatePickerType = 'date' | 'datetime-local' | 'time';
type GlassDatePickerValueFormat = 'native' | 'database-datetime';

interface GlassDatePickerProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'value' | 'onChange'
> {
    id?: string;
    label?: string;
    value: string;
    onChange: (value: string) => void;
    type?: GlassDatePickerType;
    error?: string;
    required?: boolean;
    valueFormat?: GlassDatePickerValueFormat;
    placeholder?: string;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad = (value: number) => value.toString().padStart(2, '0');

const parseInputValue = (
    value: string,
    type: GlassDatePickerType,
    valueFormat: GlassDatePickerValueFormat,
) => {
    if (!value) {
        return {
            date: '',
            time: '00:00:00',
        };
    }

    if (valueFormat === 'native') {
        if (type === 'date') {
            return { date: value, time: '00:00:00' };
        }

        if (type === 'time') {
            return {
                date: '',
                time: value.length >= 8 ? value : `${value}:00`.slice(0, 8),
            };
        }

        const [datePart = '', timePart = '00:00:00'] = value.split('T');

        return {
            date: datePart,
            time:
                timePart.length >= 8
                    ? timePart.slice(0, 8)
                    : `${timePart}:00`.slice(0, 8),
        };
    }

    const normalized = value.trim().replace('T', ' ');
    const [datePart = '', rawTimePart = '00:00:00'] = normalized.split(' ');
    const [timePart = '00:00:00'] = rawTimePart.split('.');

    return {
        date: type === 'time' ? '' : datePart,
        time:
            timePart.length >= 8
                ? timePart.slice(0, 8)
                : `${timePart}:00`.slice(0, 8),
    };
};

const normalizeOutputValue = (
    value: string,
    type: GlassDatePickerType,
    valueFormat: GlassDatePickerValueFormat,
) => {
    if (!value) {
        return '';
    }

    if (valueFormat === 'native') {
        return value;
    }

    if (type === 'date') {
        return value;
    }

    if (type === 'time') {
        return value;
    }

    return value.replace('T', ' ');
};

const buildValue = (
    date: string,
    time: string,
    type: GlassDatePickerType,
    valueFormat: GlassDatePickerValueFormat,
) => {
    if (type === 'date') {
        return normalizeOutputValue(date, type, valueFormat);
    }

    if (type === 'time') {
        return normalizeOutputValue(time, type, valueFormat);
    }

    if (!date) {
        return '';
    }

    return normalizeOutputValue(`${date}T${time}`, type, valueFormat);
};

const formatDisplayValue = (
    value: string,
    type: GlassDatePickerType,
    valueFormat: GlassDatePickerValueFormat,
) => {
    const parsed = parseInputValue(value, type, valueFormat);

    if (type === 'time') {
        return parsed.time || 'Pilih waktu';
    }

    if (!parsed.date) {
        return type === 'date' ? 'Pilih tanggal' : 'Pilih tanggal & waktu';
    }

    const date = new Date(`${parsed.date}T${parsed.time || '00:00:00'}`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    if (type === 'date') {
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }

    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
};

const getMonthLabel = (date: Date) =>
    date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

const createMonthMatrix = (monthDate: Date) => {
    const monthStart = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1,
    );
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());

    return Array.from({ length: 42 }, (_, index) => {
        const day = new Date(gridStart);
        day.setDate(gridStart.getDate() + index);

        return day;
    });
};

const isSameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

const HOURS = Array.from({ length: 24 }, (_, index) => ({
    label: pad(index),
    value: pad(index),
}));

const MINUTES_SECONDS = Array.from({ length: 60 }, (_, index) => ({
    label: pad(index),
    value: pad(index),
}));

const findScrollParent = (element: HTMLElement | null): HTMLElement | null => {
    if (!element) {
        return null;
    }

    let current = element.parentElement;

    while (current) {
        const styles = window.getComputedStyle(current);
        const overflowY = styles.overflowY;

        if (
            (overflowY === 'auto' || overflowY === 'scroll') &&
            current.scrollHeight > current.clientHeight
        ) {
            return current;
        }

        current = current.parentElement;
    }

    return null;
};

export default function GlassDatePicker({
    id,
    label,
    value,
    onChange,
    type = 'date',
    error,
    required = false,
    valueFormat = 'native',
    className = '',
    placeholder,
    disabled,
    ...props
}: GlassDatePickerProps) {
    const Icon = type === 'time' ? Clock3 : CalendarDays;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const scrollParentRef = useRef<HTMLElement | null>(null);
    const mainElementRef = useRef<HTMLElement | null>(null);
    const previousOverflowRef = useRef<string | null>(null);
    const previousMainOverflowRef = useRef<string | null>(null);
    const previousBodyOverflowRef = useRef<string | null>(null);
    const previousHtmlOverflowRef = useRef<string | null>(null);
    const parsedValue = parseInputValue(value, type, valueFormat);
    const initialDate = parsedValue.date
        ? new Date(`${parsedValue.date}T00:00:00`)
        : new Date();
    const [open, setOpen] = useState(false);
    const [popoverStyle, setPopoverStyle] = useState<{
        top: number;
        left: number;
        width: number;
        maxHeight: number;
    }>({
        top: 0,
        left: 0,
        width: 352,
        maxHeight: 512,
    });
    const [displayMonth, setDisplayMonth] = useState(
        new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
    );

    useEffect(() => {
        const nextDate = parsedValue.date
            ? new Date(`${parsedValue.date}T00:00:00`)
            : new Date();
        setDisplayMonth(
            new Date(nextDate.getFullYear(), nextDate.getMonth(), 1),
        );
    }, [parsedValue.date]);

    useLayoutEffect(() => {
        if (!open || !triggerRef.current) {
            return;
        }

        const updatePopoverPosition = () => {
            if (!triggerRef.current) {
                return;
            }

            const rect = triggerRef.current.getBoundingClientRect();
            const popoverWidth = Math.min(352, window.innerWidth - 16);
            const left = Math.min(
                Math.max(8, rect.left),
                Math.max(8, window.innerWidth - popoverWidth - 8),
            );
            const availableBelow = window.innerHeight - rect.bottom - 8;
            const availableAbove = rect.top - 8;
            const preferredHeight = type === 'datetime-local' ? 520 : 420;
            const shouldPlaceAbove =
                availableBelow < 320 && availableAbove > availableBelow;
            const maxHeight = Math.max(
                220,
                Math.min(
                    preferredHeight,
                    (shouldPlaceAbove ? availableAbove : availableBelow) - 8,
                ),
            );
            const top = shouldPlaceAbove
                ? Math.max(8, rect.top - maxHeight - 8)
                : Math.max(8, rect.bottom + 8);

            setPopoverStyle({
                top,
                left,
                width: popoverWidth,
                maxHeight,
            });
        };

        updatePopoverPosition();

        const handleViewportChange = () => updatePopoverPosition();

        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);

        return () => {
            window.removeEventListener('resize', handleViewportChange);
            window.removeEventListener('scroll', handleViewportChange, true);
        };
    }, [open]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                !containerRef.current?.contains(target) &&
                !popoverRef.current?.contains(target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    useEffect(() => {
        if (!open) {
            if (
                scrollParentRef.current &&
                previousOverflowRef.current !== null
            ) {
                scrollParentRef.current.style.overflowY =
                    previousOverflowRef.current;
            }

            if (
                mainElementRef.current &&
                previousMainOverflowRef.current !== null
            ) {
                mainElementRef.current.style.overflowY =
                    previousMainOverflowRef.current;
            }

            if (previousBodyOverflowRef.current !== null) {
                document.body.style.overflow = previousBodyOverflowRef.current;
            }

            if (previousHtmlOverflowRef.current !== null) {
                document.documentElement.style.overflow =
                    previousHtmlOverflowRef.current;
            }

            scrollParentRef.current = null;
            mainElementRef.current = null;
            previousOverflowRef.current = null;
            previousMainOverflowRef.current = null;
            previousBodyOverflowRef.current = null;
            previousHtmlOverflowRef.current = null;

            return;
        }

        const scrollParent = findScrollParent(containerRef.current);
        scrollParentRef.current = scrollParent;

        if (scrollParent) {
            previousOverflowRef.current = scrollParent.style.overflowY;
            scrollParent.style.overflowY = 'hidden';
        }

        const mainElement = containerRef.current?.closest(
            'main',
        ) as HTMLElement | null;
        mainElementRef.current = mainElement;

        if (mainElement) {
            previousMainOverflowRef.current = mainElement.style.overflowY;
            mainElement.style.overflowY = 'hidden';
        }

        previousBodyOverflowRef.current = document.body.style.overflow;
        previousHtmlOverflowRef.current =
            document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        return () => {
            if (
                scrollParentRef.current &&
                previousOverflowRef.current !== null
            ) {
                scrollParentRef.current.style.overflowY =
                    previousOverflowRef.current;
            }

            if (
                mainElementRef.current &&
                previousMainOverflowRef.current !== null
            ) {
                mainElementRef.current.style.overflowY =
                    previousMainOverflowRef.current;
            }

            if (previousBodyOverflowRef.current !== null) {
                document.body.style.overflow = previousBodyOverflowRef.current;
            }

            if (previousHtmlOverflowRef.current !== null) {
                document.documentElement.style.overflow =
                    previousHtmlOverflowRef.current;
            }
        };
    }, [open]);

    const selectedDate = parsedValue.date
        ? new Date(`${parsedValue.date}T00:00:00`)
        : null;
    const [selectedHour = '00', selectedMinute = '00', selectedSecond = '00'] =
        (parsedValue.time || '00:00:00').split(':');
    const calendarDays = useMemo(
        () => createMonthMatrix(displayMonth),
        [displayMonth],
    );

    const applyDate = (date: string) => {
        onChange(
            buildValue(date, parsedValue.time || '00:00:00', type, valueFormat),
        );
    };

    const applyTimePart = (
        part: 'hour' | 'minute' | 'second',
        partValue: string,
    ) => {
        const nextHour = part === 'hour' ? partValue : selectedHour;
        const nextMinute = part === 'minute' ? partValue : selectedMinute;
        const nextSecond = part === 'second' ? partValue : selectedSecond;

        onChange(
            buildValue(
                parsedValue.date,
                `${nextHour}:${nextMinute}:${nextSecond}`,
                type,
                valueFormat,
            ),
        );
    };

    const goToToday = () => {
        const now = new Date();
        const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        onChange(buildValue(date, time, type, valueFormat));
        setDisplayMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    };

    const clearValue = () => onChange('');

    const popoverContent = open ? (
        <ScrollArea
            rootRef={popoverRef}
            className="ui-modal-surface fixed z-[140] max-h-[min(32rem,calc(100dvh-1rem))] rounded-xl"
            viewportClassName="p-3"
            style={{
                top: popoverStyle.top,
                left: popoverStyle.left,
                width: popoverStyle.width,
                maxHeight: popoverStyle.maxHeight,
            }}
        >
            {type !== 'time' && (
                <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                setDisplayMonth(
                                    (current) =>
                                        new Date(
                                            current.getFullYear(),
                                            current.getMonth() - 1,
                                            1,
                                        ),
                                )
                            }
                            className="ui-icon-button rounded-lg p-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="text-sm font-semibold text-[var(--bps-text)]">
                            {getMonthLabel(displayMonth)}
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                setDisplayMonth(
                                    (current) =>
                                        new Date(
                                            current.getFullYear(),
                                            current.getMonth() + 1,
                                            1,
                                        ),
                                )
                            }
                            className="ui-icon-button rounded-lg p-2"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--bps-muted)]">
                        {WEEKDAY_LABELS.map((day) => (
                            <div key={day} className="py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="mt-1 grid grid-cols-7 gap-1">
                        {calendarDays.map((day) => {
                            const isCurrentMonth =
                                day.getMonth() === displayMonth.getMonth();
                            const isSelected = selectedDate
                                ? isSameDay(day, selectedDate)
                                : false;
                            const isToday = isSameDay(day, new Date());
                            const dayValue = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;

                            return (
                                <button
                                    key={day.toISOString()}
                                    type="button"
                                    onClick={() => applyDate(dayValue)}
                                    className={`aspect-square rounded-lg border border-transparent text-sm transition ${isSelected ? 'ui-selected font-bold' : isToday ? 'ui-success' : isCurrentMonth ? 'ui-hover text-[var(--bps-text)]' : 'ui-hover text-[var(--bps-muted)] opacity-70'}`}
                                >
                                    {day.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {type !== 'date' && (
                <div
                    className={
                        type !== 'time'
                            ? 'mt-4 border-t border-[var(--bps-border)] pt-4'
                            : ''
                    }
                >
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                        <Clock3 className="h-4 w-4 text-[var(--bps-muted)]" />
                        Waktu
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <GlassSelect
                            value={selectedHour}
                            options={HOURS}
                            onChange={(nextValue) =>
                                applyTimePart('hour', nextValue || '00')
                            }
                            placeholder="Jam"
                        />
                        <GlassSelect
                            value={selectedMinute}
                            options={MINUTES_SECONDS}
                            onChange={(nextValue) =>
                                applyTimePart('minute', nextValue || '00')
                            }
                            placeholder="Menit"
                        />
                        <GlassSelect
                            value={selectedSecond}
                            options={MINUTES_SECONDS}
                            onChange={(nextValue) =>
                                applyTimePart('second', nextValue || '00')
                            }
                            placeholder="Detik"
                        />
                    </div>
                </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--bps-border)] pt-3">
                <button
                    type="button"
                    onClick={clearValue}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--bps-muted)] transition hover:bg-slate-800 hover:text-white"
                >
                    Clear
                </button>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={goToToday}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-sky-200 transition hover:bg-slate-800 hover:text-white"
                    >
                        {type === 'time' ? 'Now' : 'Today'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="ui-selected rounded-lg border px-3 py-2 text-sm font-semibold"
                    >
                        Selesai
                    </button>
                </div>
            </div>
        </ScrollArea>
    ) : null;

    return (
        <div ref={containerRef} className="w-full">
            {label && (
                <Label htmlFor={id} required={required}>
                    {label}
                </Label>
            )}

            <div className="relative">
                <button
                    {...props}
                    id={id}
                    ref={triggerRef}
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpen((current) => !current)}
                    className={`ui-field flex w-full items-center justify-between rounded-xl py-3 pl-10 pr-4 text-left text-sm shadow-sm transition ${disabled ? 'ui-disabled' : ''} ${error ? 'border-red-400 focus:border-red-400' : ''} ${className}`}
                >
                    <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bps-muted)]" />
                    <span
                        className={
                            value ? 'text-white' : 'text-[var(--bps-muted)]'
                        }
                    >
                        {value
                            ? formatDisplayValue(value, type, valueFormat)
                            : (placeholder ??
                              (type === 'date'
                                  ? 'Pilih tanggal'
                                  : type === 'time'
                                    ? 'Pilih waktu'
                                    : 'Pilih tanggal & waktu'))}
                    </span>
                    <CalendarDays className="h-4 w-4 text-[var(--bps-muted)]" />
                </button>
            </div>

            {popoverContent && createPortal(popoverContent, document.body)}

            {error && <p className="mt-2 text-sm text-[#b85d52]">{error}</p>}
        </div>
    );
}
