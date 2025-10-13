"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Edit2,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import debounce from "lodash/debounce";

import { CustomCheckbox } from "../components/CustomCheckbox";
import {
  LoadingSpinner,
  LoadingOverlay,
  TableRowSkeleton,
} from "../components/LoadingSpinner";

const getThemeClasses = (theme) => ({
  background: theme === "dark" ? "bg-gray-900" : "bg-gray-50",
  cardBackground: theme === "dark" ? "bg-gray-800" : "bg-white",
  text: theme === "dark" ? "text-white" : "text-gray-900",
  textSecondary: theme === "dark" ? "text-gray-300" : "text-gray-600",
  border: theme === "dark" ? "border-gray-700" : "border-gray-200",
  headerBackground: theme === "dark" ? "bg-gray-700" : "bg-gray-100",
  headerText: theme === "dark" ? "text-white" : "text-gray-700",
  rowHover: theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100",
  rowSelected: theme === "dark" ? "bg-blue-900/30" : "bg-blue-50",
  badgeActive: "bg-green-100 text-green-800",
  badgeInactive: "bg-red-100 text-red-800",
  paginationBackground: theme === "dark" ? "bg-gray-800" : "bg-gray-50",
  paginationIcon: theme === "dark" ? "text-white" : "text-gray-700",
});

const TableHeader = React.memo(({ columns, sortConfig, onSort, themeClasses, enableRowSelection }) => (
  <thead className={`${themeClasses.headerBackground} ${themeClasses.headerText} sticky top-0 z-10`}>
    <tr>
      {enableRowSelection && (
        <th className={`p-3 text-left border-r ${themeClasses.border} w-12`}>
          <span className="sr-only">Select</span>
        </th>
      )}
      {columns.map((col) => (
        <th key={col.field} className={`p-3 text-left border-r ${themeClasses.border}`}>
          {col.sortable ? (
            <button onClick={() => onSort(col.field)} className="flex items-center gap-1 font-semibold hover:text-blue-600">
              {col.header}
              {sortConfig?.key === col.field ? (
                sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />
              ) : (
                <ChevronUp className="w-4 h-4 opacity-30" />
              )}
            </button>
          ) : (
            col.header
          )}
        </th>
      ))}
    </tr>
  </thead>
));

const TableRow = React.memo(({ row, columns, themeClasses, onRowClick, selected, enableRowSelection, handleSelectRow }) => (
  <tr
    className={`border-b ${themeClasses.border} ${themeClasses.rowHover} ${selected ? themeClasses.rowSelected : ''}`}
    onClick={() => onRowClick?.(row)}
  >
    {enableRowSelection && (
      <td className={`p-3 border-r ${themeClasses.border}`} onClick={e => e.stopPropagation()}>
        <CustomCheckbox checked={selected} onChange={() => handleSelectRow(row._id)} id={`checkbox-${row._id}`} />
      </td>
    )}
    {columns.map((col) => (
      <td key={col.field} className={`p-3 border-r ${themeClasses.border} text-sm ${themeClasses.text}`}> 
        {col.render ? col.render(row) : row[col.field] ?? 'N/A'}
      </td>
    ))}
  </tr>
));

const Pagination = ({ currentPage, pageSize, totalItems, onPageChange, themeClasses, isLoading }) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  return (
    <div className={`${themeClasses.paginationBackground} border-t ${themeClasses.border} px-4 py-3`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm ${themeClasses.textSecondary}`}>Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onPageChange(1)} disabled={currentPage === 1 || isLoading} className={`p-1 rounded border ${themeClasses.border} hover:${themeClasses.rowHover} disabled:opacity-50 ${themeClasses.paginationIcon}`}><ChevronsLeft size={16} /></button>
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className={`p-1 rounded border ${themeClasses.border} hover:${themeClasses.rowHover} disabled:opacity-50 ${themeClasses.paginationIcon}`}><ChevronLeft size={16} /></button>
          <span className={`text-sm ${themeClasses.text}`}>Page {currentPage} of {totalPages}</span>
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className={`p-1 rounded border ${themeClasses.border} hover:${themeClasses.rowHover} disabled:opacity-50 ${themeClasses.paginationIcon}`}><ChevronRight size={16} /></button>
          <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages || isLoading} className={`p-1 rounded border ${themeClasses.border} hover:${themeClasses.rowHover} disabled:opacity-50 ${themeClasses.paginationIcon}`}><ChevronsRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, rowName, theme, isLoading }) => {
  const themeClasses = getThemeClasses(theme);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${themeClasses.cardBackground} ${themeClasses.text} rounded-lg shadow-xl max-w-md w-full p-6`}>
        {isLoading && <LoadingOverlay isVisible message="Deleting..." />}
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-semibold">Confirm Deletion</h3>
          <button onClick={onClose} disabled={isLoading} className={`ml-auto p-1 rounded-full hover:${themeClasses.rowHover}`}><X className="w-5 h-5" /></button>
        </div>
        <p className={themeClasses.textSecondary}>Are you sure you want to delete <strong>{rowName}</strong>? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} disabled={isLoading} className={`px-4 py-2 rounded-md border ${themeClasses.border} ${themeClasses.text} hover:${themeClasses.rowHover}`}>Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2">{isLoading && <LoadingSpinner size="sm" />}Delete</button>
        </div>
      </div>
    </div>
  );
};

