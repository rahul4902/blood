// components/tests/TestTableColumns.tsx
import axios from "axios"
import { Edit2, Trash2 } from "lucide-react"
import { baseURL } from "@/lib/utils"
import { showSuccessToast, showErrorToast } from "@/lib/toasts"
import Image from "next/image"

export const TestTableColumns = (onEdit, onDelete, onRefresh) => [
  {
    header: "Name",
    field: "name",
    sortable: true,
    render: (row) => (
      <div className="flex flex-col">
        <span className="text-gray-900 dark:text-white">{row.name}</span>
        <span className="mt-1 inline-flex items-center gap-1">
          {row.type && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${row.type === 'package' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700'}`}>
              {row.type === 'package' ? 'P' : 'T'}
            </span>
          )}
          {row.code ? <span className="text-[10px] text-gray-500">{row.code}</span> : null}
        </span>
      </div>
    )
  },
  { header: "Code", field: "code", sortable: true },
  {
    header: "Categories",
    field: "categories",
    sortable: false,
    render: (row) => {
      const cats = Array.isArray(row.categories) && row.categories.length > 0
        ? row.categories
        : (row.category ? [row.category] : [])

      if (!cats || cats.length === 0) return <span className="text-gray-700 dark:text-gray-300">-</span>

      return (
        <div className="flex flex-wrap gap-1">
          {cats.map((cat, idx) => (
            <span key={`${row._id}-cat-${idx}`} className="px-2 py-0.5 rounded-full text-xs border bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700">
              {typeof cat === 'string' ? cat : (cat?.name || cat?._id || cat?.id)}
            </span>
          ))}
        </div>
      )
    },
  },
  {
    header: "Sample Types",
    field: "sampleTypes",
    sortable: false,
    render: (row) => {
      const list = Array.isArray(row.sampleTypes) && row.sampleTypes.length > 0
        ? row.sampleTypes.map((s) => (typeof s === 'string' ? s : s?.name || s?._id || s?.id)).filter(Boolean)
        : (row.sampleType ? [row.sampleType?.name || row.sampleType] : [])
      if (!list || list.length === 0) return <span className="text-gray-700 dark:text-gray-300">-</span>
      return (
        <div className="flex flex-wrap gap-1">
          {list.map((name, idx) => (
            <span key={`${row._id}-st-${idx}`} className="px-2 py-0.5 rounded-full text-xs border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600">
              {name}
            </span>
          ))}
        </div>
      )
    },
  },
  {
    header: "Price",
    field: "price",
    sortable: true,
    render: (row) => (
      <div className="text-gray-900 dark:text-white">
        ₹{row.price}
        {row.mrp ? <span className="ml-2 text-xs text-gray-500 line-through">₹{row.mrp}</span> : null}
      </div>
    ),
  },
  {
    header: "Count",
    field: "parametersCount",
    sortable: false,
    render: (row) => {
      if (row.type === 'package') {
        const count = (Array.isArray(row.tests) ? row.tests.length : (typeof row.testsCount === 'number' ? row.testsCount : 0))
        return <span className="text-gray-700 dark:text-gray-300">{count}</span>
      }
      return <span className="text-gray-700 dark:text-gray-300">{row.parametersCount ?? 0}</span>
    },
  },
  {
    header: "Status",
    field: "status",
    sortable: true,
    render: (row) => (
      <button
        onClick={async (e) => {
          e.stopPropagation()
          try {
            await axios.patch(`${baseURL}tests/slug/${row.slug}/status`, { status: !row.status })
            showSuccessToast("Status updated successfully")
            onRefresh()
          } catch (error) {
            showErrorToast(error?.response?.data?.message || "Failed to update status")
          }
        }}
        className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${row.status ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700"}`}
      >
        {row.status ? "Active" : "Inactive"}
      </button>
    ),
  },
  { header: "Featured", field: "isFeatured", sortable: true, render: (row) => <span className="text-gray-700 dark:text-gray-300">{row.isFeatured ? "Yes" : "No"}</span> },
  { header: "Popular", field: "isPopular", sortable: true, render: (row) => <span className="text-gray-700 dark:text-gray-300">{row.isPopular ? "Yes" : "No"}</span> },
  {
    header: "Actions",
    field: "actions",
    render: (row) => (
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(row)}
          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white rounded"
          aria-label="Edit"
        >
          <Edit2 size={14} />
        </button>

        <button
          onClick={() => onDelete(row)}
          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded"
          aria-label="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    ),
  },
]
