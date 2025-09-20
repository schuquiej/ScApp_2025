import axios from 'axios';

export const http = axios.create({
  baseURL: '/api', 
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
