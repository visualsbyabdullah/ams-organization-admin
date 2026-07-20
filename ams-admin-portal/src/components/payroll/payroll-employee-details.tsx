import { Badge } from "@/components/ui/badge";
import {
  PAYROLL_EMPLOYEE_STATUS_CONFIG,
  PAYROLL_PAYMENT_METHOD_CONFIG,
} from "@/config/payroll";
import { formatPKR } from "@/lib/currency";
import type {
  Employee,
} from "@/types/employee";
import type {
  PayrollEmployeeRecord,
} from "@/types/payroll";

type PayrollEmployeeDetailsProps = {
  record: PayrollEmployeeRecord;
  employee: Employee;
};

export function PayrollEmployeeDetails({
  record,
  employee,
}: PayrollEmployeeDetailsProps) {
  const grossPay =
    record.baseSalary +
    record.allowances +
    record.overtimePay +
    record.bonus;

  const totalDeductions =
    record.deductions +
    record.tax;

  const statusConfig =
    PAYROLL_EMPLOYEE_STATUS_CONFIG[
      record.status
    ];

  const paymentConfig =
    PAYROLL_PAYMENT_METHOD_CONFIG[
      record.paymentMethod
    ];

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-border">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="font-bold">
              {employee.name}
            </h3>

            <p className="mt-1 text-xs text-text-muted">
              {employee.employeeCode} ·{" "}
              {employee.department}
            </p>
          </div>

          <Badge
            variant={
              statusConfig.badgeVariant
            }
          >
            {statusConfig.label}
          </Badge>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-text-muted">
              Payroll period
            </dt>

            <dd className="mt-1 text-sm font-semibold">
              July 2026
            </dd>
          </div>

          <div>
            <dt className="text-xs text-text-muted">
              Payment method
            </dt>

            <dd className="mt-1">
              <Badge
                variant={
                  paymentConfig.badgeVariant
                }
              >
                {paymentConfig.label}
              </Badge>
            </dd>
          </div>

          <div>
            <dt className="text-xs text-text-muted">
              Gross pay
            </dt>

            <dd className="mt-1 text-sm font-semibold">
              {formatPKR(grossPay)}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-text-muted">
              Net pay
            </dt>

            <dd className="mt-1 text-sm font-bold text-success">
              {formatPKR(
                record.netPay,
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-bold">
          Earnings
        </h3>

        <dl className="mt-3 space-y-3">
          {[
            {
              label: "Base salary",
              value:
                record.baseSalary,
            },
            {
              label: "Allowances",
              value:
                record.allowances,
            },
            {
              label: "Overtime pay",
              value:
                record.overtimePay,
            },
            {
              label: "Bonus",
              value: record.bonus,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-control bg-canvas px-4 py-3"
            >
              <dt className="text-sm text-text-muted">
                {item.label}
              </dt>

              <dd className="text-sm font-semibold">
                {formatPKR(item.value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-bold">
          Deductions
        </h3>

        <dl className="mt-3 space-y-3">
          <div className="flex items-center justify-between rounded-control bg-canvas px-4 py-3">
            <dt className="text-sm text-text-muted">
              Other deductions
            </dt>

            <dd className="text-sm font-semibold">
              {formatPKR(
                record.deductions,
              )}
            </dd>
          </div>

          <div className="flex items-center justify-between rounded-control bg-canvas px-4 py-3">
            <dt className="text-sm text-text-muted">
              Income tax
            </dt>

            <dd className="text-sm font-semibold">
              {formatPKR(
                record.tax,
              )}
            </dd>
          </div>

          <div className="flex items-center justify-between rounded-control bg-danger-muted px-4 py-3">
            <dt className="text-sm font-semibold text-danger">
              Total deductions
            </dt>

            <dd className="text-sm font-bold text-danger">
              {formatPKR(
                totalDeductions,
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-bold">
          Payroll note
        </h3>

        <p className="mt-2 rounded-control bg-canvas p-4 text-sm leading-6 text-text-muted">
          {record.note ||
            "No payroll note has been added."}
        </p>
      </section>
    </div>
  );
}
