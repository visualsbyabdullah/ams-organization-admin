"use client";

import { type FormEvent, useState } from "react";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { INVOICE_SETTINGS_STATUS_CONFIG } from "@/config/invoices";
import { BRANCH_OPTIONS } from "@/data/branches";
import { CURRENT_ADMIN } from "@/data/current-admin";
import type {
  InvoiceSettings,
  InvoiceSettingsScope,
  InvoiceSettingsStatus,
} from "@/types/invoice";

type InvoiceSettingsFormProps = {
  settings?: InvoiceSettings;
  selectedBranchId: string;
  onCancel: () => void;
  onSave: (settings: InvoiceSettings) => void;
};

const BUSINESS_BRANCHES = BRANCH_OPTIONS.filter((branch) => !branch.isAggregate);

export function InvoiceSettingsForm({
  settings,
  selectedBranchId,
  onCancel,
  onSave,
}: InvoiceSettingsFormProps) {
  const [name, setName] = useState(settings?.name ?? "");

  const [scope, setScope] = useState<InvoiceSettingsScope>(
    settings?.scope ?? "organization",
  );

  const [branchId, setBranchId] = useState(
    settings?.branchId ?? (selectedBranchId === "all" ? "" : selectedBranchId),
  );

  const [status, setStatus] = useState<InvoiceSettingsStatus>(
    settings?.status ?? "draft",
  );

  const [invoicePrefix, setInvoicePrefix] = useState(settings?.invoicePrefix ?? "AMS");

  const [nextSequence, setNextSequence] = useState(String(settings?.nextSequence ?? 1));

  const [paymentTermDays, setPaymentTermDays] = useState(
    String(settings?.paymentTermDays ?? 15),
  );

  const [defaultTaxRate, setDefaultTaxRate] = useState(
    String(settings?.defaultTaxRate ?? 15),
  );

  const [allowPartialPayments, setAllowPartialPayments] = useState(
    settings?.allowPartialPayments ?? true,
  );

  const [autoSendInvoices, setAutoSendInvoices] = useState(
    settings?.autoSendInvoices ?? false,
  );

  const [autoMarkOverdue, setAutoMarkOverdue] = useState(
    settings?.autoMarkOverdue ?? true,
  );

  const [sendDueReminders, setSendDueReminders] = useState(
    settings?.sendDueReminders ?? true,
  );

  const [reminderDaysBeforeDue, setReminderDaysBeforeDue] = useState(
    String(settings?.reminderDaysBeforeDue ?? 3),
  );

  const [overdueReminderIntervalDays, setOverdueReminderIntervalDays] = useState(
    String(settings?.overdueReminderIntervalDays ?? 7),
  );

  const [defaultNote, setDefaultNote] = useState(settings?.defaultNote ?? "");

  const [submitted, setSubmitted] = useState(false);

  const isValid = Boolean(
    name.trim() &&
    (scope === "organization" || branchId) &&
    invoicePrefix.trim() &&
    Number(nextSequence) > 0 &&
    Number(paymentTermDays) >= 0 &&
    Number(defaultTaxRate) >= 0,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid) {
      return;
    }

    const branch = BUSINESS_BRANCHES.find((item) => item.id === branchId);

    onSave({
      id: settings?.id ?? crypto.randomUUID(),
      name: name.trim(),
      scope,
      branchId: scope === "branch" ? branchId : undefined,
      branchName: scope === "branch" ? branch?.name : undefined,
      status,
      invoicePrefix: invoicePrefix.trim().toUpperCase(),
      nextSequence: Math.max(Number(nextSequence) || 1, 1),
      paymentTermDays: Math.max(Number(paymentTermDays) || 0, 0),
      defaultTaxRate: Math.max(Number(defaultTaxRate) || 0, 0),
      allowPartialPayments,
      autoSendInvoices,
      autoMarkOverdue,
      sendDueReminders,
      reminderDaysBeforeDue: Math.max(Number(reminderDaysBeforeDue) || 0, 0),
      overdueReminderIntervalDays: Math.max(Number(overdueReminderIntervalDays) || 1, 1),
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN.name,
      defaultNote: defaultNote.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <section className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Settings name"
          htmlFor="invoiceSettingsName"
          error={submitted && !name.trim() ? "Enter a settings name" : undefined}
        >
          <Input
            id="invoiceSettingsName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Organization Billing Defaults"
          />
        </FormField>

        <FormField label="Status" htmlFor="invoiceSettingsStatus">
          <Select
            id="invoiceSettingsStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as InvoiceSettingsStatus)}
          >
            {Object.entries(INVOICE_SETTINGS_STATUS_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Settings scope" htmlFor="invoiceSettingsScope">
          <Select
            id="invoiceSettingsScope"
            value={scope}
            onChange={(event) => setScope(event.target.value as InvoiceSettingsScope)}
          >
            <option value="organization">Organization default</option>

            <option value="branch">Branch override</option>
          </Select>
        </FormField>

        {scope === "branch" && (
          <FormField
            label="Branch"
            htmlFor="invoiceSettingsBranch"
            error={submitted && !branchId ? "Select a branch" : undefined}
          >
            <Select
              id="invoiceSettingsBranch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              <option value="">Select branch</option>

              {BUSINESS_BRANCHES.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}
      </section>

      <section>
        <h3 className="font-bold">Numbering and defaults</h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Invoice prefix"
            htmlFor="invoiceSettingsPrefix"
            error={
              submitted && !invoicePrefix.trim() ? "Enter an invoice prefix" : undefined
            }
          >
            <Input
              id="invoiceSettingsPrefix"
              value={invoicePrefix}
              onChange={(event) => setInvoicePrefix(event.target.value)}
            />
          </FormField>

          <FormField label="Next sequence" htmlFor="invoiceSettingsSequence">
            <Input
              id="invoiceSettingsSequence"
              type="number"
              min="1"
              value={nextSequence}
              onChange={(event) => setNextSequence(event.target.value)}
            />
          </FormField>

          <FormField
            label="Payment terms"
            htmlFor="invoiceSettingsTerms"
            description="Default number of days between issue and due dates."
          >
            <Input
              id="invoiceSettingsTerms"
              type="number"
              min="0"
              value={paymentTermDays}
              onChange={(event) => setPaymentTermDays(event.target.value)}
            />
          </FormField>

          <FormField label="Default tax rate" htmlFor="invoiceSettingsTax">
            <Input
              id="invoiceSettingsTax"
              type="number"
              min="0"
              step="0.01"
              value={defaultTaxRate}
              onChange={(event) => setDefaultTaxRate(event.target.value)}
            />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="font-bold">Billing controls</h3>

        <div className="mt-4 space-y-3">
          {[
            {
              label: "Allow partial payments",
              description:
                "Permit finance to collect an invoice across multiple payments.",
              checked: allowPartialPayments,
              onChange: setAllowPartialPayments,
            },
            {
              label: "Automatically send invoices",
              description: "Deliver newly generated invoices without manual review.",
              checked: autoSendInvoices,
              onChange: setAutoSendInvoices,
            },
            {
              label: "Automatically mark overdue",
              description: "Change open invoices to overdue after their due date passes.",
              checked: autoMarkOverdue,
              onChange: setAutoMarkOverdue,
            },
            {
              label: "Send payment reminders",
              description:
                "Notify clients before due dates and while balances remain overdue.",
              checked: sendDueReminders,
              onChange: setSendDueReminders,
            },
          ].map((control) => (
            <div
              key={control.label}
              className="flex items-center justify-between gap-5 rounded-control border border-border p-4"
            >
              <div>
                <p className="text-sm font-semibold">{control.label}</p>

                <p className="mt-1 text-xs text-text-muted">{control.description}</p>
              </div>

              <Switch
                checked={control.checked}
                onCheckedChange={control.onChange}
                ariaLabel={control.label}
              />
            </div>
          ))}
        </div>
      </section>

      {sendDueReminders && (
        <section>
          <h3 className="font-bold">Reminder timing</h3>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField
              label="Reminder before due"
              htmlFor="invoiceSettingsReminderBefore"
              description="Days before the due date."
            >
              <Input
                id="invoiceSettingsReminderBefore"
                type="number"
                min="0"
                value={reminderDaysBeforeDue}
                onChange={(event) => setReminderDaysBeforeDue(event.target.value)}
              />
            </FormField>

            <FormField
              label="Overdue reminder interval"
              htmlFor="invoiceSettingsOverdueInterval"
              description="Days between overdue reminders."
            >
              <Input
                id="invoiceSettingsOverdueInterval"
                type="number"
                min="1"
                value={overdueReminderIntervalDays}
                onChange={(event) => setOverdueReminderIntervalDays(event.target.value)}
              />
            </FormField>
          </div>
        </section>
      )}

      <FormField
        label="Default invoice note"
        htmlFor="invoiceSettingsDefaultNote"
        optional
      >
        <Textarea
          id="invoiceSettingsDefaultNote"
          value={defaultNote}
          onChange={(event) => setDefaultNote(event.target.value)}
          placeholder="Default payment terms, bank details or billing instructions..."
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">{settings ? "Save settings" : "Create settings"}</Button>
      </div>
    </form>
  );
}
