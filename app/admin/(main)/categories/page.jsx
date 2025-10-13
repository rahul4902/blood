"use client";

import { useCallback, useEffect, useRef, useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import AgDemo2 from "../../../../components/AgDemo2";
import ConfirmModal from "@/components/ConfirmModal";
import { backendURL, baseURL } from "@/lib/utils";
import { showSuccessToast, showErrorToast } from "@/lib/toasts";

// Constants
const FALLBACK_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Utility function for status badge colors
const getStatusColor = (status) =>
  status
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700"
    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700";

// Custom validation function
const validateFormData = (formData) => {
  const errors = {};
  if (!formData.name || formData.name.trim() === "") {
    errors.name = "Category name is required";
  }
  return errors;
};



export default function CategoriesManagement() {
  const tableRef = useRef(null);
  const [dialogState, setDialogState] = useState({
    type: null, // 'add' | 'edit' | null
    isOpen: false,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    row: null,
  });
  const [categoriesDropdownList, setCategoriesDropdownList] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Fetch categories for dropdown
  const fetchCategories = useCallback(async () => {
    try {
      setCategoryLoading(true);
      const response = await axios.get(
        `${baseURL}categories?all=1&populateParent=1`
      );
      if (response?.data?.status === "success") {
        setCategoriesDropdownList(response?.data?.data?.categories || []);
      }
    } catch (error) {
      showErrorToast(
        error?.response?.data?.message || "Failed to fetch categories."
      );
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  // Refresh table
  const handleRefresh = useCallback(() => {
    if (tableRef.current) {
      tableRef.current.refresh();
    }
  }, []);

  // Handle edit button click
  const handleEdit = useCallback((row) => {
    setSelectedCategory(row);
    setDialogState({ type: "edit", isOpen: true });
  }, []);

  // Handle delete
  const handleDelete = useCallback(
    async (id) => {
      try {
        const response = await axios.delete(`${baseURL}categories/${id}`);
        showSuccessToast(response.data?.message);
        handleRefresh();
      } catch (error) {
        showErrorToast(
          error.response?.data?.message || "Failed to delete category."
        );
      }
    },
    [handleRefresh]
  );

  // Confirm delete
  const onConfirmDelete = useCallback(async () => {
    if (confirmModal.row) {
      await handleDelete(confirmModal.row._id);
      setConfirmModal({ isOpen: false, row: null });
    }
  }, [confirmModal.row, handleDelete]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Table columns
  const columns = [
    {
      header: "Name",
      field: "name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <img
            src={row.icon ? `${backendURL}${row.icon}` : FALLBACK_IMAGE}
            alt={row.name || "Category Icon"}
            className="h-5 w-5 object-cover rounded-full border-2 border-solid border-gray-200 dark:border-gray-700"
            onError={(e) => {
              e.target.src = FALLBACK_IMAGE;
              e.target.onerror = null;
            }}
          />
          <span className="text-gray-900 dark:text-white">{row.name || ""}</span>
        </div>
      ),
    },
    {
      header: "Parent",
      field: "parent.name",
      sortable: false,
      render: (row) => (
        <span className="text-gray-900 dark:text-white">{row.parent?.name || "Primary"}</span>
      ),
    },
    {
      header: "Status",
      field: "status",
      sortable: true,
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(
            row.status
          )}`}
        >
          {row.status ? "Active" : "Inactive"}
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
            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white rounded"
            aria-label="Edit category"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setConfirmModal({ isOpen: true, row })}
            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded"
            aria-label="Delete category"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  // stable response adapter to avoid re-renders causing refetch
  const responseAdapter = useCallback((json) => {
    const rows = json?.data?.categories || json?.data?.data || json?.items || json?.data || []
    const total = json?.data?.total || json?.total || rows.length || 0
    return { rows, total }
  }, [])

  // Reusable form component, memoized to prevent unnecessary re-renders
  const CategoryForm = memo(({ isEdit = false, selectedCategory, onSubmit }) => {
    const inputRef = useRef(null);
    const [formData, setFormData] = useState({
      name: isEdit ? selectedCategory?.name || "" : "",
      icon: null,
      parent: isEdit ? selectedCategory?.parent?._id?.toString() || null : null,
      status: isEdit ? (selectedCategory?.status ? "1" : "0") : "1",
      description: isEdit ? selectedCategory?.description || "" : "",
    });
    const [errors, setErrors] = useState({});
    const [fileError, setFileError] = useState("");
    const [previewUrl, setPreviewUrl] = useState(
      isEdit && selectedCategory?.icon ? `${backendURL}${selectedCategory.icon}` : null
    );
    const [showPreview, setShowPreview] = useState(isEdit && !!selectedCategory?.icon);
    const [isLoading, setIsLoading] = useState(false);

    // Reset form state
    const resetForm = useCallback(() => {
      setFormData({
        name: isEdit ? selectedCategory?.name || "" : "",
        icon: null,
        parent: isEdit ? selectedCategory?.parent?._id?.toString() || null : null,
        status: isEdit ? (selectedCategory?.status ? "1" : "0") : "1",
        description: isEdit ? selectedCategory?.description || "" : "",
      });
      setPreviewUrl(isEdit && selectedCategory?.icon ? `${backendURL}${selectedCategory.icon}` : null);
      setShowPreview(isEdit && !!selectedCategory?.icon);
      setErrors({});
      setFileError("");
    }, [isEdit, selectedCategory]);

    // Handle file input change with validation
    const handleFileChange = useCallback((e) => {
      const file = e.target.files?.[0];
      if (!file) {
        setFormData((prev) => ({ ...prev, icon: null }));
        setPreviewUrl(null);
        setShowPreview(false);
        setFileError("");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setFileError("File size exceeds 5MB limit");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setFileError("Please upload an image file");
        return;
      }

      setFormData((prev) => ({ ...prev, icon: file }));
      setPreviewUrl(URL.createObjectURL(file));
      setShowPreview(true);
      setFileError("");
    }, []);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
      const validationErrors = validateFormData(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      setErrors({});

      try {
        setIsLoading(true);
        const formDataRaw = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataRaw.append(key, key === "icon" ? formData.icon : value);
          }
        });

        const url = isEdit
          ? `${baseURL}categories/${selectedCategory?._id}`
          : `${baseURL}categories`;
        const method = isEdit ? axios.put : axios.post;

        const response = await method(url, formDataRaw);

        if (response?.data?.status === "success") {
          showSuccessToast(response.data?.message);
          onSubmit(); // Notify parent to close dialog and refresh
        }
      } catch (error) {
        const serverErrors = error.response?.data?.error?.details?.errors || {};
        setErrors(serverErrors);
        showErrorToast(error.response?.data?.message || "Operation failed.");
      } finally {
        setIsLoading(false);
      }
    }, [formData, isEdit, selectedCategory, onSubmit]);

    // Ensure input retains focus after state updates
    useEffect(() => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        inputRef.current.focus();
      }
    }, [formData.name]);

    // Debug re-renders (optional, can be removed in production)
    // useEffect(() => {
    //   console.log("CategoryForm re-rendered");
    // });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoryName" className="text-gray-900 dark:text-white">
              Category Name *
            </Label>
            <Input
              ref={inputRef}
              id="categoryName"
              value={formData.name}
              onChange={(e) => {
                e.preventDefault();
                setFormData((prev) => ({ ...prev, name: e.target.value }));
              }}
              placeholder="Enter category name"
              className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 ${errors.name ? "border-red-500" : ""}`}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="categoryIcon" className="text-gray-900 dark:text-white">
              Icon Upload
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="categoryIcon"
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
                accept="image/*"
              />
              {previewUrl && (
                <ImageIcon
                  className="w-4 h-4 cursor-pointer text-gray-500 dark:text-gray-400"
                  onClick={() => setShowPreview(!showPreview)}
                  aria-label="Toggle image preview"
                />
              )}
            </div>
            {fileError && (
              <p className="text-red-500 text-sm mt-1">{fileError}</p>
            )}
            {errors.icon && (
              <p className="text-red-500 text-sm mt-1">{errors.icon}</p>
            )}
          </div>
          <div>
            <Label htmlFor="parentCategory" className="text-gray-900 dark:text-white">
              Parent Category
            </Label>
            <Select
              value={formData.parent}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, parent: value }))
              }
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Select parent (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
                {categoryLoading ? (
                  <div className="flex justify-center py-2">
                    <Loader
                      className="animate-spin text-gray-500 dark:text-gray-400"
                      size={18}
                    />
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      Loading...
                    </span>
                  </div>
                ) : (
                  <>
                    <SelectItem value={null}>None (Main Category)</SelectItem>
                    {categoriesDropdownList
                      ?.filter(
                        (category) => category._id !== selectedCategory?._id
                      )
                      .map((category) => (
                        <SelectItem
                          key={category._id}
                          value={category._id.toString()}
                        >
                          <div className="flex items-center gap-2">
                            {category.icon ? (
                              <Image
                                src={`${backendURL}${category.icon}`}
                                width={25}
                                height={25}
                                alt={category.name}
                                className="h-5 min-h-[20px] min-w-[25px]"
                              />
                            ) : (
                              <span className="w-[30px] h-[30px] inline-block" />
                            )}
                            <span className="text-gray-900 dark:text-white">{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="categoryStatus" className="text-gray-900 dark:text-white">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
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
        <div>
          <Label htmlFor="categoryDescription" className="text-gray-900 dark:text-white">
            Description
          </Label>
          <Textarea
            id="categoryDescription"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Enter category description"
            rows={3}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>
        {previewUrl && showPreview && (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-40 mt-2 rounded-xl border border-gray-200 dark:border-gray-700 p-2"
          />
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              resetForm();
              onSubmit(); // Close dialog
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : isEdit ? (
              "Update Category"
            ) : (
              "Add Category"
            )}
          </Button>
        </div>
      </div>
    );
  });

  CategoryForm.displayName = "CategoryForm";

  // Handle form submission callback
  const handleFormSubmit = useCallback(() => {
    setDialogState({ type: null, isOpen: false });
    fetchCategories();
    handleRefresh();
  }, [fetchCategories, handleRefresh]);

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900">
      <Dialog
        open={dialogState.isOpen}
        onOpenChange={(open) => {
          setDialogState({ type: dialogState.type, isOpen: open });
        }}
      >
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {dialogState.type === "edit"
                ? "Edit Category"
                : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            isEdit={dialogState.type === "edit"}
            selectedCategory={selectedCategory}
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>

      <AgDemo2
        ref={tableRef}
        fetchDataUrl={`${baseURL}categories`}
        columns={columns}
        pagination={{ pageSize: 10 }}
        onRowClick={() => { }}
        enableRowSelection={true}
        title="Categories List"
        onAddNewRecord={() => setDialogState({ type: "add", isOpen: true })}
        responseAdapter={responseAdapter}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, row: null })}
        onConfirm={onConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this category?"
        confirmButtonText="Delete"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}