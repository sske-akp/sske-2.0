"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import * as authStore from "@/lib/authStore";
import { getCompanies, getMe, login as loginRequest } from "@/lib/apiClient";
import type { AuthContextShape, Company, User } from "@/types/auth";

export const AuthContext = createContext<AuthContextShape | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [token, setTokenState] = useState<string | null>(null);
  const [companyId, setCompanyIdState] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Keep router accessible to the (stable) 401 handler without re-registering.
  const routerRef = useRef(router);
  routerRef.current = router;

  // Register the 401 handler once: clear cache + bounce to /login.
  useEffect(() => {
    authStore.setOnUnauthorized(() => {
      setTokenState(null);
      setCompanyIdState(null);
      setUser(null);
      setCompanies([]);
      queryClient.clear();
      routerRef.current.replace("/login");
    });
    return () => authStore.setOnUnauthorized(null);
  }, [queryClient]);

  // Hydrate from localStorage on mount; repopulate user + companies if a token
  // survived a reload.
  useEffect(() => {
    const storedToken = authStore.getToken();
    const storedCompanyId = authStore.getCompanyId();
    setTokenState(storedToken);
    setCompanyIdState(storedCompanyId);

    if (storedToken) {
      Promise.all([getMe(), getCompanies()])
        .then(([me, list]) => {
          setUser(me);
          setCompanies(list);
        })
        .catch(() => {
          /* 401 handler clears state + redirects; nothing to do here. */
        })
        .finally(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCompany = useCallback(
    (id: string) => {
      authStore.setCompanyId(id);
      setCompanyIdState(id);
      // Hard tenant isolation: drop the previous company's cached rows, then
      // refetch active queries under the new schema.
      queryClient.clear();
      queryClient.invalidateQueries();
    },
    [queryClient],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const { access_token } = await loginRequest(email, password);
      // Write synchronously so the immediate getCompanies()/getMe() calls carry
      // the token (apiFetch reads authStore, not async React state).
      authStore.setToken(access_token);
      setTokenState(access_token);

      const [me, list] = await Promise.all([getMe(), getCompanies()]);
      setUser(me);
      setCompanies(list);

      if (list.length === 1) {
        selectCompany(list[0].id);
      }
      return { companies: list };
    },
    [selectCompany],
  );

  const logout = useCallback(() => {
    authStore.clear();
    setTokenState(null);
    setCompanyIdState(null);
    setUser(null);
    setCompanies([]);
    queryClient.clear();
    router.replace("/login");
  }, [queryClient, router]);

  const refreshCompanies = useCallback(async () => {
    const list = await getCompanies();
    setCompanies(list);
  }, []);

  const value = useMemo<AuthContextShape>(() => {
    const selectedCompany = companies.find((c) => c.id === companyId) ?? null;
    return {
      token,
      user,
      companies,
      companyId,
      selectedCompany,
      isAuthenticated: !!token,
      isReady,
      login,
      logout,
      selectCompany,
      refreshCompanies,
    };
  }, [token, user, companies, companyId, isReady, login, logout, selectCompany, refreshCompanies]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
