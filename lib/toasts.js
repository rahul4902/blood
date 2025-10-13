// toast.js
import toast from "react-hot-toast";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const ToastLayout = ({ icon, message, theme = "dark" }) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-md animate-fade-in ${
        isDark ? "bg-[#1E1E1E] text-white" : "bg-white text-black"
      }`}
    >
      <div className="text-xl">{icon}</div>
      <span className="text-sm">{message}</span>
    </div>
  );
};

export const showSuccessToast = (msg, theme = "dark") =>
  toast.custom(() => (
    <ToastLayout
      icon={<CheckCircle className="text-green-400" size={20} />}
      message={msg}
      theme={theme}
    />
  ));

export const showWarningToast = (msg, theme = "dark") =>
  toast.custom(() => (
    <ToastLayout
      icon={<AlertTriangle className="text-yellow-400" size={20} />}
      message={msg}
      theme={theme}
    />
  ));

export const showErrorToast = (msg, theme = "dark") =>
  toast.custom(() => (
    <ToastLayout
      icon={<XCircle className="text-red-500" size={20} />}
      message={msg}
      theme={theme}
    />
  ));
