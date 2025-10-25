import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

type Role = "ADMIN" | "COORD" | "PROMOTOR";
type Decoded = { sub?: string; roles?: Role[]; exp?: number };
type AuthState = { token?: string; user?: string; roles?: Role[] };

type CtxType = {
  auth: AuthState;
  login: (t: string) => void;
  logout: () => void;
};

const AuthCtx = createContext<CtxType>({
  auth: {},
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthCtx);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | undefined>(
    () => localStorage.getItem("access_token") || undefined
  );

  const auth = useMemo<AuthState>(() => {
    if (!token) return {};
    try {
      if (!token.includes(".")) return { token, user: "user", roles: [] };

      const dec = jwtDecode<Decoded>(token);
      console.log(dec);

      if (dec.exp && Date.now() / 1000 > dec.exp) {
        console.warn("Token expirado");
        localStorage.removeItem("access_token");
        return {};
      }

      return {
        token,
        user: dec.sub ?? "user",
        roles: dec.roles ?? [],
      };
    } catch {
      console.warn("Token inválido al decodificar");
      return {};
    }
  }, [token]);

  const login = (t: string) => {
    localStorage.setItem("access_token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(undefined);
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "access_token") setToken(e.newValue ?? undefined);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthCtx.Provider value={{ auth, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
