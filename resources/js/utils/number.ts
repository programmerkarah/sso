export function formatNumber(
    value: number | string | null | undefined,
    options: Intl.NumberFormatOptions = {},
): string {
    if (value === null || value === undefined || value === '') {
        return '0';
    }

    const numericValue =
        typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));

    if (!Number.isFinite(numericValue)) {
        return String(value);
    }

    return new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 20,
        ...options,
    }).format(numericValue);
}
