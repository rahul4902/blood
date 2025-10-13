"use client";

import { Check } from "lucide-react";

export const CustomCheckbox = ({
  checked,
  onChange,
  id,
  className = "",
  disabled = false,
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Hidden native checkbox */}
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />

      {/* Custom styled checkbox */}
      <label
        htmlFor={id}
        className={`
          flex items-center justify-center w-5 h-5 rounded border-2 transition-colors duration-200
          ${
            checked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {checked && (
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        )}
      </label>
    </div>
  );
};
