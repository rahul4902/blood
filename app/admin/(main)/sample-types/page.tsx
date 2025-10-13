"use client";

import { useCallback, useMemo, useRef, useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit2, Trash2, Loader } from "lucide-react";
import axios from "axios";
import AgDemo2 from "@/components/AgDemo2";
import ConfirmModal from "@/components/ConfirmModal";
import { baseURL } from "@/lib/utils";
import { showSuccessToast, showErrorToast } from "@/lib/toasts";

type SampleType = {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
};

const validateFormData = (formData: { name: string; description?: string; isActive: string }) => {
  const errors: Record<string, string> = {};
  if (!formData.name || formData.name.trim() === "") {
    errors.name = "Name is required";
  }
  return errors;
};

export default function SampleTypesManagement() {
  const tableRef = useRef<any>(null);
  const AgDemo2Any = AgDemo2 as unknown as React.ComponentType<any>
  const [dialogState, setDialogState] = useState<{ type: null | "add" | "edit"; isOpen: boolean }>({ type: null, isOpen: false });
  const [selectedRow, setSelectedRow] = useState<SampleType | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; row: SampleType | null }>({ isOpen: false, row: null });

  const handleRefresh = useCallback(() => {
    if (tableRef.current) {
      tableRef.current.refresh();
    }
  }, []);

  const handleEdit = useCallback((row: SampleType) => {
    setSelectedRow(row);
    setDialogState({ type: "edit", isOpen: true });
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const response = await axios.delete(`${baseURL}sample-types/${id}`);
        showSuccessToast(response?.data?.message || "Deleted successfully");
        handleRefresh();
      } catch (error: any) {
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
        render: (row: SampleType) => <span className="text-gray-900 dark:text-white">{row.name || ""}</span>,
      },
      {
        header: "Description",
        field: "description",
        sortable: false,
        render: (row: SampleType) => (
          <span className="text-gray-700 dark:text-gray-300">{row.description || "-"}</span>
        ),
      },
      {
        header: "Status",
        field: "isActive",
        sortable: true,
        render: (row: SampleType) => (
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
        render: (row: SampleType) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(row)}
              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white rounded"
              aria-label="Edit"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => setConfirmModal({ isOpen: true, row })}
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ),
      },
    ],
    [handleEdit]
  );

  const responseAdapter = useCallback((json: any) => {
    // sample-types may come as { data: [...] }
    const rows = json?.data?.sampleTypes || json?.data?.data || json?.items || json?.data || []
    const total = json?.data?.total || json?.total || rows.length || 0
    return { rows, total }
  }, [])

  const SampleTypeForm = memo(function SampleTypeForm({ isEdit = false, selected, onSubmit }: { isEdit?: boolean; selected: SampleType | null; onSubmit: () => void }) {
    const inputRef = useRef<any>(null);
    const [formData, setFormData] = useState<{ name: string; description?: string; isActive: string }>(
      isEdit
        ? {
            name: selected?.name || "",
            description: selected?.description || "",
            isActive: selected?.isActive ? "1" : "0",
          }
        : { name: "", description: "", isActive: "1" }
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
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
        const payload = {
          name: formData.name,
          description: formData.description || undefined,
          isActive: formData.isActive === "1",
        } as const;

        const url = isEdit ? `${baseURL}sample-types/${selected?._id}` : `${baseURL}sample-types`;
        const method = isEdit ? axios.put : axios.post;
        const response = await method(url, payload);
        if (response?.data?.status === "success" || response?.status < 300) {
          showSuccessToast(response?.data?.message || (isEdit ? "Updated" : "Created"));
          onSubmit();
        }
      } catch (error: any) {
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
              placeholder="Enter name"
              className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 ${errors.name ? "border-red-500" : ""}`}
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
              placeholder="Enter description"
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

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={onSubmit}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? <Loader className="animate-spin" /> : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    );
  });

  const handleFormSubmit = useCallback(() => {
    setDialogState({ type: null, isOpen: false });
    handleRefresh();
  }, [handleRefresh]);

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900">
      <Dialog
        open={dialogState.isOpen}
        onOpenChange={(open) => setDialogState({ type: dialogState.type, isOpen: open })}
      >
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {dialogState.type === "edit" ? "Edit Sample Type" : "Add New Sample Type"}
            </DialogTitle>
          </DialogHeader>
          <SampleTypeForm isEdit={dialogState.type === "edit"} selected={selectedRow} onSubmit={handleFormSubmit} />
        </DialogContent>
      </Dialog>

      {/* @ts-ignore */}
      <AgDemo2Any
        ref={tableRef}
        fetchDataUrl={`${baseURL}sample-types`}
        columns={columns}
        pagination={{ pageSize: 10 }}
        onRowClick={() => {}}
        enableRowSelection={true}
        title="Sample Types List"
        onAddNewRecord={() => setDialogState({ type: "add", isOpen: true })}
        responseAdapter={responseAdapter}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, row: null })}
        onConfirm={onConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this sample type?"
        confirmButtonText="Delete"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
