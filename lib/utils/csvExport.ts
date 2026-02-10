/**
 * CSV Export Utility using PapaParse
 * Provides robust functions to export data to CSV format
 */
import Papa from 'papaparse';

export interface CSVColumn<T = any> {
    header: string;
    accessor: string | ((row: T) => string | number | boolean | null | undefined);
    formatter?: (value: any) => string;
}

export interface CSVExportOptions {
    filename?: string;
    includeTimestamp?: boolean;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Convert data array to CSV string using PapaParse
 */
export function convertToCSV<T>(
    data: T[],
    columns: CSVColumn<T>[]
): string {
    if (!data || data.length === 0) {
        return "";
    }

    // 1. Transform data into flat objects based on columns
    const flatData = data.map(row => {
        const flatRow: Record<string, any> = {};

        columns.forEach(col => {
            let value: any;

            // Get value using accessor
            if (typeof col.accessor === 'function') {
                value = col.accessor(row);
            } else {
                value = getNestedValue(row, col.accessor);
            }

            // Apply custom formatter if provided
            if (col.formatter && value !== null && value !== undefined) {
                value = col.formatter(value);
            }

            // Handle boolean values specifically
            if (typeof value === 'boolean') {
                value = value ? "Yes" : "No";
            }

            flatRow[col.header] = value;
        });

        return flatRow;
    });

    // 2. Use PapaParse to unparse (convert JSON to CSV)
    return Papa.unparse(flatData, {
        quotes: true, // Force quotes around all fields for safety
        header: true,
        skipEmptyLines: true
    });
}

/**
 * Download CSV file
 */
export function downloadCSV(
    csvContent: string,
    options: CSVExportOptions = {}
): void {
    const {
        filename = "export",
        includeTimestamp = true
    } = options;

    // Create filename with formatted timestamp
    const date = new Date();
    const timestamp = includeTimestamp
        ? `_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        : "";

    const fullFilename = `${filename}${timestamp}.csv`;

    // Create blob and download
    // Adding BOM for Excel compatibility with UTF-8
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });

    // Create link and trigger download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", fullFilename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T>(
    data: T[],
    columns: CSVColumn<T>[],
    options: CSVExportOptions = {}
): void {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    const csvContent = convertToCSV(data, columns);
    downloadCSV(csvContent, options);
}
