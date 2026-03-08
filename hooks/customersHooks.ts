import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  fetchCustomerById,
  fetchCustomerInvoices,
  CustomerInvoice,
} from "@/services/customersServices";
import { fetchCustomerPayments } from "@/services/paymentsServices";
import { Customer, CustomerFormData } from "@/types/customers";
import { Payment } from "@/types/payments";

export function useCustomers() {
  return useQuery<Customer[], Error>({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation<Customer, Error, CustomerFormData>({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation<Customer, Error, { id: string; data: CustomerFormData }>({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useCustomer(id: string) {
  return useQuery<Customer, Error>({
    queryKey: ["customer", id],
    queryFn: () => fetchCustomerById(id),
    enabled: !!id,
  });
}

export function useCustomerInvoices(customerId: string) {
  return useQuery<CustomerInvoice[], Error>({
    queryKey: ["customerInvoices", customerId],
    queryFn: () => fetchCustomerInvoices(customerId),
    enabled: !!customerId,
  });
}

export function useCustomerPayments(customerId: string) {
  return useQuery<Payment[], Error>({
    queryKey: ["customerPayments", customerId],
    queryFn: () => fetchCustomerPayments(customerId),
    enabled: !!customerId,
  });
}
