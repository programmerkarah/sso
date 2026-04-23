import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Columns3,
    Database,
    Expand,
    Search,
    SquarePen,
    Table2,
    X,
} from 'lucide-react';

import { FormEvent, useEffect, useState } from 'react';

import { Head, Link, router } from '@inertiajs/react';

import Button from '@/Components/Button';
import GlassCard from '@/Components/GlassCard';
import GlassDatePicker from '@/Components/GlassDatePicker';
import SearchableSelect, {
    SearchableSelectOption,
} from '@/Components/SearchableSelect';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';

interface DatabaseTableSummary {
    name: string;
    engine: string | null;
    row_count: number;
    column_count: number;
    size_kb: number;
    token: string;
}

interface DatabaseTableColumn {
    name: string;
    type: string;
    nullable: boolean;
    key: string;
    default: unknown;
    extra: string;
    enum_values: string[];
    foreign_key: {
        table: string;
        column: string;
        label_column: string | null;
        options: Array<{
            value: string | number;
            label: string;
        }>;
    } | null;
}

interface DatabaseTableRows {
    data: Array<DatabaseTableRow>;
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
    prev_page_token: string | null;
    next_page_token: string | null;
}

interface DatabaseTableRow extends Record<string, unknown> {
    __row_token: string | null;
}

type EditableRowValues = Record<string, string | number | boolean | null>;

interface AdminDatabaseTablesPageProps extends PageProps {
    database: {
        connection: string;
        database: string;
        table_count: number;
        size_mb: number;
        user_count: number;
        application_count: number;
        backup_disk: string;
    };
    filters: {
        search: string;
        table: string | null;
        current_token: string;
    };
    tables: DatabaseTableSummary[];
    selected_table: {
        name: string;
        primary_key: string | null;
        columns: DatabaseTableColumn[];
        rows: DatabaseTableRows;
    } | null;
}

const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) {
        return '—';
    }

    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
};

const shouldCollapseCell = (value: string): boolean => {
    if (value.length > 120) {
        return true;
    }

    return value.includes('\n') && value.length > 60;
};

const getColumnEditorOptions = (column: DatabaseTableColumn) => {
    if (column.foreign_key?.options?.length) {
        return column.foreign_key.options.map((option) => ({
            value: String(option.value),
            label: option.label,
        }));
    }

    if (column.enum_values.length > 0) {
        return column.enum_values.map((value) => ({
            value,
            label: value,
        }));
    }

    return [];
};

const isTimestampColumn = (column: DatabaseTableColumn) => {
    const normalizedType = column.type.toLowerCase();

    return (
        normalizedType.includes('timestamp') ||
        normalizedType.includes('datetime')
    );
};

const isEditableTimestampColumn = (column: DatabaseTableColumn) => {
    if (!isTimestampColumn(column)) {
        return false;
    }

    return column.name === 'created_at' || column.name === 'updated_at';
};

