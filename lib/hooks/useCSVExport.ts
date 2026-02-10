import { useCallback } from 'react';
import { exportToCSV, CSVColumn, CSVExportOptions } from '@/lib/utils/csvExport';

/**
 * Custom hook for CSV export functionality
 * 
 * @example
 * const { exportData, isExporting } = useCSVExport();
 * 
 * const handleExport = () => {
 *   exportData(users, userColumns, { filename: 'employees' });
 * };
 */
export function useCSVExport<T = any>() {
    const exportData = useCallback((
        data: T[],
        columns: CSVColumn<T>[],
        options?: CSVExportOptions
    ) => {
        try {
            exportToCSV(data, columns, options);
            return true;
        } catch (error) {
            console.error('Error exporting CSV:', error);
            return false;
        }
    }, []);

    return {
        exportData
    };
}
