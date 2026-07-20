"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
  XCircle,
} from "lucide-react";

import {
  Badge,
} from "@/components/ui/badge";
import {
  Button,
} from "@/components/ui/button";
import {
  Drawer,
} from "@/components/ui/drawer";
import {
  Input,
} from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BRANCH_OPTIONS,
} from "@/data/branches";
import {
  EMPLOYEES,
} from "@/data/employees";
import {
  persistImportedEmployees,
  type ImportedEmployee,
} from "@/components/people/use-imported-employees";

type BulkEmployeeImportDrawerProps = {
  open: boolean;
  onClose: () => void;
  selectedBranchId: string;
  onImported?: (
    employees: ImportedEmployee[],
  ) => void;
};

type CsvRow = {
  rowNumber: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  phone: string;
  branch: string;
  department: string;
  designation: string;
  lineManager: string;
  employmentType: string;
  joiningDate: string;
  basicSalary: string;
  status: string;
};

type ValidatedRow = CsvRow & {
  errors: string[];
  employee?: ImportedEmployee;
};

const REQUIRED_HEADERS = [
  "employee_id",
  "first_name",
  "last_name",
  "work_email",
  "phone",
  "branch",
  "department",
  "designation",
  "line_manager",
  "employment_type",
  "joining_date",
  "basic_salary",
  "status",
] as const;

const TEMPLATE_ROWS = [
  [
    "AMS-101",
    "Ali",
    "Raza",
    "ali.raza@company.com",
    "03001234567",
    "Islamabad Branch",
    "Engineering",
    "Software Engineer",
    "Usman Malik",
    "full-time",
    "2026-07-01",
    "120000",
    "active",
  ],
  [
    "AMS-102",
    "Sara",
    "Ahmed",
    "sara.ahmed@company.com",
    "03007654321",
    "Lahore Branch",
    "Finance",
    "Accounts Executive",
    "Ayesha Khan",
    "full-time",
    "2026-07-01",
    "90000",
    "active",
  ],
];

function escapeCsvValue(
  value: string,
) {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n")
  ) {
    return `"${value.replaceAll(
      '"',
      '""',
    )}"`;
  }

  return value;
}

function downloadTemplate() {
  const csv = [
    REQUIRED_HEADERS.join(","),
    ...TEMPLATE_ROWS.map(
      (row) =>
        row
          .map(escapeCsvValue)
          .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });

  const url =
    URL.createObjectURL(blob);
  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download =
    "ams-employee-import-template.csv";
  anchor.click();

  URL.revokeObjectURL(url);
}

function parseCsvLine(
  line: string,
) {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (
    let index = 0;
    index < line.length;
    index += 1
  ) {
    const character = line[index];

    if (character === '"') {
      if (
        quoted &&
        line[index + 1] === '"'
      ) {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }

      continue;
    }

    if (
      character === "," &&
      !quoted
    ) {
      values.push(value.trim());
      value = "";
      continue;
    }

    value += character;
  }

  values.push(value.trim());

  return values;
}

function parseCsv(
  content: string,
) {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error(
      "CSV must contain a header and at least one employee row.",
    );
  }

  const headers = parseCsvLine(
    lines[0],
  ).map((header) =>
    header
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_"),
  );

  const missingHeaders =
    REQUIRED_HEADERS.filter(
      (header) =>
        !headers.includes(header),
    );

  if (missingHeaders.length > 0) {
    throw new Error(
      `Missing columns: ${missingHeaders.join(
        ", ",
      )}`,
    );
  }

  function valueAt(
    row: string[],
    header: string,
  ) {
    const index =
      headers.indexOf(header);

    return index >= 0
      ? row[index]?.trim() ?? ""
      : "";
  }

  return lines
    .slice(1)
    .map((line, index) => {
      const row = parseCsvLine(line);

      return {
        rowNumber: index + 2,
        employeeId: valueAt(
          row,
          "employee_id",
        ),
        firstName: valueAt(
          row,
          "first_name",
        ),
        lastName: valueAt(
          row,
          "last_name",
        ),
        workEmail: valueAt(
          row,
          "work_email",
        ),
        phone: valueAt(
          row,
          "phone",
        ),
        branch: valueAt(
          row,
          "branch",
        ),
        department: valueAt(
          row,
          "department",
        ),
        designation: valueAt(
          row,
          "designation",
        ),
        lineManager: valueAt(
          row,
          "line_manager",
        ),
        employmentType: valueAt(
          row,
          "employment_type",
        ),
        joiningDate: valueAt(
          row,
          "joining_date",
        ),
        basicSalary: valueAt(
          row,
          "basic_salary",
        ),
        status: valueAt(
          row,
          "status",
        ),
      } satisfies CsvRow;
    });
}

