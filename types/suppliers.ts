// Backend API response (snake_case)
export interface SupplierAPI {
  id: string;
  name: string;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// UI shape (camelCase)
export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gst: string;
}

// Form data for creating a supplier
export interface SupplierFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  gst: string;
}
