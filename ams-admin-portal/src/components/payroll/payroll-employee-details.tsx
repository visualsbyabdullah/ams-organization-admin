import { DetailGrid, LineItemList } from "@/components/shared/detail-grid";
import { Badge } from "@/components/ui/badge";
import {
  PAYROLL_EMPLOYEE_STATUS_CONFIG,
  PAYROLL_PAYMENT_METHOD_CONFIG,
} from "@/config/payroll";
import { formatPKR } from "@/lib/currency";
import type { Employee } from "@/types/employee";
import type { PayrollEmployeeRecord } from "@/types/payroll";

type PayrollEmployeeDetailsProps = {
  record: PayrollEmployeeRecord;
  employee: Employee;
};

export function PayrollEmployeeDetails({
  record,
  employee,
}: PayrollEmployeeDetailsProps) {
  const grossPay =
    record.baseSalary + record.allowances + record.overtimePay + record.bonus;

  const totalDeductions = record.deductions + record.tax;

  const statusConfig = PAYROLL_EMPLOYEE_STATUS_CONFIG[record.status];

  const paymentConfig = PAYROLL_PAYMENT_METHOD_CONFIG[record.paymentMethod];

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="font-bold">{employee.name}</h3>

            <p className="mt-1 text-xs text-text-muted">
              {employee.employeeCode} · {employee.department}
            </p>
          </div>

          <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>
        </div>

        <DetailGrid
          variant="none"
          items={[
            {
              label: "Payroll period",
              value: "July 2026",
            },
            {
              label: "Payment method",
              value: (
                <Badge variant={paymentConfig.badgeVariant}>{paymentConfig.label}</Badge>
              ),
            },
            {
              label: "Gross pay",
              value: formatPKR(grossPay),
            },
            {
              label: "Net pay",
              value: (
                <span className="font-bold text-success">{formatPKR(record.netPay)}</span>
              ),
            },
          ]}
        />
      </section>

      <section>
        <h3 className="text-sm font-bold">Earnings</h3>

        <LineItemList
          items={[
            {
              label: "Base salary",
              value: formatPKR(record.baseSalary),
            },
            {
              label: "Allowances",
              value: formatPKR(record.allowances),
            },
            {
              label: "Overtime pay",
              value: formatPKR(record.overtimePay),
            },
            {
              label: "Bonus",
              value: formatPKR(record.bonus),
            },
          ]}
        />
      </section>

      <section>
        <h3 className="text-sm font-bold">Deductions</h3>

        <LineItemList
          items={[
            {
              label: "Other deductions",
              value: formatPKR(record.deductions),
            },
            {
              label: "Income tax",
              value: formatPKR(record.tax),
            },
            {
              label: "Total deductions",
              value: formatPKR(totalDeductions),
              tone: "danger",
            },
          ]}
        />
      </section>

      <section>
        <h3 className="text-sm font-bold">Payroll note</h3>

        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {record.note || "No payroll note has been added."}
        </p>
      </section>
    </div>
  );
}
