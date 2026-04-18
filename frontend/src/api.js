import axios from "axios";
import { useAuthStore } from "./store/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3001",
});

api.interceptors.request.use((config) => {  //每一个 api.get / api.post 发出前，都会先进这里
  const auth = useAuthStore();
  if (auth.token) config.headers.Authorization = `Bearer ${auth.token}`;
  return config;
});
