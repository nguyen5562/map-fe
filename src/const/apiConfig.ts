export const BASE_URL = import.meta.env.VITE_BASE_URL;

if (!BASE_URL) {
  throw new Error(
    "Missing environment variable: VITE_BASE_URL. Please check your .env file.",
  );
}

export const API_URL = BASE_URL + "/api";

export const API_ROUTES = {
  MAP: "/map",
  AUTH: "/auth",
  USERS: "/users",
  DOCUMENTS: "/documents",
  VEHICLES: "/vehicles",
};

export const resolveBackendUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${BASE_URL}${cleanPath}`;
};
