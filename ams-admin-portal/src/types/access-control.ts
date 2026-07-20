export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "approve"
  | "delete"
  | "export";

export type RoleType =
  | "system"
  | "custom";

export type RoleStatus =
  | "active"
  | "inactive";

export type BranchAccessScope =
  | "all"
  | "assigned";

export type PortalAccessStatus =
  | "active"
  | "invited"
  | "disabled";

export type AccessRole = {
  id: string;
  name: string;
  description: string;
  type: RoleType;
  status: RoleStatus;
  branchScope: BranchAccessScope;
  permissions: Record<
    string,
    PermissionAction[]
  >;
};

export type UserAccessRecord = {
  employeeId: string;
  roleId: string;
  branchId: string;
  status: PortalAccessStatus;
  lastActive: string;
};
