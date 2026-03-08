import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvoices,
  fetchInvoiceDetail,
  createInvoice,
  deleteInvoice,
  createCreditNote,
  recordPayment,
} from "@/services/invoicesServices";
import { InvoiceAPI, Invoice, InvoiceDetail, InvoiceFormData, CreditNoteFormData, PaymentFormData } from "@/types/invoices";

export function useInvoices() {
  return useQuery<Invoice[], Error>({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
  });
}

export function useInvoiceDetail(id: string) {
  return useQuery<InvoiceDetail, Error>({
    queryKey: ["invoice", id],
    queryFn: () => fetchInvoiceDetail(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation<Invoice, Error, InvoiceFormData>({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useCreateCreditNote() {
  const queryClient = useQueryClient();
  return useMutation<InvoiceAPI, Error, CreditNoteFormData>({
    mutationFn: createCreditNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, PaymentFormData>({
    mutationFn: recordPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
