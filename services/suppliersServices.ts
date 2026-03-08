import { Supplier, SupplierAPI, SupplierFormData } from "@/types/suppliers";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

function mapAPIToSupplier(api: SupplierAPI): Supplier {
  return {
    id: api.id,
    name: api.name ?? "",
    phone: api.phone_number ?? "",
    email: api.email ?? "",
    address: api.address ?? "",
    gst: api.gstin ?? "",
  };
}

function mapFormToAPI(form: SupplierFormData) {
  return {
    name: form.name || null,
    phone_number: form.phone || null,
    email: form.email || null,
    address: form.address || null,
    gstin: form.gst || null,
  };
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  const response = await fetch(`${baseUrl}/suppliers/`);
  if (!response.ok) {
    throw new Error("Failed to fetch suppliers");
  }
  const data: SupplierAPI[] = await response.json();
  return data.map(mapAPIToSupplier);
}

export async function createSupplier(form: SupplierFormData): Promise<Supplier> {
  const response = await fetch(`${baseUrl}/suppliers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapFormToAPI(form)),
  });
  if (!response.ok) {
    throw new Error("Failed to create supplier");
  }
  const data: SupplierAPI = await response.json();
  return mapAPIToSupplier(data);
}

export async function updateSupplier(id: string, form: SupplierFormData): Promise<Supplier> {
  const response = await fetch(`${baseUrl}/suppliers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapFormToAPI(form)),
  });
  if (!response.ok) {
    throw new Error("Failed to update supplier");
  }
  const data: SupplierAPI = await response.json();
  return mapAPIToSupplier(data);
}

export async function deleteSupplier(id: string): Promise<void> {
  const response = await fetch(`${baseUrl}/suppliers/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete supplier");
  }
}
