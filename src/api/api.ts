import axios from "axios";
import { getToken } from "../auth/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // browser-safe
})

// export const render_api = axios.create({
//   baseURL: process.env.RENDER_API_URL,
// });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