function normalizeValue(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

function createInitials(
  firstName: string,
  lastName: string,
) {
  return `${firstName[0] ?? ""}${
    lastName[0] ?? ""
  }`.toUpperCase();
}

function validateRows(
  rows: CsvRow[],
  selectedBranchId: string,
) {
  const existingCodes =
    new Set(
      EMPLOYEES.map(
        (employee) =>
          employee.employeeCode
            .toLowerCase(),
      ),
    );

  const existingEmails =
    new Set(
      EMPLOYEES.map(
        (employee) =>
          String(
            (
              employee as typeof employee & {
                workEmail?: string;
                email?: string;
              }
            ).workEmail ||
              (
                employee as typeof employee & {
                  email?: string;
                }
              ).email ||
              "",
          ).toLowerCase(),
      ).filter(Boolean),
    );

  const seenCodes =
    new Set<string>();
  const seenEmails =
    new Set<string>();

  return rows.map(
    (row): ValidatedRow => {
      const errors: string[] = [];
      const employeeCode =
        row.employeeId.trim();
      const email =
        row.workEmail
          .trim()
          .toLowerCase();

      if (!employeeCode) {
        errors.push(
          "Employee ID is required",
        );
      }

      if (!row.firstName.trim()) {
        errors.push(
          "First name is required",
        );
      }

      if (!row.lastName.trim()) {
        errors.push(
          "Last name is required",
        );
      }

      if (
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email,
        )
      ) {
        errors.push(
          "Valid work email is required",
        );
      }

      if (!row.department.trim()) {
        errors.push(
          "Department is required",
        );
      }

      if (!row.designation.trim()) {
        errors.push(
          "Designation is required",
        );
      }

      if (!row.joiningDate.trim()) {
        errors.push(
          "Joining date is required",
        );
      }

      if (
        row.basicSalary &&
        (!Number.isFinite(
          Number(row.basicSalary),
        ) ||
          Number(row.basicSalary) < 0)
      ) {
        errors.push(
          "Basic salary must be a valid amount",
        );
      }

      const normalizedCode =
        employeeCode.toLowerCase();

      if (
        existingCodes.has(
          normalizedCode,
        ) ||
        seenCodes.has(normalizedCode)
      ) {
        errors.push(
          "Duplicate employee ID",
        );
      }

      if (
        email &&
        (existingEmails.has(email) ||
          seenEmails.has(email))
      ) {
        errors.push(
          "Duplicate work email",
        );
      }

      if (normalizedCode) {
        seenCodes.add(
          normalizedCode,
        );
      }

      if (email) {
        seenEmails.add(email);
      }

      const branches =
        BRANCH_OPTIONS.filter(
          (branch) =>
            !branch.isAggregate,
        );

      const branch =
        branches.find(
          (item) =>
            item.id.toLowerCase() ===
              row.branch
                .trim()
                .toLowerCase() ||
            item.name.toLowerCase() ===
              row.branch
                .trim()
                .toLowerCase(),
        ) ??
        branches.find(
          (item) =>
            item.id ===
            selectedBranchId,
        );

      if (!branch) {
        errors.push(
          "Branch must match an AMS branch",
        );
      }

      const employmentType =
        normalizeValue(
          row.employmentType ||
            "full-time",
        );

      const status =
        (row.status || "active")
          .trim()
          .toLowerCase()
          .replace(/[\s-]+/g, "_");

      const name = [
        row.firstName.trim(),
        row.lastName.trim(),
      ]
        .filter(Boolean)
        .join(" ");

      const salary = Number(
        row.basicSalary || 0,
      );

      const employee = branch
        ? ({
            id:
              employeeCode ||
              crypto.randomUUID(),
            employeeCode:
              employeeCode ||
              `AMS-${Date.now()}`,
            name,
            firstName:
              row.firstName.trim(),
            lastName:
              row.lastName.trim(),
            initials: createInitials(
              row.firstName,
              row.lastName,
            ),
            email,
            workEmail: email,
            phone: row.phone.trim(),
            branchId: branch.id,
            branchName: branch.name,
            department:
              row.department.trim(),
            designation:
              row.designation.trim(),
            managerName:
              row.lineManager.trim() ||
              "Not assigned",
            lineManager:
              row.lineManager.trim() ||
              "Not assigned",
            employmentType,
            joiningDate:
              row.joiningDate.trim(),
            joinDate:
              row.joiningDate.trim(),
            basicSalary: salary,
            salary,
            status,
            avatarUrl: "",
          } as unknown as ImportedEmployee)
        : undefined;

      return {
        ...row,
        errors,
        employee,
      };
    },
  );
}

