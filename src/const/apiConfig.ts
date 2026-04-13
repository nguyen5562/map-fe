export const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "Missing environment variable: VITE_API_URL. Please check your .env file.",
  );
}

export const API_ROUTES = {
  MAP: "/map",
};
