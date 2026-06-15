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
  FEEDBACK: "/feedback",
};
