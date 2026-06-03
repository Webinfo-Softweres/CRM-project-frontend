// constants/sidebarMenu.js

export const sidebarMenu = [
  {
    title: "Dashboard",
    path: "/dashboard",
  },

  {
    title: "Staff",
    path: "/staff",
    permission: "users:read",
  },

  {
    title: "Customers",
    path: "/customers",
    children: [
      {
        title: "Customer List",
        path: "/customers",
        permission: "customers:read",
      },

      {
        title: "Enquiries",
        path: "/enquiries",
        permission: "enquiries:read",
      },
    ],
  },

  // 🔷 QUOTATIONS BELOW CUSTOMERS
  {
    title: "Quotations",
    path: "/quotations",
    permission: "quotations:read",
  },

  {
    title: "Projects",
    path: "/projects",
    permission: "projects:read",
  },

  // constants/sidebarMenu.js

  {
    title: "Tasks",
    path: "/tasks",
    children: [
      {
        title: "Task List",
        path: "/tasks",
        permission: "tasks:read",
      },

      // {
      //   title: "My Tasks",
      //   path: "/my-tasks",
      // },
    ],
  },

  {
    title: "Work Reports",
    path: "/work-reports",
    permission: "reports:read",
  },

  {
    title: "Customer Feedback",
    path: "/feedback",
    permission: "feedback:read",
  },

  {
    title: "Activity",
    path: "/activity",
    permission: "status_logs:read",
  },

  {
    title: "Attendance",
    path: "/attendance",
  },

  {
    title: "Notifications",
    path: "/notifications",
    permission: "notifications:read",
  },

  {
    title: "Settings",
    path: "/settings/permissions",
    permission: "roles:read",
    children: [
      {
        title: "Permissions",
        path: "/settings/permissions",
        permission: "roles:read",
      },
    ],
  },
];
