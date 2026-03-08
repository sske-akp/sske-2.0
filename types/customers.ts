// Backend API response shape
export interface CustomerAPI {
  id: string;
  name: string | null;
  address: string | null;
  gstin: string | null;
  phone_number: string | null;
  email: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Frontend UI shape (used by DataTable and forms)
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  gst: string;
  address: string;
  notes: string;
}

// Form data shape for creating a customer
export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  gst: string;
  address: string;
  notes: string;
}
