import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
});


let interceptorId: number | null = null;
export function setAuthToken(token?: string) {
  if (interceptorId !== null) {
    http.interceptors.request.eject(interceptorId);
    interceptorId = null;
  }
  interceptorId = http.interceptors.request.use((cfg) => {
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });
}
