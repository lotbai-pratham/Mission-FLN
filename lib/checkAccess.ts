// Utility to check if the current session user has required role(s)
import { Session } from "next-auth";

export type Role = "admin" | "state" | "division" | "project_office" | "user";

/**
 * Returns true if the session user has any of the required roles.
 * Admin has all privileges.
 */
export function hasRole(session: Session | null, ...required: Role[]): boolean {
  if (!session?.user?.role) return false;
  const userRole = session.user.role as Role;
  if (userRole === "admin") return true;
  return required.includes(userRole);
}

/**
 * Provides scoped filter parameters based on the user's role.
 * For non‑admin roles, only the relevant ID is returned.
 */
export function getScopeFilters(session: Session | null) {
  const role = session?.user?.role as Role | undefined;
  const user = session?.user as any;
  if (!role || !user) return {};
  switch (role) {
    case "division":
      return { divisionId: user.divisionId };
    case "project_office":
      return { projectOfficeId: user.projectOfficeId };
    case "user": // school‑level user
      return { schoolId: user.schoolId };
    case "admin":
    case "state":
      return {};
  }
}
