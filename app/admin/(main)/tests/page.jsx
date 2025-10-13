// app/tests/page.jsx
"use client"

import { useState, useRef, useCallback } from "react"
import { TestsTable } from "@/components/admin/tests/TestsTable"
import { TestsFilters } from "@/components/admin/tests/TestsFilters"
import { DeleteConfirmModal } from "@/components/admin/tests/DeleteConfirmModal"
import { TestFormDrawer } from "@/components/admin/tests/TestFormDrawer"
import { useTestsData } from "@/hooks/useTestsData"
import { useTestsFilters } from "@/hooks/useTestsFilters"
import axios from "axios"
import { baseURL } from "@/lib/utils"
import { showSuccessToast, showErrorToast } from "@/lib/toasts"

export default function TestsPage() {
  const tableRef = useRef(null)
  const { filters, updateFilter } = useTestsFilters()
  const { categoriesDropdownList, sampleTypesDropdown, categoryLoading, sampleTypeLoading } = useTestsData()

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, row: null })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dialogType, setDialogType] = useState("add") // "add" or "edit"
  const [selectedRow, setSelectedRow] = useState(null)

  const handleRefresh = useCallback(() => {
    tableRef.current?.refresh()
  }, [])

  const handleOpenAdd = useCallback(() => {
    setSelectedRow(null)
    setDialogType("add")
    setDrawerOpen(true)
  }, [])

  const handleEdit = useCallback(async (row) => {
    setSelectedRow(row)
    try {
      const response = await axios.get(`${baseURL}tests/slug/${row.slug}`)
      const testData = response.data.data || response.data
      setSelectedRow(testData)
      setDialogType("edit")
      setDrawerOpen(true)
    } catch (error) {
      showErrorToast("Failed to load test data for editing")
    }
  }, [])

  const handleDelete = useCallback(async () => {
    if (!confirmModal.row?._id) return
    try {
      const response = await axios.delete(`${baseURL}tests/${confirmModal.row._id}`)
      showSuccessToast(response?.data?.message || "Test deleted successfully")
      setConfirmModal({ isOpen: false, row: null })
      handleRefresh()
    } catch (error) {
      showErrorToast(error?.response?.data?.message || "Failed to delete test")
    }
  }, [confirmModal.row, handleRefresh])

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false)
    setSelectedRow(null)
  }, [])

  const handleSuccess = useCallback(() => {
    handleRefresh()
  }, [handleRefresh])

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900">
      <TestsFilters
        filters={filters}
        onFilterChange={updateFilter}
        categoriesDropdownList={categoriesDropdownList}
        sampleTypesDropdown={sampleTypesDropdown}
        categoryLoading={categoryLoading}
        sampleTypeLoading={sampleTypeLoading}
      />

      <TestsTable
        ref={tableRef}
        filters={filters}
        onEdit={handleEdit}
        onDelete={(row) => setConfirmModal({ isOpen: true, row })}
        onAddNew={handleOpenAdd}
        onRefresh={handleRefresh}
      />

      {/* Test Form Drawer */}
      <TestFormDrawer
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        mode={dialogType}
        initialData={selectedRow}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, row: null })}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this test? This action cannot be undone."
      />
    </div>
  )
}
