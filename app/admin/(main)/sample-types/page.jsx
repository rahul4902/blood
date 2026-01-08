// app/admin/(main)/sample-types/page.jsx
"use client";

import { useCallback, useMemo, useRef, useState, useEffect, memo } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit2, Trash2, Loader } from "lucide-react";
import apiClient, { sampleTypeAPI } from "@/lib/api";
import AgDemo2 from "@/components/AgDemo2";
import ConfirmModal from "@/components/ConfirmModal";
import { showSuccessToast, showErrorToast } from "@/lib/toasts";
import { baseURL } from "@/lib/utils";

const validateFormData = (formData) => {
  const errors = {};
  if (!formData.name || formData.name.trim() === "") {
    errors.name = "Name is required";
  }
  return errors;
};

const SampleTypeForm = memo(function SampleTypeForm({ isEdit = false, selected, onSubmit }) {
  const inputRef = useRef(null);
  const [formData, setFormData] = useState(
    isEdit
      ? {
          name: selected?.name || "",
          description: selected?.description || "",
          isActive: selected?.isActive ? "1" : "0",
        }
      : { name: "", description: "", isActive: "1" }
  );
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current) {
      inputRef.current.focus();
    }
  }, [formData.name]);

  const handleSave = useCallback(async () => {
    const validationErrors = validateFormData(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    
    try {
      setIsLoading(true);
      console.log('💾 Saving sample type...', { isEdit, id: selected?._id });
      
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        isActive: formData.isActive === "1",
      };

      let response;
      if (isEdit && selected?._id) {
        response = await sampleTypeAPI.update(selected._id, payload);
      } else {
        response = await sampleTypeAPI.create(payload);
      }

      console.log('✅ Sample type saved:', response);
      showSuccessToast(response?.message || (isEdit ? "Updated successfully" : "Created successfully"));
      onSubmit();
    } catch (error) {
      console.error('❌ Save error:', error);
      const serverErrors = error?.response?.data?.error?.details?.errors || {};
      if (serverErrors.name) {
        setErrors((prev) => ({ ...prev, name: serverErrors.name }));
      }
      showErrorToast(error?.response?.data?.message || "Operation failed.");
    } finally {
      setIsLoading(false);
    }
  }, [formData, isEdit, selected, onSubmit]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="name" className="text-gray-900 dark:text-white">
            Name *
          </Label>
          <Input
            ref={inputRef}
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            placeholder="Enter sample type name"
            className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 ${
              errors.name ? "border-red-500" : ""
            }`}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description" className="text-gray-900 dark:text-white">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            placeholder="Enter description (optional)"
            rows={3}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
          />
        </div>

        <div>
          <Label htmlFor="status" className="text-gray-900 dark:text-white">
            Status
          </Label>
          <Select value={formData.isActive} onValueChange={(value) => setFormData((p) => ({ ...p, isActive: value }))}>
            <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          variant="outline"
          className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onSubmit}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isLoading} 
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin mr-2" size={16} />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            isEdit ? "Update" : "Create"
          )}
        </Button>
      </div>
    </div>
  );
});

export default function SampleTypesManagement() {
  const { accessToken, admin } = useAdminAuth();
  const tableRef = useRef(null);
  const [dialogState, setDialogState] = useState({ type: null, isOpen: false });
  const [selectedRow, setSelectedRow] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, row: null });

  const handleRefresh = useCallback(() => {
    console.log('🔄 Refreshing sample types table...');
    if (tableRef.current) {
      tableRef.current.refresh();
    }
  }, []);

  const handleEdit = useCallback((row) => {
    console.log('✏️ Editing sample type:', row._id);
    setSelectedRow(row);
    setDialogState({ type: "edit", isOpen: true });
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      try {
        console.log('🗑️ Deleting sample type:', id);
        const response = await sampleTypeAPI.delete(id);
        console.log('✅ Deleted successfully:', response);
        showSuccessToast(response?.message || "Deleted successfully");
        handleRefresh();
      } catch (error) {
        console.error('❌ Delete error:', error);
        showErrorToast(error?.response?.data?.message || "Failed to delete.");
      }
    },
    [handleRefresh]
  );

  const onConfirmDelete = useCallback(async () => {
    if (confirmModal.row?._id) {
      await handleDelete(confirmModal.row._id);
      setConfirmModal({ isOpen: false, row: null });
    }
  }, [confirmModal.row, handleDelete]);

  const columns = useMemo(
    () => [
      {
        header: "Name",
        field: "name",
        sortable: true,
        render: (row) => (
          <span className="font-medium text-gray-900 dark:text-white">{row.name || ""}</span>
        ),
      },
      {
        header: "Description",
        field: "description",
        sortable: false,
        render: (row) => (
          <span className="text-gray-700 dark:text-gray-300">{row.description || "-"}</span>
        ),
      },
      {
        header: "Status",
        field: "isActive",
        sortable: true,
        render: (row) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
              row.isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700"
            }`}
          >
            {row.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        header: "Actions",
        field: "actions",
        render: (row) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(row)}
              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
              aria-label="Edit"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setConfirmModal({ isOpen: true, row })}
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [handleEdit]
  );

  const responseAdapter = useCallback((json) => {
    console.log('📦 API Response:', json);
    // Handle different response structures
    const rows = json?.data?.sampleTypes || json?.data?.data || json?.sampleTypes || json?.items || json?.data || [];
    const total = json?.data?.total || json?.total || rows.length || 0;
    console.log('✅ Parsed rows:', rows.length, 'Total:', total);
    return { rows, total };
  }, []);

  const handleFormSubmit = useCallback(() => {
    setDialogState({ type: null, isOpen: false });
    setSelectedRow(null);
    handleRefresh();
  }, [handleRefresh]);

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sample Types</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage blood sample types and their details
          </p>
        </div>
      </div>

      {/* Dialog */}
      <Dialog
        open={dialogState.isOpen}
        onOpenChange={(open) => {
          setDialogState({ type: dialogState.type, isOpen: open });
          if (!open) setSelectedRow(null);
        }}
      >
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white text-xl">
              {dialogState.type === "edit" ? "Edit Sample Type" : "Add New Sample Type"}
            </DialogTitle>
          </DialogHeader>
          <SampleTypeForm 
            isEdit={dialogState.type === "edit"} 
            selected={selectedRow} 
            onSubmit={handleFormSubmit} 
          />
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <AgDemo2
          ref={tableRef}
          fetchDataUrl={baseURL + "sample-types"}
          columns={columns}
          pagination={{ pageSize: 10 }}
          onRowClick={() => {}}
          enableRowSelection={true}
          title="Sample Types List"
          onAddNewRecord={() => setDialogState({ type: "add", isOpen: true })}
          responseAdapter={responseAdapter}
        />
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, row: null })}
        onConfirm={onConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${confirmModal.row?.name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
