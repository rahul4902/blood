"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Pencil,
  Trash2,
  Download,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Sun,
  Moon,
  X,
  AlertTriangle,
  Grid,
  Table,
  Star,
  Tag,
  Calendar,
  RefreshCw,
} from "lucide-react";

import { CustomCheckbox } from "../components/CustomCheckbox";
import {
  LoadingSpinner,
  LoadingOverlay,
  TableRowSkeleton,
  GridCardSkeleton,
} from "../components/LoadingSpinner";

// Sample data generator
const generateSampleData = () => {
  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports",
    "Toys",
    "Beauty",
    "Automotive",
    "Health",
    "Music",
    "Movies",
    "Games",
    "Food",
    "Travel",
    "Education",
    "Business",
    "Art",
    "Pets",
    "Technology",
    "Fashion",
    "Fitness",
    "Photography",
    "Cooking",
    "DIY",
    "Science",
    "History",
  ];

  const descriptions = [
    "Premium quality products for modern lifestyle",
    "Curated collection of trending items",
    "Essential items for everyday use",
    "Professional grade equipment and tools",
    "Innovative solutions for contemporary needs",
    "High-performance products for enthusiasts",
    "Sustainable and eco-friendly options",
    "Luxury items with exceptional craftsmanship",
    "Budget-friendly alternatives without compromise",
    "Cutting-edge technology for the future",
  ];

  const emails = [
    "john.doe@company.com",
    "jane.smith@company.com",
    "mike.johnson@enterprise.org",
    "sarah.wilson@business.net",
    "david.brown@corporation.com",
    "lisa.davis@organization.org",
    "robert.miller@company.co.uk",
    "emily.garcia@business.io",
    "michael.rodriguez@enterprise.com",
    "jennifer.martinez@company.net",
  ];

  return Array.from({ length: 50 }, (_, index) => {
    const name = categories[index % categories.length];
    const baseDate = new Date(
      2024,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );
    const updatedDate = new Date(
      baseDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
    );

    return {
      _id: `category_${(index + 1).toString().padStart(4, "0")}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      name: index === 0 ? "Pug" : `${name} ${index > 25 ? "Pro" : ""}`,
      email: emails[index % emails.length],
      description:
        index === 0
          ? "test"
          : descriptions[Math.floor(Math.random() * descriptions.length)],
      parent:
        Math.random() > 0.7
          ? `parent_${Math.floor(Math.random() * 5) + 1}`
          : null,
      isFeatured: Math.random() > 0.6,
      isDeleted: Math.random() > 0.9,
      createdAt: baseDate.toISOString(),
      updatedAt: updatedDate.toISOString(),
    };
  });
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  isDark,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className={`${
          isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all animate-scale-in relative`}
      >
        {isLoading && <LoadingOverlay isVisible={true} message="Deleting..." />}

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold">Confirm Deletion</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`ml-auto p-1 rounded-full hover:${
              isDark ? "bg-gray-700" : "bg-gray-100"
            } transition-colors disabled:opacity-50`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Are you sure you want to delete the category{" "}
          <strong>"{categoryName}"</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md border ${
              isDark
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } transition-colors disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};



export default function AgDataTable() {
  const [data] = useState(generateSampleData());
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [globalSearch, setGlobalSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDark, setIsDark] = useState(true);
  const [layout, setLayout] = useState("table");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null,
  });

  // Loading states (removed isSearching)
  const [isLoading, setIsLoading] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load theme preference from localStorage


  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Simulate async operations with loading states
  const simulateAsyncOperation = useCallback((operation, duration = 800) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }, []);

  // Global search filtering - immediate response for better UX
  const globalSearchData = useMemo(() => {
    if (!globalSearch) return data;

    return data.filter((row) => {
      const searchTerm = globalSearch.toLowerCase();
      return (
        row.name.toLowerCase().includes(searchTerm) ||
        row.email.toLowerCase().includes(searchTerm) ||
        row.description.toLowerCase().includes(searchTerm) ||
        row._id.toLowerCase().includes(searchTerm) ||
        (row.parent && row.parent.toLowerCase().includes(searchTerm))
      );
    });
  }, [data, globalSearch]);

  // Sorting logic with loading
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return globalSearchData;

    return [...globalSearchData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [globalSearchData, sortConfig]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Enhanced handlers with loading states
  const handleSort = async (key) => {
    setIsSorting(true);
    await simulateAsyncOperation("sort", 500);

    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

    setIsSorting(false);
  };

  // Improved search handler - no async delay for better UX
  const handleGlobalSearch = (value) => {
    setGlobalSearch(value);
    setCurrentPage(1);
  };

  const handlePageChange = async (newPage) => {
    setIsPaginating(true);
    await simulateAsyncOperation("paginate", 400);

    setCurrentPage(newPage);

    setIsPaginating(false);
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (
      selectedRows.size === paginatedData.length &&
      paginatedData.length > 0
    ) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((row) => row._id)));
    }
  };

  const handleEdit = (row) => {
    alert(`Edit category: ${row.name}`);
  };

  const handleDeleteClick = (row) => {
    setDeleteModal({ isOpen: true, category: row });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.category) {
      setIsDeleting(true);
      await simulateAsyncOperation("delete", 1200);

      alert(`Deleted category: ${deleteModal.category.name}`);
      setDeleteModal({ isOpen: false, category: null });
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, category: null });
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    await simulateAsyncOperation("export", 1500);

    const headers = [
      "ID",
      "Name",
      "Email",
      "Description",
      "Parent",
      "Featured",
      "Deleted",
      "Created",
      "Updated",
    ];
    const csvContent = [
      headers.join(","),
      ...sortedData.map((row) =>
        [
          `"${row._id}"`,
          `"${row.name}"`,
          `"${row.email}"`,
          `"${row.description}"`,
          `"${row.parent || ""}"`,
          row.isFeatured,
          row.isDeleted,
          `"${row.createdAt}"`,
          `"${row.updatedAt}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "categories-data.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  const handleCopySelected = async () => {
    const selectedData = sortedData.filter((row) => selectedRows.has(row._id));
    if (selectedData.length === 0) {
      alert("Please select rows to copy");
      return;
    }

    setIsLoading(true);
    await simulateAsyncOperation("copy", 800);

    const csvData = selectedData
      .map((row) => Object.values(row).join("\t"))
      .join("\n");
    navigator.clipboard.writeText(csvData);
    alert(`Copied ${selectedData.length} rows to clipboard`);

    setIsLoading(false);
  };

  const SortIcon = ({ column }) => {
    if (isSorting && sortConfig.key === column) {
      return <LoadingSpinner size="sm" className="text-blue-500" />;
    }

    if (sortConfig.key !== column) {
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-blue-500" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-500" />
    );
  };

  const getStatusBadge = (isFeatured, isDeleted) => {
    if (isDeleted) {
      return isDark
        ? "text-red-400 bg-red-900/30 border-red-700"
        : "text-red-600 bg-red-50 border-red-200";
    }
    if (isFeatured) {
      return isDark
        ? "text-yellow-400 bg-yellow-900/30 border-yellow-700"
        : "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
    return isDark
      ? "text-green-400 bg-green-900/30 border-green-700"
      : "text-green-600 bg-green-50 border-green-200";
  };

  const getStatusText = (isFeatured, isDeleted) => {
    if (isDeleted) return "Deleted";
    if (isFeatured) return "Featured";
    return "Active";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Updated theme classes with light AG Grid colors
  const themeClasses = {
    background: isDark ? "bg-gray-900" : "bg-gray-50",
    cardBackground: isDark ? "bg-gray-800" : "bg-white",
    text: isDark ? "text-white" : "text-gray-900",
    textSecondary: isDark ? "text-gray-300" : "text-gray-600",
    border: isDark ? "border-gray-700" : "border-gray-200",
    // Light AG Grid default colors
    headerBackground: isDark ? "bg-gray-700" : "bg-gray-50",
    headerBorder: isDark ? "border-gray-600" : "border-gray-200",
    headerText: isDark ? "text-white" : "text-gray-700",
    rowEven: isDark ? "bg-gray-800" : "bg-white",
    rowOdd: isDark ? "bg-gray-900" : "bg-gray-50",
    rowHover: isDark ? "hover:bg-gray-700" : "hover:bg-gray-100",
    rowSelected: isDark ? "bg-blue-900/30" : "bg-blue-50",
    paginationBackground: isDark ? "bg-gray-800" : "bg-gray-50",
  };

  return (
    <div
      className={`${themeClasses.background} transition-colors duration-200`}
    >
      <div className="">
        {/* Main Data Container */}
        <div
          className={`${themeClasses.cardBackground} rounded-lg shadow-lg border ${themeClasses.border} overflow-hidden animate-fade-in relative`}
        >
          {(isPaginating || isSorting) && (
            <LoadingOverlay
              isVisible={true}
              message={isPaginating ? "Loading page..." : "Sorting data..."}
            />
          )}

          {layout === "table" ? (
            // Table Layout - Always visible on all screen sizes
            <div className="flex flex-col h-[700px]">
              {/* Enhanced Table Header with Controls */}
              <div
                className={`${themeClasses.headerBackground} ${themeClasses.headerText} flex-shrink-0`}
              >
                <div
                  className={`flex items-center justify-between p-4 border-b ${themeClasses.headerBorder}`}
                >
                  {/* Left Side - Select All and Action Buttons */}
                  <div className="flex items-center gap-4">
                    <CustomCheckbox
                      checked={
                        selectedRows.size === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onChange={handleSelectAll}
                      id="select-all-table-header"
                      className="flex-shrink-0"
                    />
                    <h3 className="font-semibold whitespace-nowrap text-sm lg:text-base">
                      Categories ({sortedData.length})
                    </h3>

                    {/* Action Buttons - Icons Only */}
                    <div className="flex items-center gap-1 lg:gap-2">
                      <button
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        className={`icon-btn p-2 rounded-md ${themeClasses.cardBackground} border ${themeClasses.border} hover:bg-blue-500 hover:text-white transition-all duration-200 hover:scale-105 disabled:opacity-50`}
                        title="Export CSV"
                      >
                        {isExporting ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Download size={14} />
                        )}
                      </button>
                      <div
                        className={`flex items-center rounded-lg border ${themeClasses.border} p-1`}
                      >
                        <button
                          onClick={() => setLayout("table")}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                            layout === "table"
                              ? "bg-blue-600 text-white shadow-md"
                              : `${themeClasses.cardBackground} ${themeClasses.text} hover:opacity-80`
                          }`}
                        >
                          <Table className="w-4 h-4" />
                          {/* <span className="hidden sm:inline">Table</span> */}
                        </button>
                        <button
                          onClick={() => setLayout("grid")}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                            layout === "grid"
                              ? "bg-blue-600 text-white shadow-md"
                              : `${themeClasses.cardBackground} ${themeClasses.text} hover:opacity-80`
                          }`}
                        >
                          <Grid className="w-4 h-4" />
                          {/* <span className="hidden sm:inline">Grid</span> */}
                        </button>
                      </div>

                      {/* Theme Toggle */}
                      {/* <button
                        onClick={() => setIsDark(!isDark)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.cardBackground} ${themeClasses.text} hover:opacity-80 transition-all duration-200 hover:scale-105`}
                      >
                        {isDark ? (
                          <Sun className="w-5 h-5" />
                        ) : (
                          <Moon className="w-5 h-5" />
                        )}
                         <span className="hidden sm:inline">
                          {isDark ? "Light" : "Dark"}
                        </span> 
                      </button> */}

                      <button
                        onClick={handleCopySelected}
                        disabled={isLoading || selectedRows.size === 0}
                        className={`icon-btn p-2 rounded-md ${themeClasses.cardBackground} border ${themeClasses.border} hover:bg-green-500 hover:text-white transition-all duration-200 hover:scale-105 disabled:opacity-50`}
                        title={`Copy Selected (${selectedRows.size})`}
                      >
                        {isLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>

                      <button
                        onClick={() => window.location.reload()}
                        className={`icon-btn p-2 rounded-md ${themeClasses.cardBackground} border ${themeClasses.border} hover:bg-purple-500 hover:text-white transition-all duration-200 hover:scale-105`}
                        title="Refresh"
                      >
                        <RefreshCw size={14} />
                      </button>

                      <button
                        onClick={() => setSelectedRows(new Set())}
                        disabled={selectedRows.size === 0}
                        className={`icon-btn p-2 rounded-md ${themeClasses.cardBackground} border ${themeClasses.border} hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-105 disabled:opacity-50`}
                        title="Clear Selection"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Right Side - Search Input */}
                  <div className="flex items-center gap-3">
                    {isSorting && (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm hidden lg:inline">
                          Sorting...
                        </span>
                      </div>
                    )}

                    <div className="relative search-input-group">
                      <Search
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textSecondary}`}
                      />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={globalSearch}
                        onChange={(e) => handleGlobalSearch(e.target.value)}
                        className={`pl-9 pr-8 py-2 w-48 lg:w-64 rounded-md border ${themeClasses.border} ${themeClasses.cardBackground} ${themeClasses.text} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm`}
                        autoComplete="off"
                      />
                      {globalSearch && (
                        <button
                          onClick={() => handleGlobalSearch("")}
                          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:${
                            isDark ? "bg-gray-700" : "bg-gray-100"
                          } transition-colors`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Table Content */}
              <div className="flex-1 overflow-auto">
                <table className="w-full min-w-[900px]">
                  <thead
                    className={`${themeClasses.headerBackground} ${themeClasses.headerText} sticky top-0 z-10`}
                  >
                    <tr>
                      <th
                        className={`p-3 text-left border-r ${themeClasses.headerBorder} w-12`}
                      >
                        <span className="sr-only">Select</span>
                      </th>
                      <th
                        className={`p-3 text-left border-r ${themeClasses.headerBorder} min-w-[200px]`}
                      >
                        <button
                          onClick={() => handleSort("name")}
                          disabled={isSorting}
                          className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors disabled:opacity-50"
                        >
                          Name <SortIcon column="name" />
                        </button>
                      </th>
                      <th
                        className={`p-3 text-left border-r ${themeClasses.headerBorder} min-w-[220px]`}
                      >
                        <button
                          onClick={() => handleSort("email")}
                          disabled={isSorting}
                          className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors disabled:opacity-50"
                        >
                          Email <SortIcon column="email" />
                        </button>
                      </th>
                      <th
                        className={`p-3 text-left border-r ${themeClasses.headerBorder} min-w-[280px]`}
                      >
                        <button
                          onClick={() => handleSort("description")}
                          disabled={isSorting}
                          className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors disabled:opacity-50"
                        >
                          Description <SortIcon column="description" />
                        </button>
                      </th>
                      <th
                        className={`p-3 text-left border-r ${themeClasses.headerBorder} min-w-[120px]`}
                      >
                        <button
                          onClick={() => handleSort("parent")}
                          disabled={isSorting}
                          className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors disabled:opacity-50"
                        >
                          Parent <SortIcon column="parent" />
                        </button>
                      </th>
                      <th
                        className={`p-3 text-left border-r ${themeClasses.headerBorder} w-24`}
                      >
                        Status
                      </th>
                      <th
                        className={`p-3 text-left border-r ${themeClasses.headerBorder} min-w-[120px]`}
                      >
                        <button
                          onClick={() => handleSort("createdAt")}
                          disabled={isSorting}
                          className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors disabled:opacity-50"
                        >
                          Created <SortIcon column="createdAt" />
                        </button>
                      </th>
                      <th className="p-3 text-left w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isPaginating || isSorting
                      ? // Show skeleton loaders during loading
                        Array.from({ length: pageSize }).map((_, index) => (
                          <TableRowSkeleton key={index} />
                        ))
                      : paginatedData.map((row, index) => (
                          <tr
                            key={row._id}
                            className={`border-b ${themeClasses.border} ${
                              themeClasses.rowHover
                            } ${
                              index % 2 === 0
                                ? themeClasses.rowEven
                                : themeClasses.rowOdd
                            } ${
                              selectedRows.has(row._id)
                                ? themeClasses.rowSelected
                                : ""
                            } transition-all duration-200 table-row-enter`}
                          >
                            <td
                              className={`p-3 border-r ${themeClasses.border}`}
                            >
                              <CustomCheckbox
                                checked={selectedRows.has(row._id)}
                                onChange={() => handleSelectRow(row._id)}
                                id={`table-checkbox-${row._id}`}
                              />
                            </td>
                            <td
                              className={`p-3 border-r ${themeClasses.border}`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded ${themeClasses.border} border flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600`}
                                >
                                  <Tag className="w-4 h-4 text-white" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-semibold ${themeClasses.text} truncate`}
                                      title={row.name}
                                    >
                                      {row.name}
                                    </span>
                                    {row.isFeatured && (
                                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 animate-pulse-slow" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td
                              className={`p-3 border-r ${themeClasses.border} text-sm ${themeClasses.text}`}
                            >
                              <div
                                className="truncate max-w-[200px] font-mono break-all"
                                title={row.email}
                              >
                                {row.email}
                              </div>
                            </td>
                            <td
                              className={`p-3 border-r ${themeClasses.border} text-sm ${themeClasses.textSecondary}`}
                            >
                              <div
                                className="truncate max-w-[260px]"
                                title={row.description}
                              >
                                {row.description}
                              </div>
                            </td>
                            <td
                              className={`p-3 border-r ${themeClasses.border} text-sm ${themeClasses.text}`}
                            >
                              <div
                                className="truncate"
                                title={row.parent || "None"}
                              >
                                {row.parent ? (
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                                    {row.parent}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </div>
                            </td>
                            <td
                              className={`p-3 border-r ${themeClasses.border}`}
                            >
                              <span
                                className={`status-badge px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                                  row.isFeatured,
                                  row.isDeleted
                                )} whitespace-nowrap`}
                              >
                                {getStatusText(row.isFeatured, row.isDeleted)}
                              </span>
                            </td>
                            <td
                              className={`p-3 border-r ${themeClasses.border} font-mono text-xs ${themeClasses.text}`}
                            >
                              <div className="truncate" title={row.createdAt}>
                                {formatDate(row.createdAt)}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleEdit(row)}
                                  className="p-1.5 rounded-md text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-200 hover:scale-110"
                                  title="Edit"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(row)}
                                  className="p-1.5 rounded-md text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              {/* Fixed Pagination Footer */}
              <div
                className={`${themeClasses.paginationBackground} border-t ${themeClasses.border} px-4 py-3 flex-shrink-0`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <span className={`text-sm ${themeClasses.textSecondary}`}>
                      Showing {(currentPage - 1) * pageSize + 1} to{" "}
                      {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
                      {sortedData.length} entries
                    </span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      disabled={isPaginating}
                      className={`border ${themeClasses.border} ${themeClasses.cardBackground} ${themeClasses.text} rounded px-2 py-1 text-sm disabled:opacity-50`}
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1 || isPaginating}
                      className={`p-1 rounded border ${
                        themeClasses.border
                      } disabled:opacity-50 disabled:cursor-not-allowed hover:${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1 || isPaginating}
                      className={`p-1 rounded border ${
                        themeClasses.border
                      } disabled:opacity-50 disabled:cursor-not-allowed hover:${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <span
                      className={`px-3 py-1 text-sm ${themeClasses.text} flex items-center gap-2`}
                    >
                      Page {currentPage} of {totalPages}
                      {isPaginating && <LoadingSpinner size="sm" />}
                    </span>

                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages || isPaginating}
                      className={`p-1 rounded border ${
                        themeClasses.border
                      } disabled:opacity-50 disabled:cursor-not-allowed hover:${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages || isPaginating}
                      className={`p-1 rounded border ${
                        themeClasses.border
                      } disabled:opacity-50 disabled:cursor-not-allowed hover:${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Grid Layout - Two categories per row, only shown when grid is selected
            <div className="flex flex-col h-[700px]">
              {/* Fixed Grid Header */}
              <div
                className={`${themeClasses.headerBackground} ${themeClasses.headerText} flex-shrink-0`}
              >
                <div
                  className={`flex items-center justify-between p-4 border-b ${themeClasses.headerBorder}`}
                >
                  <div className="flex items-center gap-3">
                    <CustomCheckbox
                      checked={
                        selectedRows.size === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onChange={handleSelectAll}
                      id="select-all-grid"
                    />
                    <h3 className="font-semibold">
                      Categories Grid View ({sortedData.length} total)
                    </h3>
                  </div>
                  {isSorting && (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm">Sorting...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Scrollable Grid Content - Two categories per row */}
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-0">
                  {isPaginating || isSorting
                    ? // Show skeleton loaders during loading
                      Array.from({ length: pageSize }).map((_, index) => (
                        <GridCardSkeleton key={index} />
                      ))
                    : paginatedData.map((row, index) => (
                        <div
                          key={row._id}
                          className={`${themeClasses.cardBackground} border ${
                            themeClasses.border
                          } rounded-lg p-6 ${
                            selectedRows.has(row._id)
                              ? themeClasses.rowSelected
                              : ""
                          } transition-all duration-200 card-hover flex flex-col grid-card-enter`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <CustomCheckbox
                                checked={selectedRows.has(row._id)}
                                onChange={() => handleSelectRow(row._id)}
                                id={`grid-checkbox-${row._id}`}
                              />
                              <div
                                className={`w-12 h-12 rounded-lg ${themeClasses.border} border-2 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-md`}
                              >
                                <Tag className="w-6 h-6 text-white" />
                              </div>
                              <span
                                className={`status-badge px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(
                                  row.isFeatured,
                                  row.isDeleted
                                )} whitespace-nowrap`}
                              >
                                {getStatusText(row.isFeatured, row.isDeleted)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(row)}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                                title="Edit Category"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(row)}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                                title="Delete Category"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="space-y-4 flex-1">
                            {/* Name and Featured */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3
                                  className={`text-xl font-bold ${themeClasses.text} truncate`}
                                  title={row.name}
                                >
                                  {row.name}
                                </h3>
                                {row.isFeatured && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium animate-pulse-slow">
                                    <Star className="w-3 h-3" />
                                    Featured
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Email - Fixed overflow issue */}
                            <div>
                              <label
                                className={`text-sm font-medium ${themeClasses.textSecondary} block mb-1`}
                              >
                                Email
                              </label>
                              <div
                                className={`text-sm ${themeClasses.text} font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded break-all transition-colors duration-200`}
                                title={row.email}
                              >
                                {row.email}
                              </div>
                            </div>

                            {/* Description */}
                            <div>
                              <label
                                className={`text-sm font-medium ${themeClasses.textSecondary} block mb-1`}
                              >
                                Description
                              </label>
                              <p
                                className={`text-sm ${themeClasses.text} line-clamp-2`}
                                title={row.description}
                              >
                                {row.description}
                              </p>
                            </div>

                            {/* Parent Category */}
                            <div>
                              <label
                                className={`text-xs font-medium ${themeClasses.textSecondary} block mb-1`}
                              >
                                Parent Category
                              </label>
                              <div
                                className={`text-sm ${themeClasses.text}`}
                                title={row.parent || "None"}
                              >
                                {row.parent ? (
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${themeClasses.border} border bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 transition-colors duration-200`}
                                  >
                                    {row.parent}
                                  </span>
                                ) : (
                                  <span className={themeClasses.textSecondary}>
                                    None
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700 mt-auto">
                              <div>
                                <label
                                  className={`text-xs font-medium ${themeClasses.textSecondary} block mb-1`}
                                >
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  Created
                                </label>
                                <div
                                  className={`text-xs font-mono ${themeClasses.text}`}
                                >
                                  {formatDate(row.createdAt)}
                                </div>
                              </div>
                              <div>
                                <label
                                  className={`text-xs font-medium ${themeClasses.textSecondary} block mb-1`}
                                >
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  Updated
                                </label>
                                <div
                                  className={`text-xs font-mono ${themeClasses.text}`}
                                >
                                  {formatDate(row.updatedAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>

                {/* Empty State */}
                {!isPaginating && !isSorting && paginatedData.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
                    <div
                      className={`w-16 h-16 rounded-full ${themeClasses.border} border-2 flex items-center justify-center mb-4`}
                    >
                      <Grid
                        className={`w-8 h-8 ${themeClasses.textSecondary}`}
                      />
                    </div>
                    <h3
                      className={`text-lg font-semibold ${themeClasses.text} mb-2`}
                    >
                      No categories found
                    </h3>
                    <p className={themeClasses.textSecondary}>
                      Try adjusting your search criteria
                    </p>
                  </div>
                )}
              </div>

              {/* Fixed Pagination Footer */}
              <div
                className={`${themeClasses.paginationBackground} border-t ${themeClasses.border} px-4 py-3 flex-shrink-0`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <span className={`text-sm ${themeClasses.textSecondary}`}>
                      Showing {(currentPage - 1) * pageSize + 1} to{" "}
                      {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
                      {sortedData.length} entries
                    </span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      disabled={isPaginating}
                      className={`border ${themeClasses.border} ${themeClasses.cardBackground} ${themeClasses.text} rounded px-2 py-1 text-sm disabled:opacity-50`}
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1 || isPaginating}
                      className={`p-1 rounded border ${
                        themeClasses.border
                      } disabled:opacity-50 disabled:cursor-not-allowed hover:${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1 || isPaginating}
                      className={`p-1 rounded border ${
                        themeClasses.border
                      } disabled:opacity-50 disabled:cursor-not-allowed hover:${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <span
                      className={`px-3 py-1 text-sm ${themeClasses.text} flex items-center gap-2`}
                    >
                      Page {currentPage} of {totalPages}
                      {isPaginating && <LoadingSpinner size="sm" />}
                    </span>

                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages || isPaginating}
                      className={`p-1 rounded border ${
                        themeClasses.border
                      } disabled:opacity-50 disabled:cursor-not-allowed hover:${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages || isPaginating}
                      className={`p-1 rounded border ${
                        themeClasses.border
                      } disabled:opacity-50 disabled:cursor-not-allowed hover:${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } transition-all duration-200 hover:scale-105`}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        categoryName={deleteModal.category?.name || ""}
        isDark={isDark}
        isLoading={isDeleting}
      />
    </div>
  );
}
