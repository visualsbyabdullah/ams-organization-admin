"use client";

import { useState } from "react";

import { INVOICE_REFERENCE_DATE } from "@/config/invoices";
import { INVOICES } from "@/data/invoices";
import { resolveInvoiceStatus } from "@/lib/invoices";
import type { Invoice, InvoicePaymentValues, InvoiceStatus } from "@/types/invoice";

export function useInvoiceRecords() {
  const [invoices, setInvoices] = useState<Invoice[]>(
    INVOICES.map((invoice) => ({
      ...invoice,
      status: resolveInvoiceStatus(invoice, INVOICE_REFERENCE_DATE),
    })),
  );

  function saveInvoice(invoice: Invoice) {
    setInvoices((currentInvoices) => {
      const exists = currentInvoices.some((item) => item.id === invoice.id);

      return exists
        ? currentInvoices.map((item) => (item.id === invoice.id ? invoice : item))
        : [invoice, ...currentInvoices];
    });
  }

  function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    setInvoices((currentInvoices) =>
      currentInvoices.map((invoice) =>
        invoice.id === invoiceId
          ? {
              ...invoice,
              status,
              paidAmount: status === "paid" ? invoice.totalAmount : invoice.paidAmount,
              balanceAmount: status === "paid" ? 0 : invoice.balanceAmount,
            }
          : invoice,
      ),
    );
  }

  function recordInvoicePayment(invoiceId: string, values: InvoicePaymentValues) {
    setInvoices((currentInvoices) =>
      currentInvoices.map((invoice) => {
        if (invoice.id !== invoiceId) {
          return invoice;
        }

        const paidAmount = Math.min(
          invoice.paidAmount + values.amount,
          invoice.totalAmount,
        );

        const balanceAmount = Math.max(invoice.totalAmount - paidAmount, 0);

        return {
          ...invoice,
          paidAmount,
          balanceAmount,
          status: balanceAmount === 0 ? "paid" : "partially_paid",
          paymentMethod: values.paymentMethod,
          paymentReference: values.paymentReference,
          paidAt: values.paymentDate,
        };
      }),
    );
  }

  function duplicateInvoice(invoice: Invoice) {
    const duplicate: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      invoiceNumber: `${invoice.invoiceNumber}-COPY`,
      status: "draft",
      paidAmount: 0,
      balanceAmount: invoice.totalAmount,
      paymentMethod: undefined,
      paymentReference: undefined,
      paidAt: undefined,
    };

    setInvoices((currentInvoices) => [duplicate, ...currentInvoices]);

    return duplicate;
  }

  return {
    invoices,
    saveInvoice,
    updateInvoiceStatus,
    recordInvoicePayment,
    duplicateInvoice,
  };
}
