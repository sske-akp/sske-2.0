import { Supplier, SupplierAPI, SupplierFormData } from "@/types/suppliers";
import { apiFetch } from "@/lib/apiClient";

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
  const data = await apiFetch<SupplierAPI[]>("/suppliers/");
  return data.map(mapAPIToSupplier);
}

export async function createSupplier(form: SupplierFormData): Promise<Supplier> {
  const data = await apiFetch<SupplierAPI>("/suppliers/", {
    method: "POST",
    json: mapFormToAPI(form),
  });
  return mapAPIToSupplier(data);
}

export async function updateSupplier(id: string, form: SupplierFormData): Promise<Supplier> {
  const data = await apiFetch<SupplierAPI>(`/suppliers/${id}`, {
    method: "PUT",
    json: mapFormToAPI(form),
  });
  return mapAPIToSupplier(data);
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiFetch<void>(`/suppliers/${id}`, { method: "DELETE", parse: "none" });
}