export default function AgDemo({ columns, fetchData, theme = "light", pagination = { pageSize: 10 }, onRowClick, onEdit, onDelete, enableRowSelection = true }) {
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(pagination.pageSize);
  const [sortConfig, setSortConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, row: null });

  const themeClasses = getThemeClasses(theme);

  const enhancedColumns = useMemo(() => [
    ...columns,
    {
      header: "Status",
      field: "status",
      render: (row) => <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${row.status === 'active' ? themeClasses.badgeActive : themeClasses.badgeInactive}`}>{row.status || 'N/A'}</span>
    },
    ...(onEdit || onDelete ? [{
      header: "Actions",
      field: "actions",
      render: (row) => (
        <div className="flex gap-2">
          {onEdit && <button onClick={() => onEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-500 hover:text-white rounded"><Edit2 size={14} /></button>}
          {onDelete && <button onClick={() => setDeleteModal({ isOpen: true, row })} className="p-1.5 text-red-600 hover:bg-red-500 hover:text-white rounded"><Trash2 size={14} /></button>}
        </div>
      )
    }] : [])
  ], [columns, onEdit, onDelete, themeClasses]);

  const handleSelectRow = useCallback((id) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  }, []);

  useEffect(() => {
    const load = debounce(async () => {
      setIsLoading(true);
      try {
        const params = { page: currentPage, pageSize };
        if (sortConfig) params.sortKey = sortConfig.key, params.sortDir = sortConfig.direction;
        if (searchTerm) params.search = searchTerm;
        const result = await fetchData(params);
        setData(result.data || []);
        setTotalItems(result.total || 0);
      } catch {
        setData([]);
        setTotalItems(0);
      }
      setIsLoading(false);
    }, 300);
    load();
    return () => load.cancel();
  }, [currentPage, pageSize, sortConfig, searchTerm, fetchData]);

  const handleSort = key => setSortConfig(prev => prev?.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' });

  const handleExport = () => {
    const headers = enhancedColumns.map(c => c.header).join(',');
    const rows = data.map(r => enhancedColumns.map(c => `"${r[c.field] ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'data.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const confirmDelete = async () => {
    if (deleteModal.row && onDelete) {
      setIsLoading(true);
      await onDelete(deleteModal.row);
      setDeleteModal({ isOpen: false, row: null });
      setIsLoading(false);
    }
  };

  return (
    <div className={`${themeClasses.background} h-[700px] flex flex-col`}>
      <div className={`${themeClasses.cardBackground} rounded-lg shadow-lg border ${themeClasses.border} flex-1 flex flex-col overflow-hidden`}>
        <div className={`${themeClasses.headerBackground} ${themeClasses.headerText} p-4 border-b ${themeClasses.border}`}>...</div>
        <div className="flex-1 overflow-auto">
          {isLoading && <LoadingOverlay isVisible message="Loading data..." />}  
          <table className="w-full min-w-[900px]">
            <TableHeader columns={enhancedColumns} sortConfig={sortConfig} onSort={handleSort} themeClasses={themeClasses} enableRowSelection={enableRowSelection} />
            <tbody>
              {isLoading ? Array.from({ length: pageSize }).map((_, i) => <TableRowSkeleton key={i} />) : data.length > 0 ? data.map(r => <TableRow key={r._id} row={r} columns={enhancedColumns} themeClasses={themeClasses} onRowClick={onRowClick} selected={selectedRows.has(r._id)} enableRowSelection={enableRowSelection} handleSelectRow={handleSelectRow} />) : <tr><td colSpan={enhancedColumns.length + (enableRowSelection ? 1 : 0)} className={`p-4 text-center ${themeClasses.text}`}>No data available</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={totalItems} onPageChange={setCurrentPage} themeClasses={themeClasses} isLoading={isLoading} />
      </div>
      <DeleteConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, row: null })} onConfirm={confirmDelete} rowName={deleteModal.row?.name} theme={theme} isLoading={isLoading} />
    </div>
  );
}
