"use client";

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader } from "lucide-react";
import axios from "axios";

const SortIcon = ({ column, sortBy, sortOrder }) => {
  if (sortBy !== column) {
    return (
      <span className="inline-flex flex-col ml-1 opacity-40">
        <ChevronUp className="w-3 h-3 -mb-1" />
        <ChevronDown className="w-3 h-3" />
      </span>
    );
  }
  return sortOrder === "asc" ? (
    <ChevronUp className="w-3 h-3 ml-1" />
  ) : (
    <ChevronDown className="w-3 h-3 ml-1" />
  );
};

const AgDemo2 = forwardRef(({
  fetchDataUrl,
  columns = [],
  pagination = { pageSize: 10 },
  onRowClick,
  enableRowSelection = false,
  title = "Data Table",
  onAddNewRecord,
  queryParamNames = { page: "page", pageSize: "pageSize", sortBy: "sortBy", sortOrder: "sortOrder", search: "search" },
  extraParams = {},
  responseAdapter = (json) => ({ rows: json?.data || json?.items || [], total: json?.total || 0 })
}, ref) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(pagination.pageSize || 10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedRows, setSelectedRows] = useState([]);

  const isAllSelected = enableRowSelection && rows.length > 0 && rows.every(r => selectedRows.includes(r._id || r.id));

  // Stabilize defaults to avoid dependency churn
  const defaultQPRef = React.useRef({ page: "page", pageSize: "pageSize", sortBy: "sortBy", sortOrder: "sortOrder", search: "search" })
  const defaultExtraRef = React.useRef({})
  const defaultAdapterRef = React.useRef((json) => ({ rows: json?.data || json?.items || [], total: json?.total || 0 }))

  const qp = queryParamNames || defaultQPRef.current
  const extra = extraParams && Object.keys(extraParams).length > 0 ? extraParams : defaultExtraRef.current
  const adapt = responseAdapter || defaultAdapterRef.current
  const extraKey = React.useMemo(() => JSON.stringify(extra), [extra])
  const qpKey = React.useMemo(() => JSON.stringify(qp), [qp])

  const fetchData = useCallback(async () => {
    if (!fetchDataUrl) return;
    setLoading(true);
    try {
      const params = {
        [qp.page]: page,
        [qp.pageSize]: pageSize,
        ...(search && { [qp.search]: search }),
        ...(sortBy && { [qp.sortBy]: sortBy }),
        ...(sortBy && { [qp.sortOrder]: sortOrder }),
        ...extra
      };
      const response = await axios.get(fetchDataUrl, { params });
      const adapted = adapt(response.data);
      setRows(adapted.rows || []);
      setTotal(adapted.total || 0);
    } catch (err) {
      console.error("Error fetching data:", err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [fetchDataUrl, page, pageSize, search, sortBy, sortOrder, extraKey, qpKey, adapt]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = (e) => {
    const checked = e?.target?.checked;
    if (checked) {
      setSelectedRows(rows.map(row => row._id || row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (rowId, e) => {
    const checked = e?.target?.checked;
    if (checked) {
      setSelectedRows(prev => Array.from(new Set([...prev, rowId])));
    } else {
      setSelectedRows(prev => prev.filter(id => id !== rowId));
    }
  };

  const refresh = useCallback(() => { fetchData(); }, [fetchData]);
  useImperativeHandle(ref, () => ({ refresh }));

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <div className="flex items-center gap-2">
              {onAddNewRecord && (
                <Button onClick={onAddNewRecord} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <span className="mr-2">+</span>
                  Add New
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 pr-4 py-1 w-64 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {loading && (
            <div className="flex items-center gap-2 p-3 text-gray-600 dark:text-gray-300">
              <Loader className="animate-spin w-4 h-4" /> Loading...
            </div>
          )}

          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white sticky top-0 z-10">
              <tr>
                {enableRowSelection && (
                  <th className="px-3 py-1 border-r border-gray-200 dark:border-gray-700 w-12">
                    <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
                  </th>
                )}
                {columns.map((col) => (
                  <th key={col.field} className="px-3 py-1 text-left border-r border-gray-200 dark:border-gray-700">
                    {col.sortable ? (
                      <button onClick={() => handleSort(col.field)} className="flex items-center gap-1 font-semibold hover:text-blue-600 dark:hover:text-blue-400">
                        {col.header}
                        <SortIcon column={col.field} sortBy={sortBy} sortOrder={sortOrder} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                      {enableRowSelection && (
                        <td className="px-3 py-1 border-r border-gray-200 dark:border-gray-700">
                          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                        </td>
                      )}
                      {columns.map((_, j) => (
                        <td key={j} className="px-3 py-1 border-r border-gray-200 dark:border-gray-700">
                          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.length > 0
                ? rows.map((row) => {
                    const rowId = row._id || row.id;
                    const checked = selectedRows.includes(rowId);
                    return (
                      <tr key={rowId} className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 ${checked ? "bg-blue-50 dark:bg-blue-900/30" : ""}`} onClick={() => onRowClick?.(row)}>
                        {enableRowSelection && (
                          <td className="px-3 py-1 border-r border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={checked} onChange={(e) => handleSelectRow(rowId, e)} />
                          </td>
                        )}
                        {columns.map((col) => (
                          <td key={col.field} className="px-3 py-1 border-r border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                            {col.render ? col.render(row) : (row[col.field] ?? "N/A")}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                : (
                  <tr>
                    <td colSpan={columns.length + (enableRowSelection ? 1 : 0)} className="p-4 text-center text-gray-900 dark:text-white">
                      No data available
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Showing {Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(1)} disabled={page === 1 || loading} className="p-1 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white hover:bg-blue-500 hover:text-white disabled:opacity-50">
                <ChevronsLeft size={16} />
              </button>
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || loading} className="p-1 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white hover:bg-blue-500 hover:text-white disabled:opacity-50">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-900 dark:text-white">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages || loading} className="p-1 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white hover:bg-blue-500 hover:text-white disabled:opacity-50">
                <ChevronRight size={16} />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages || loading} className="p-1 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white hover:bg-blue-500 hover:text-white disabled:opacity-50">
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AgDemo2.displayName = "AgDemo2";

export default AgDemo2;
