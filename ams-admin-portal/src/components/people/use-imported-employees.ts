"use client";

import { useEffect, useState } from "react";

import { EMPLOYEES } from "@/data/employees";

export type ImportedEmployee = (typeof EMPLOYEES)[number];

const STORAGE_KEY = "ams-imported-employees-v1";
const EVENT_NAME = "ams:employees-imported";

function readImportedEmployees() {
  if (typeof window === "undefined") {
    return [] as ImportedEmployee[];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? (parsed as ImportedEmployee[]) : [];
  } catch {
    return [];
  }
}

export function persistImportedEmployees(employees: ImportedEmployee[]) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readImportedEmployees();

  const records = new Map<string, ImportedEmployee>();

  [...current, ...employees].forEach((employee) => {
    const value = employee as ImportedEmployee & {
      employeeCode?: string;
      email?: string;
      workEmail?: string;
    };

    const key = String(
      value.employeeCode || value.workEmail || value.email || value.id,
    ).toLowerCase();

    records.set(key, employee);
  });

  const next = Array.from(records.values());

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: next,
    }),
  );
}

export function useImportedEmployees() {
  const [employees, setEmployees] = useState<ImportedEmployee[]>([]);

  useEffect(() => {
    setEmployees(readImportedEmployees());

    function handleImported(event: Event) {
      const customEvent = event as CustomEvent<ImportedEmployee[]>;

      setEmployees(customEvent.detail ?? readImportedEmployees());
    }

    window.addEventListener(EVENT_NAME, handleImported);

    return () => {
      window.removeEventListener(EVENT_NAME, handleImported);
    };
  }, []);

  return employees;
}
