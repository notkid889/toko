/**
 * Shared formatting utilities for the Toko POS application.
 * Centralizes all number/currency/date formatting to ensure consistency.
 */

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('id-ID');

/**
 * Format a number as Indonesian Rupiah (Rp).
 * Example: 25000 → "Rp 25.000"
 */
export function formatPrice(value: number): string {
    return currencyFormatter.format(value);
}

/**
 * Format a number with Indonesian locale thousand separators.
 * Example: 10000 → "10.000"
 */
export function formatNumber(value: number): string {
    return numberFormatter.format(value);
}

/**
 * Format a date string to Indonesian locale display.
 * Defaults to "dd MMM yyyy" (e.g. "19 Apr 2026").
 */
export function formatDate(
    value: string | Date,
    options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    },
): string {
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString('id-ID', options);
}

/**
 * Format a date string to "dd MMM yyyy HH:mm".
 */
export function formatDateTime(value: string | Date): string {
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
