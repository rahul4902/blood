// components/tests/TestsTable.tsx
import { forwardRef, useMemo, useCallback } from "react"
import { Edit2, Trash2 } from "lucide-react"
import AgDemo2 from "@/components/AgDemo2"
import { baseURL } from "@/lib/utils"
import { TestTableColumns } from "./TestTableColumns"


export const TestsTable = forwardRef(
  ({ filters, onEdit, onDelete, onAddNew, onRefresh }, ref) => {
    const columns = useMemo(() => TestTableColumns(onEdit, onDelete, onRefresh), [onEdit, onDelete, onRefresh])

    const responseAdapter = useCallback((json) => {
      const rows = json?.data?.tests || json?.data?.data || json?.tests || json?.items || json?.data || []
      const total = json?.data?.total || json?.total || rows.length || 0
      return { rows, total }
    }, [])

    return (
      <AgDemo2
        ref={ref}
        fetchDataUrl={`${baseURL}tests`}
        columns={columns}
        pagination={{ pageSize: 10 }}
        onRowClick={() => {}}
        enableRowSelection={true}
        title="Tests List"
        onAddNewRecord={onAddNew}
        queryParamNames={{ page: "page", pageSize: "pageSize", sortBy: "sortBy", sortOrder: "sortOrder", search: "search" }}
        extraParams={{
          ...(filters.category && filters.category !== "__all__" ? { category: filters.category, categoryId: filters.category } : {}),
          ...(filters.typeFilter && filters.typeFilter !== "__all__" ? { type: filters.typeFilter } : {}),
          ...(filters.sampleType && filters.sampleType !== "__all__" ? { sampleType: filters.sampleType, sampleTypeId: filters.sampleType } : {}),
          ...(filters.status && filters.status !== "__all__" ? { status: filters.status, isActive: filters.status === "1" } : {}),
          ...(filters.isFeatured && filters.isFeatured !== "__all__" ? { isFeatured: filters.isFeatured, featured: filters.isFeatured === "1" } : {}),
          ...(filters.isPopular && filters.isPopular !== "__all__" ? { isPopular: filters.isPopular, popular: filters.isPopular === "1" } : {}),
        }}
        responseAdapter={responseAdapter}
      />
    )
  }
)

TestsTable.displayName = "TestsTable"