export default function DatabaseTables({
    database,
    filters,
    tables,
    selected_table: selectedTable,
}: AdminDatabaseTablesPageProps) {
    const [search, setSearch] = useState(filters.search);
    const [activeTab, setActiveTab] = useState<'columns' | 'data'>('columns');
    const [expandedCell, setExpandedCell] = useState<{
        column: string;
        value: string;
    } | null>(null);
    const [editingRow, setEditingRow] = useState<DatabaseTableRow | null>(null);
    const [editRowToken, setEditRowToken] = useState('');
    const [editRowValues, setEditRowValues] = useState<EditableRowValues>({});
    const [isSavingRow, setIsSavingRow] = useState(false);

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    useEffect(() => {
        setActiveTab('columns');
    }, [selectedTable?.name]);

    useEffect(() => {
        setExpandedCell(null);
    }, [selectedTable?.name, activeTab]);

    useEffect(() => {
        const isOverlayOpen = Boolean(editingRow || expandedCell);

        if (!isOverlayOpen) {
            return;
        }

        const mainElement = document.querySelector(
            'main',
        ) as HTMLElement | null;
        const previousMainOverflow = mainElement?.style.overflowY ?? null;
        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        if (mainElement) {
            mainElement.style.overflowY = 'hidden';
        }

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        return () => {
            if (mainElement && previousMainOverflow !== null) {
                mainElement.style.overflowY = previousMainOverflow;
            }

            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [editingRow, expandedCell]);

    const visitByToken = (token: string) => {
        router.get(
            '/admin/system/database-tables',
            { state: token },
            { preserveScroll: true, preserveState: true },
        );
    };

    const navigateWithPayload = (
        table: string | null,
        page = 1,
        nextSearch = search,
    ) => {
        router.post(
            '/admin/system/database-tables/navigate',
            {
                search: nextSearch.trim(),
                table,
                page,
            },
            { preserveScroll: true },
        );
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        navigateWithPayload(selectedTable?.name ?? filters.table, 1, search);
    };

    const openEditRowModal = (row: DatabaseTableRow) => {
        if (!row.__row_token || !selectedTable) {
            return;
        }

        const values = selectedTable.columns.reduce<EditableRowValues>(
            (carry, column) => {
                if (column.name === selectedTable.primary_key) {
                    return carry;
                }

                const currentValue = row[column.name];

                carry[column.name] =
                    typeof currentValue === 'string' ||
                    typeof currentValue === 'number' ||
                    typeof currentValue === 'boolean' ||
                    currentValue === null
                        ? currentValue
                        : currentValue === undefined
                          ? ''
                          : JSON.stringify(currentValue, null, 2);

                return carry;
            },
            {},
        );

        setEditingRow(row);
        setEditRowToken(row.__row_token);
        setEditRowValues(values);
    };

    const closeEditRowModal = () => {
        setEditingRow(null);
        setEditRowToken('');
        setEditRowValues({});
        setIsSavingRow(false);
    };

    const handleEditRowSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedTable) {
            return;
        }

        setIsSavingRow(true);

        router.put(
            '/admin/system/database-tables/rows',
            {
                row_token: editRowToken,
                values: selectedTable.columns.reduce<EditableRowValues>(
                    (carry, column) => {
                        if (column.name === selectedTable.primary_key) {
                            return carry;
                        }

                        const rawValue = editRowValues[column.name];
                        carry[column.name] =
                            column.nullable && rawValue === ''
                                ? null
                                : rawValue;

                        return carry;
                    },
                    {},
                ),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeEditRowModal();
                },
                onFinish: () => {
                    setIsSavingRow(false);
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Tabel Database" />

            <div className="mx-auto max-w-9xl space-y-8 overflow-x-hidden px-1 sm:px-0">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <Link
                            href="/admin/system"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Sistem
                        </Link>
                        <h1 className="mt-3 bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-3xl font-black text-transparent drop-shadow-xl sm:text-5xl">
                            Browser Tabel Database
                        </h1>
                        <p className="mt-2 max-w-3xl text-white/80">
                            Lihat daftar tabel, struktur kolom, preview isi
                            data, dan edit row langsung dari panel admin.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-400/20 p-3">
                                <Table2 className="h-5 w-5 text-blue-100" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">
                                    Total tabel
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {tables.length}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-emerald-400/20 p-3">
                                <Columns3 className="h-5 w-5 text-emerald-100" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">
                                    Tabel aktif
                                </div>
                                <div className="max-w-[220px] truncate text-lg font-bold text-white sm:text-2xl">
                                    {selectedTable?.name ?? '—'}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-amber-400/20 p-3">
                                <Database className="h-5 w-5 text-amber-100" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">
                                    Koneksi database
                                </div>
                                <div className="text-lg font-bold text-white sm:text-2xl">
                                    {database.connection}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <GlassCard>
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-white">
                                Daftar Tabel
                            </h2>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">
                                {tables.length} tabel
                            </span>
                        </div>

                        <form onSubmit={handleSearchSubmit} className="mt-4">
                            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 py-2">
                                <Search className="h-4 w-4 text-white/50" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari nama tabel..."
                                    className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
                                />
                            </div>
                        </form>

                        <div className="mt-4 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
                            {tables.length === 0 ? (
                                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                                    Tidak ada tabel yang cocok dengan pencarian.
                                </div>
                            ) : (
                                tables.map((table) => {
                                    const isActive =
                                        selectedTable?.name === table.name;

                                    return (
                                        <button
                                            key={table.name}
                                            type="button"
                                            onClick={() =>
                                                visitByToken(table.token)
                                            }
                                            className={`w-full rounded-xl border p-3 text-left transition ${
                                                isActive
                                                    ? 'border-cyan-300/40 bg-cyan-500/15'
                                                    : 'border-white/10 bg-black/20 hover:bg-white/10'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="truncate font-semibold text-white">
                                                        {table.name}
                                                    </div>
                                                    <div className="mt-1 text-xs text-white/55">
                                                        {table.column_count}{' '}
                                                        kolom
                                                        {' • '}
                                                        {table.row_count} baris
                                                    </div>
                                                </div>
                                                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/65">
                                                    {table.engine || 'db'}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </GlassCard>

                    <div className="min-w-0 space-y-6">
                        {selectedTable ? (
                            <>
                                <GlassCard>
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <h2 className="text-2xl font-bold text-white">
                                                {selectedTable.name}
                                            </h2>
                                            <p className="mt-1 text-sm text-white/65">
                                                Preview read-only isi tabel dan
                                                struktur kolom.
                                            </p>
                                        </div>
                                        <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                                            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                                                <div className="text-xs uppercase tracking-wide text-white/50">
                                                    Kolom
                                                </div>
                                                <div className="mt-1 text-xl font-bold text-white">
                                                    {
                                                        selectedTable.columns
                                                            .length
                                                    }
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                                                <div className="text-xs uppercase tracking-wide text-white/50">
                                                    Preview
                                                </div>
                                                <div className="mt-1 text-xl font-bold text-white">
                                                    {selectedTable.rows.total}
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                                                <div className="text-xs uppercase tracking-wide text-white/50">
                                                    Database
                                                </div>
                                                <div className="mt-1 truncate text-sm font-bold text-white">
                                                    {database.database}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>

                                <GlassCard className="overflow-hidden p-0">
                                    <div className="border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold text-white">
                                                    Detail Tabel
                                                </h3>
                                                <p className="mt-1 text-sm text-white/65">
                                                    Pindah tab untuk melihat
                                                    struktur kolom atau preview
                                                    data tabel.
                                                </p>
                                            </div>
                                            <div className="flex w-full flex-col rounded-xl border border-white/10 bg-black/20 p-1 sm:inline-flex sm:w-auto sm:flex-row">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveTab('columns')
                                                    }
                                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                                        activeTab === 'columns'
                                                            ? 'bg-white/15 text-white'
                                                            : 'text-white/60 hover:text-white'
                                                    }`}
                                                >
                                                    Struktur Kolom
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveTab('data')
                                                    }
                                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                                        activeTab === 'data'
                                                            ? 'bg-white/15 text-white'
                                                            : 'text-white/60 hover:text-white'
                                                    }`}
                                                >
                                                    Preview Data
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {activeTab === 'columns' ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm text-white/80">
                                                <thead className="bg-black/20 text-left text-xs uppercase tracking-wider text-white/55">
                                                    <tr>
                                                        <th className="px-5 py-3">
                                                            Nama
                                                        </th>
                                                        <th className="px-5 py-3">
                                                            Tipe
                                                        </th>
                                                        <th className="px-5 py-3">
                                                            Null
                                                        </th>
                                                        <th className="px-5 py-3">
                                                            Key
                                                        </th>
                                                        <th className="px-5 py-3">
                                                            Default
                                                        </th>
                                                        <th className="px-5 py-3">
                                                            Extra
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/8">
                                                    {selectedTable.columns.map(
                                                        (column) => (
                                                            <tr
                                                                key={
                                                                    column.name
                                                                }
                                                            >
                                                                <td className="px-5 py-4 font-semibold text-white">
                                                                    {
                                                                        column.name
                                                                    }
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    {
                                                                        column.type
                                                                    }
                                                                    {column
                                                                        .enum_values
                                                                        .length >
                                                                        0 && (
                                                                        <div className="mt-1 text-[11px] text-white/45">
                                                                            {column.enum_values.join(
                                                                                ', ',
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {column.foreign_key && (
                                                                        <div className="mt-1 text-[11px] text-white/45">
                                                                            FK:{' '}
                                                                            {
                                                                                column
                                                                                    .foreign_key
                                                                                    .table
                                                                            }
                                                                            .
                                                                            {
                                                                                column
                                                                                    .foreign_key
                                                                                    .column
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    {column.nullable
                                                                        ? 'YES'
                                                                        : 'NO'}
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    {column.key ||
                                                                        '—'}
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    {formatCellValue(
                                                                        column.default,
                                                                    )}
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    {column.extra ||
                                                                        '—'}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="border-b border-white/10 px-4 py-3 sm:px-6">
                                                <p className="text-sm text-white/65">
                                                    Menampilkan{' '}
                                                    {selectedTable.rows.from ??
                                                        0}{' '}
                                                    sampai{' '}
                                                    {selectedTable.rows.to ??
                                                        0}{' '}
                                                </p>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[1080px] table-fixed text-sm text-white/80">
                                                    <thead className="bg-black/20 text-left text-xs uppercase tracking-wider text-white/55">
                                                        <tr>
                                                            {selectedTable.columns.map(
                                                                (column) => (
                                                                    <th
                                                                        key={`head-${column.name}`}
                                                                        className="px-4 py-3"
                                                                    >
                                                                        <div className="truncate">
                                                                            {
                                                                                column.name
                                                                            }
                                                                        </div>
                                                                    </th>
                                                                ),
                                                            )}
                                                            <th className="w-[110px] px-4 py-3 text-right">
                                                                Aksi
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/8">
                                                        {selectedTable.rows.data
                                                            .length === 0 ? (
                                                            <tr>
                                                                <td
                                                                    colSpan={
                                                                        (selectedTable
                                                                            .columns
                                                                            .length ||
                                                                            1) +
                                                                        1
                                                                    }
                                                                    className="px-5 py-10 text-center text-white/55"
                                                                >
                                                                    Tabel tidak
                                                                    memiliki
                                                                    data.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            selectedTable.rows.data.map(
                                                                (
                                                                    row,
                                                                    rowIndex,
                                                                ) => (
                                                                    <tr
                                                                        key={`row-${rowIndex}`}
                                                                        className="align-top"
                                                                    >
                                                                        {selectedTable.columns.map(
                                                                            (
                                                                                column,
                                                                            ) => (
                                                                                <td
                                                                                    key={`cell-${rowIndex}-${column.name}`}
                                                                                    className="px-4 py-4 align-top"
                                                                                >
                                                                                    {(() => {
                                                                                        const cellValue =
                                                                                            formatCellValue(
                                                                                                row[
                                                                                                    column
                                                                                                        .name
                                                                                                ],
                                                                                            );
                                                                                        const isCollapsed =
                                                                                            shouldCollapseCell(
                                                                                                cellValue,
                                                                                            );

                                                                                        if (
                                                                                            !isCollapsed
                                                                                        ) {
                                                                                            return (
                                                                                                <div className="max-w-[160px] whitespace-pre-wrap break-all text-xs text-white/85">
                                                                                                    {
                                                                                                        cellValue
                                                                                                    }
                                                                                                </div>
                                                                                            );
                                                                                        }

                                                                                        return (
                                                                                            <div className="max-w-[180px] space-y-2">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onDoubleClick={() =>
                                                                                                        setExpandedCell(
                                                                                                            {
                                                                                                                column: column.name,
                                                                                                                value: cellValue,
                                                                                                            },
                                                                                                        )
                                                                                                    }
                                                                                                    onClick={() =>
                                                                                                        setExpandedCell(
                                                                                                            {
                                                                                                                column: column.name,
                                                                                                                value: cellValue,
                                                                                                            },
                                                                                                        )
                                                                                                    }
                                                                                                    className="block w-full rounded-lg border border-white/10 bg-black/20 p-2 text-left transition hover:bg-white/10"
                                                                                                >
                                                                                                    <div className="max-h-24 overflow-hidden whitespace-pre-wrap break-all text-xs leading-5 text-white/85">
                                                                                                        {
                                                                                                            cellValue
                                                                                                        }
                                                                                                    </div>
                                                                                                </button>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() =>
                                                                                                        setExpandedCell(
                                                                                                            {
                                                                                                                column: column.name,
                                                                                                                value: cellValue,
                                                                                                            },
                                                                                                        )
                                                                                                    }
                                                                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-100 transition hover:text-white"
                                                                                                >
                                                                                                    <Expand className="h-3.5 w-3.5" />
                                                                                                    Expand
                                                                                                </button>
                                                                                            </div>
                                                                                        );
                                                                                    })()}
                                                                                </td>
                                                                            ),
                                                                        )}
                                                                        <td className="px-4 py-4 text-right align-top">
                                                                            {selectedTable.primary_key &&
                                                                            row.__row_token ? (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        openEditRowModal(
                                                                                            row,
                                                                                        )
                                                                                    }
                                                                                    className="inline-flex items-center gap-1 rounded-lg border border-amber-300/25 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-50 transition hover:bg-amber-500/25"
                                                                                >
                                                                                    <SquarePen className="h-3.5 w-3.5" />
                                                                                    Edit
                                                                                </button>
                                                                            ) : (
                                                                                <span className="text-xs text-white/35">
                                                                                    —
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {selectedTable.rows.last_page >
                                                1 && (
                                                <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <p className="text-sm text-white/60">
                                                        Halaman{' '}
                                                        {
                                                            selectedTable.rows
                                                                .current_page
                                                        }{' '}
                                                        dari{' '}
                                                        {
                                                            selectedTable.rows
                                                                .last_page
                                                        }
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            disabled={
                                                                !selectedTable
                                                                    .rows
                                                                    .prev_page_token
                                                            }
                                                            className="px-4 py-2"
                                                            onClick={() =>
                                                                selectedTable
                                                                    .rows
                                                                    .prev_page_token &&
                                                                visitByToken(
                                                                    selectedTable
                                                                        .rows
                                                                        .prev_page_token,
                                                                )
                                                            }
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                            Sebelumnya
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            disabled={
                                                                !selectedTable
                                                                    .rows
                                                                    .next_page_token
                                                            }
                                                            className="px-4 py-2"
                                                            onClick={() =>
                                                                selectedTable
                                                                    .rows
                                                                    .next_page_token &&
                                                                visitByToken(
                                                                    selectedTable
                                                                        .rows
                                                                        .next_page_token,
                                                                )
                                                            }
                                                        >
                                                            Berikutnya
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </GlassCard>
                            </>
                        ) : (
                            <GlassCard>
                                <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-center text-white/65">
                                    Tidak ada tabel yang bisa ditampilkan.
                                </div>
                            </GlassCard>
                        )}
                    </div>
                </div>

                {expandedCell && (
                    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
                            onClick={() => setExpandedCell(null)}
                        />
                        <div className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        Full Text
                                    </h3>
                                    <p className="mt-1 text-sm text-white/60">
                                        kolom: {expandedCell.column}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setExpandedCell(null)}
                                    className="rounded-lg border border-white/20 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <pre className="max-w-full whitespace-pre-wrap break-all rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/85">
                                {expandedCell.value}
                            </pre>
                        </div>
                    </div>
                )}

                {editingRow && selectedTable && (
                    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
                            onClick={closeEditRowModal}
                        />
                        <div className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        Edit Data Baris
                                    </h3>
                                    <p className="mt-1 text-sm text-white/60">
                                        Tabel: {selectedTable.name}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeEditRowModal}
                                    className="rounded-lg border border-white/20 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleEditRowSubmit}
                                className="space-y-4"
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {selectedTable.columns
                                        .filter(
                                            (column) =>
                                                column.name !==
                                                selectedTable.primary_key,
                                        )
                                        .map((column) => {
                                            const fieldValue =
                                                editRowValues[column.name];
                                            const stringValue =
                                                fieldValue === null ||
                                                fieldValue === undefined
                                                    ? ''
                                                    : String(fieldValue);
                                            const selectOptions =
                                                getColumnEditorOptions(column);
                                            const hasSelectOptions =
                                                selectOptions.length > 0;
                                            const selectedSelectOption =
                                                hasSelectOptions
                                                    ? selectOptions.find(
                                                          (option) =>
                                                              option.value ===
                                                              stringValue,
                                                      )
                                                    : null;
                                            const searchableOptions: SearchableSelectOption[] =
                                                selectOptions.map((option) => ({
                                                    label: option.label,
                                                    description: String(
                                                        option.value,
                                                    ),
                                                    state_token: option.value,
                                                }));
                                            const useTimestampField =
                                                isTimestampColumn(column);
                                            const isEditableTimestamp =
                                                isEditableTimestampColumn(
                                                    column,
                                                );
                                            const useTextarea =
                                                stringValue.length > 80 ||
                                                column.type.includes('text') ||
                                                column.type.includes('json');

                                            return (
                                                <div
                                                    key={column.name}
                                                    className={
                                                        useTextarea
                                                            ? 'sm:col-span-2'
                                                            : ''
                                                    }
                                                >
                                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60">
                                                        {column.name}
                                                    </label>
                                                    {hasSelectOptions ? (
                                                        <SearchableSelect
                                                            options={
                                                                searchableOptions
                                                            }
                                                            selectedOption={
                                                                selectedSelectOption
                                                                    ? {
                                                                          label: selectedSelectOption.label,
                                                                          description:
                                                                              String(
                                                                                  selectedSelectOption.value,
                                                                              ),
                                                                      }
                                                                    : null
                                                            }
                                                            placeholder={`Pilih ${column.name}`}
                                                            onSelect={(
                                                                option,
                                                            ) =>
                                                                setEditRowValues(
                                                                    {
                                                                        ...editRowValues,
                                                                        [column.name]:
                                                                            option.state_token,
                                                                    },
                                                                )
                                                            }
                                                            onClear={
                                                                column.nullable
                                                                    ? () =>
                                                                          setEditRowValues(
                                                                              {
                                                                                  ...editRowValues,
                                                                                  [column.name]:
                                                                                      '',
                                                                              },
                                                                          )
                                                                    : undefined
                                                            }
                                                        />
                                                    ) : useTimestampField ? (
                                                        <GlassDatePicker
                                                            value={stringValue}
                                                            type="datetime-local"
                                                            valueFormat="database-datetime"
                                                            disabled={
                                                                !isEditableTimestamp
                                                            }
                                                            onChange={(
                                                                nextValue,
                                                            ) =>
                                                                setEditRowValues(
                                                                    {
                                                                        ...editRowValues,
                                                                        [column.name]:
                                                                            nextValue,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    ) : useTextarea ? (
                                                        <textarea
                                                            rows={4}
                                                            value={stringValue}
                                                            onChange={(event) =>
                                                                setEditRowValues(
                                                                    {
                                                                        ...editRowValues,
                                                                        [column.name]:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-300/50 focus:outline-none"
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={stringValue}
                                                            onChange={(event) =>
                                                                setEditRowValues(
                                                                    {
                                                                        ...editRowValues,
                                                                        [column.name]:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-300/50 focus:outline-none"
                                                        />
                                                    )}
                                                    <p className="mt-1 text-[11px] text-white/40">
                                                        {column.type}
                                                        {column.nullable
                                                            ? ' • nullable'
                                                            : ''}
                                                        {column.foreign_key
                                                            ? ` • referensi ${column.foreign_key.table}.${column.foreign_key.column}`
                                                            : ''}
                                                        {useTimestampField
                                                            ? ` ${!isEditableTimestamp ? ' • read-only' : ''}`
                                                            : ''}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                </div>

                                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={closeEditRowModal}
                                        className="sm:w-auto"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSavingRow}
                                        className="sm:w-auto"
                                    >
                                        {isSavingRow
                                            ? 'Menyimpan...'
                                            : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