export function BulkEmployeeImportDrawer({
  open,
  onClose,
  selectedBranchId,
  onImported,
}: BulkEmployeeImportDrawerProps) {
  const [fileName, setFileName] =
    useState("");
  const [rows, setRows] =
    useState<ValidatedRow[]>([]);
  const [fileError, setFileError] =
    useState("");
  const [completedCount, setCompletedCount] =
    useState<number | null>(null);
  const [dragActive, setDragActive] =
    useState(false);

  const validRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.errors.length === 0 &&
          row.employee,
      ),
    [rows],
  );

  const invalidRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.errors.length > 0,
      ),
    [rows],
  );

  function reset() {
    setFileName("");
    setRows([]);
    setFileError("");
    setCompletedCount(null);
    setDragActive(false);
  }

  function close() {
    reset();
    onClose();
  }

  function readFile(
    file: File | undefined,
  ) {
    if (!file) {
      return;
    }

    setFileError("");
    setCompletedCount(null);

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setFileError(
        "Upload a CSV file.",
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      try {
        const parsed = parseCsv(
          String(
            reader.result ?? "",
          ),
        );

        setRows(
          validateRows(
            parsed,
            selectedBranchId,
          ),
        );
        setFileName(file.name);
      } catch (error) {
        setRows([]);
        setFileName(file.name);
        setFileError(
          error instanceof Error
            ? error.message
            : "CSV could not be read.",
        );
      }
    };

    reader.onerror = () => {
      setFileError(
        "CSV could not be read.",
      );
    };

    reader.readAsText(file);
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    readFile(
      event.target.files?.[0],
    );
    event.target.value = "";
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setDragActive(false);
    readFile(
      event.dataTransfer.files?.[0],
    );
  }

  function importEmployees() {
    const employees =
      validRows
        .map((row) => row.employee)
        .filter(
          (
            employee,
          ): employee is ImportedEmployee =>
            Boolean(employee),
        );

    if (employees.length === 0) {
      return;
    }

    persistImportedEmployees(
      employees,
    );
    onImported?.(employees);
    setCompletedCount(
      employees.length,
    );
  }

  return (
    <Drawer
      open={open}
      onClose={close}
      title="Add Employees"
      description="Upload a CSV, review validation results and add multiple employees together."
      footer={
        completedCount === null ? (
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variant="ghost"
              onClick={close}
            >
              Cancel
            </Button>

            <Button
              onClick={
                importEmployees
              }
              disabled={
                validRows.length === 0
              }
            >
              <Upload />
              Import{" "}
              {validRows.length > 0
                ? `${validRows.length} employees`
                : "employees"}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button onClick={close}>
              Done
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        {completedCount !== null ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-card border border-border p-8 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-success-muted text-success">
              <CheckCircle2 />
            </span>

            <h3 className="mt-5 text-lg font-bold">
              Employees imported
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-text-muted">
              {completedCount} employee
              {completedCount === 1
                ? ""
                : "s"}{" "}
              were added to the People
              directory.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-control border border-border p-4">
              <div>
                <p className="text-sm font-semibold">
                  Use the AMS CSV template
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Keep the column names
                  unchanged before uploading.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={
                  downloadTemplate
                }
              >
                <Download />
                Download template
              </Button>
            </div>

            <div
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) =>
                event.preventDefault()
              }
              onDragLeave={() =>
                setDragActive(false)
              }
              onDrop={handleDrop}
              className={
                dragActive
                  ? "rounded-card border-2 border-primary bg-info-muted p-8 text-center"
                  : "rounded-card border-2 border-dashed border-border p-8 text-center"
              }
            >
              <span className="mx-auto flex size-12 items-center justify-center rounded-control bg-info-muted text-info">
                <FileSpreadsheet />
              </span>

              <p className="mt-4 font-semibold">
                Drop employee CSV here
              </p>

              <p className="mt-2 text-sm text-text-muted">
                or browse from your
                computer
              </p>

              <label className="mt-5 inline-flex cursor-pointer">
                <Input
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={
                    handleFileChange
                  }
                />

                <span className="inline-flex min-w-max items-center justify-center gap-[var(--ams-control-gap)] rounded-control border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-canvas">
                  <Upload size={18} />
                  Choose CSV
                </span>
              </label>

              {fileName && (
                <p className="mt-4 text-xs font-semibold text-text-muted">
                  {fileName}
                </p>
              )}
            </div>

            {fileError && (
              <div className="flex items-start gap-3 rounded-control bg-danger-muted p-4 text-danger">
                <XCircle className="mt-0.5 size-5 shrink-0" />
                <p className="text-sm font-semibold">
                  {fileError}
                </p>
              </div>
            )}

            {rows.length > 0 && (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-control bg-canvas p-4">
                    <p className="text-xs text-text-muted">
                      Uploaded rows
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {rows.length}
                    </p>
                  </div>

                  <div className="rounded-control bg-success-muted p-4 text-success">
                    <p className="text-xs">
                      Valid
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {validRows.length}
                    </p>
                  </div>

                  <div className="rounded-control bg-danger-muted p-4 text-danger">
                    <p className="text-xs">
                      Errors
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {invalidRows.length}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-card border border-border">
                  <div className="border-b border-border p-4">
                    <h3 className="font-bold">
                      Import preview
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">
                      Invalid rows are skipped.
                      Correct the CSV and upload
                      it again to include them.
                    </p>
                  </div>

                  <div className="max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-canvas">
                          <TableHead>
                            Row
                          </TableHead>
                          <TableHead>
                            Employee
                          </TableHead>
                          <TableHead>
                            Branch
                          </TableHead>
                          <TableHead>
                            Department
                          </TableHead>
                          <TableHead>
                            Result
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {rows.map((row) => (
                          <TableRow
                            key={`${row.rowNumber}-${row.employeeId}`}
                          >
                            <TableCell>
                              {row.rowNumber}
                            </TableCell>

                            <TableCell>
                              <p className="font-semibold">
                                {[
                                  row.firstName,
                                  row.lastName,
                                ]
                                  .filter(Boolean)
                                  .join(" ") ||
                                  "Unnamed employee"}
                              </p>
                              <p className="mt-1 text-xs text-text-muted">
                                {row.employeeId ||
                                  "Missing ID"}{" "}
                                Â·{" "}
                                {row.workEmail ||
                                  "Missing email"}
                              </p>
                            </TableCell>

                            <TableCell>
                              {row.branch ||
                                "â€”"}
                            </TableCell>

                            <TableCell>
                              {row.department ||
                                "â€”"}
                            </TableCell>

                            <TableCell>
                              {row.errors
                                .length === 0 ? (
                                <Badge variant="success">
                                  Valid
                                </Badge>
                              ) : (
                                <div className="space-y-1">
                                  <Badge variant="danger">
                                    Error
                                  </Badge>
                                  <p className="max-w-xs text-xs leading-5 text-danger">
                                    {row.errors.join(
                                      " Â· ",
                                    )}
                                  </p>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Drawer>
  );
}
