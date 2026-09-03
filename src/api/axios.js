import axios from "axios";

// storage keys shared with the interceptors so they can read/clear the
// session without importing React state
export const TOKEN_KEY = "smapp_token";
export const USER_KEY = "smapp_user";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3322",
});

// attach the jwt to every request when we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// a 401 on an authed call means the token is dead: drop the session and fall
// back to the login gate; login/signup 401s are left for their forms to show
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const isAuthEndpoint =
      url.includes("/users/login") || url.includes("/users/signup");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export default api;
