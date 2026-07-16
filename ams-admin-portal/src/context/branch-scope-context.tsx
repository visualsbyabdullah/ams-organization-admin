"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

import { BRANCH_OPTIONS } from "@/data/branches";
import type { BranchOption } from "@/types/branch";

type BranchScopeContextValue = {
  branches: BranchOption[];
  selectedBranch: BranchOption;
  selectedBranchId: string;
  setSelectedBranchId: (branchId: string) => void;
};

const BranchScopeContext =
  createContext<BranchScopeContextValue | null>(null);

type BranchScopeProviderProps = {
  children: ReactNode;
};

export function BranchScopeProvider({
  children,
}: BranchScopeProviderProps) {
  const [selectedBranchId, setSelectedBranchId] = useState(
    BRANCH_OPTIONS[0].id,
  );

  const selectedBranch =
    BRANCH_OPTIONS.find(
      (branch) => branch.id === selectedBranchId,
    ) ?? BRANCH_OPTIONS[0];

  const value = useMemo(
    () => ({
      branches: BRANCH_OPTIONS,
      selectedBranch,
      selectedBranchId,
      setSelectedBranchId,
    }),
    [selectedBranch, selectedBranchId],
  );

  return (
    <BranchScopeContext.Provider value={value}>
      {children}
    </BranchScopeContext.Provider>
  );
}

export function useBranchScope() {
  const context = useContext(BranchScopeContext);

  if (!context) {
    throw new Error(
      "useBranchScope must be used inside BranchScopeProvider",
    );
  }

  return context;
}
