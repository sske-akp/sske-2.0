/** Auth & multi-company types (mirror the Phase 3 backend /auth/* contract). */

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
}

export interface Company {
  id: string;
  name: string;
  schema_name: string;
  gstin: string | null;
  state_code: string | null;
  role: string | null;
}

export interface AuthContextShape {
  token: string | null;
  user: User | null;
  companies: Company[];
  companyId: string | null;
  /** Derived: the company matching `companyId`, or null. */
  selectedCompany: Company | null;
  isAuthenticated: boolean;
  /** True once hydrated from localStorage — gates SSR/first-render flashes. */
  isReady: boolean;
  login: (email: string, password: string) => Promise<{ companies: Company[] }>;
  logout: () => void;
  selectCompany: (id: string) => void;
  refreshCompanies: () => Promise<void>;
}
