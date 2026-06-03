import { useSelector } from "react-redux";
import Cookies from "js-cookie";

const ROLE_PERMISSIONS = {
  Admin: [
    "customers:create",
    "customers:read",
    "customers:update",
    "customers:delete",
    "enquiries:create",
    "enquiries:read",
    "enquiries:update",
    "enquiries:delete",
    "quotations:create",
    "quotations:read",
    "quotations:update",
    "quotations:delete",
    "projects:create",
    "projects:read",
    "projects:update",
    "projects:delete",
    "tasks:create",
    "tasks:read",
    "tasks:update",
    "tasks:delete",
    "reports:create",
    "reports:read",
    "reports:update",
    "reports:delete",
    "feedback:create",
    "feedback:read",
    "feedback:update",
    "feedback:delete",
    "notifications:create",
    "notifications:read",
    "notifications:update",
    "notifications:delete",
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "roles:create",
    "roles:read",
    "roles:update",
    "roles:delete",
    "departments:create",
    "departments:read",
    "departments:update",
    "departments:delete",
    "status_logs:create",
    "status_logs:read",
    "status_logs:update",
    "status_logs:delete"
  ],
  Manager: [
    "customers:create",
    "customers:read",
    "customers:update",
    "customers:delete",
    "enquiries:create",
    "enquiries:read",
    "enquiries:update",
    "enquiries:delete",
    "quotations:create",
    "quotations:read",
    "quotations:update",
    "quotations:delete",
    "projects:create",
    "projects:read",
    "projects:update",
    "projects:delete",
    "tasks:create",
    "tasks:read",
    "tasks:update",
    "tasks:delete",
    "reports:read",
    "reports:update",
    "reports:delete",
    "feedback:create",
    "feedback:read",
    "feedback:update",
    "feedback:delete",
    "notifications:create",
    "notifications:read",
    "notifications:update",
    "notifications:delete",
    "status_logs:read"
  ],
  Staff: [
    // "customers:read",
    // "enquiries:read",
    // "quotations:create",
    // "quotations:read",
    "projects:read",
    "tasks:read",
    // "tasks:update",
    "reports:create",
    "reports:read",
    "reports:update",
    // "feedback:create",
    // "feedback:read",
    // "notifications:create",
    "notifications:read",
    // "notifications:update",
    // "notifications:delete",
    // "status_logs:read"
  ]
};

const normalizeRole = (role) => {
  if (!role) return null;
  const lower = String(role).toLowerCase().trim();
  if (lower === "admin") return "Admin";
  if (lower === "manager") return "Manager";
  if (lower === "staff") return "Staff";
  return null;
};

export const hasPermission = (role, permission) => {
  const norm = normalizeRole(role);
  if (!norm) return false;
  const list = ROLE_PERMISSIONS[norm] || [];
  return list.includes(permission);
};

export const usePermissions = () => {
  const authRole = useSelector((state) => state.auth.role) || Cookies.get("role");
  
  const can = (permission) => {
    return hasPermission(authRole, permission);
  };

  const isRole = (checkRole) => {
    return normalizeRole(authRole) === normalizeRole(checkRole);
  };

  return { role: authRole, can, isRole };
};
