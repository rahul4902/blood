import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const baseURL = "http://localhost:5000/api/";
export const backendURL = "http://localhost:5000";

export const getToken = async () => {
  const auth = await Cookies.get("auth");
  if (!auth) {
    return null;
  }
  const authData = JSON.parse(auth);
  console.log(authData);
  console.log(authData?.token);
  return authData?.token.replace(/"/g, "") || null;
};

export const getStatusColor = (status: any) => {
  switch (status) {
    case "Active":
      return "bg-green-500";
    case "Inactive":
      return "bg-red-500";
    case "Draft":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

export function toggleTheme() {
  const html = document.documentElement;
  if (html.classList.contains("dark")) {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
}
