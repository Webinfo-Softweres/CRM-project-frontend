import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// AUTH
import Login from "../pages/auth/Login";

// DASHBOARD
import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/profile/Profile";

// STAFF
import StaffList from "../pages/staff/StaffList.jsx";
import StaffForm from "../pages/staff/StaffForm";

// CUSTOMERS
import CustomerList from "../pages/customers/CustomerList";
import CustomerForm from "../pages/customers/CustomerForm";

// ENQUIRIES
import EnquiryList from "../pages/enquiries/EnquiryList";
import EnquiryForm from "../pages/enquiries/EnquiryForm";

import QuotationList from "../pages/quotations/QuotationList";
import CreateQuotation from "../pages/quotations/CreateQuotation";
import QuotationForm from "../pages/quotations/QuotationForm";
import QuotationDetails from "../pages/quotations/QuotationDetails";

// PROJECTS
import ProjectList from "../pages/projects/ProjectList";
import CreateProject from "../pages/projects/CreateProject";
import EditProject from "../pages/projects/EditProject";
import ProjectDetails from "../pages/projects/ProjectDetails";

// TASKS
import TaskList from "../pages/tasks/TaskList";
import TaskForm from "../pages/tasks/TaskForm";
import TaskDetails from "../pages/tasks/TaskDetails";
import MyTasks from "../pages/tasks/MyTasks";
import DailyWorkReport from "../pages/tasks/DailyWorkReport";
import WorkReportList from "../pages/workReports/WorkReportList";
import WorkReportForm from "../pages/workReports/WorkReportForm";
import WorkReportDetails from "../pages/workReports/WorkReportDetails";

import FeedbackList from "../pages/feedback/FeedbackList";
import FeedbackForm from "../pages/feedback/FeedbackForm";

import ActivityPage from "../pages/activity/ActivityPage";
import AttendancePage from "../pages/attendance/AttendancePage";

import NotificationList from "../pages/notifications/NotificationList";
import NotificationForm from "../pages/notifications/NotificationForm";
import NotificationDetails from "../pages/notifications/NotificationDetails";

// PERMISSIONS
import PermissionList from "../pages/permissions/PermissionList";
import PermissionForm from "../pages/permissions/PermissionForm";

// SETTINGS
import ProtectedRoute from "../components/common/ProtectedRoute";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        {/* DASHBOARD */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        {/* PROFILE */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        {/* STAFF */}
        <Route path="/staff" element={<ProtectedRoute permission="users:read"><StaffList /></ProtectedRoute>} />
        <Route path="/staff/add" element={<ProtectedRoute permission="users:create"><StaffForm /></ProtectedRoute>} />
        <Route path="/staff/edit/:id" element={<ProtectedRoute permission="users:update"><StaffForm /></ProtectedRoute>} />
        {/* CUSTOMERS */}
        <Route path="/customers" element={<ProtectedRoute permission="customers:read"><CustomerList /></ProtectedRoute>} />
        <Route path="/customers/add" element={<ProtectedRoute permission="customers:create"><CustomerForm /></ProtectedRoute>} />
        <Route path="/customers/edit/:id" element={<ProtectedRoute permission="customers:update"><CustomerForm /></ProtectedRoute>} />
        {/* ENQUIRIES */}
        <Route path="/enquiries" element={<ProtectedRoute permission="enquiries:read"><EnquiryList /></ProtectedRoute>} />
        <Route path="/enquiries/add" element={<ProtectedRoute permission="enquiries:create"><EnquiryForm /></ProtectedRoute>} />
        <Route path="/enquiries/edit/:id" element={<ProtectedRoute permission="enquiries:update"><EnquiryForm /></ProtectedRoute>} />
        <Route path="/quotations" element={<ProtectedRoute permission="quotations:read"><QuotationList /></ProtectedRoute>} />
        <Route path="/quotations/create" element={<ProtectedRoute permission="quotations:create"><CreateQuotation /></ProtectedRoute>} />
        <Route path="/quotations/edit/:id" element={<ProtectedRoute permission="quotations:update"><QuotationForm /></ProtectedRoute>} />
        <Route path="/quotations/:id" element={<ProtectedRoute permission="quotations:read"><QuotationDetails /></ProtectedRoute>} />
        {/* PROJECTS */}
        <Route path="/projects" element={<ProtectedRoute permission="projects:read"><ProjectList /></ProtectedRoute>} />
        <Route path="/projects/create" element={<ProtectedRoute permission="projects:create"><CreateProject /></ProtectedRoute>} />
        <Route path="/projects/edit/:id" element={<ProtectedRoute permission="projects:update"><EditProject /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute permission="projects:read"><ProjectDetails /></ProtectedRoute>} />
        {/* TASKS */}
        <Route path="/tasks" element={<ProtectedRoute permission="tasks:read"><TaskList /></ProtectedRoute>} />
        <Route path="/tasks/create" element={<ProtectedRoute permission="tasks:create"><TaskForm /></ProtectedRoute>} />
        <Route path="/tasks/edit/:id" element={<ProtectedRoute permission="tasks:update"><TaskForm /></ProtectedRoute>} />
        <Route path="/tasks/details/:id" element={<ProtectedRoute permission="tasks:read"><TaskDetails /></ProtectedRoute>} />
        {/* <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} /> */}
        <Route path="/work-reports" element={<ProtectedRoute permission="reports:read"><WorkReportList /></ProtectedRoute>} />
        <Route path="/work-reports/create" element={<ProtectedRoute permission="reports:create"><WorkReportForm /></ProtectedRoute>} />
        <Route path="/work-reports/edit/:id" element={<ProtectedRoute permission="reports:update"><WorkReportForm /></ProtectedRoute>} />
        <Route path="/work-reports/:id" element={<ProtectedRoute permission="reports:read"><WorkReportDetails /></ProtectedRoute>} />
        <Route path="/daily-report" element={<ProtectedRoute><DailyWorkReport /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute permission="feedback:read"><FeedbackList /></ProtectedRoute>} />
        <Route path="/feedback/add" element={<ProtectedRoute permission="feedback:create"><FeedbackForm /></ProtectedRoute>} />
        <Route path="/feedback/edit/:id" element={<ProtectedRoute permission="feedback:update"><FeedbackForm /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute permission="status_logs:read"><ActivityPage /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        {/* NOTIFICATIONS */}
        <Route path="/notifications" element={<ProtectedRoute permission="notifications:read"><NotificationList /></ProtectedRoute>} />
        <Route path="/notifications/add" element={<ProtectedRoute permission="notifications:create"><NotificationForm /></ProtectedRoute>} />
        <Route path="/notifications/edit/:id" element={<ProtectedRoute permission="notifications:update"><NotificationForm /></ProtectedRoute>} />
        <Route path="/notifications/:id" element={<ProtectedRoute permission="notifications:read"><NotificationDetails /></ProtectedRoute>} />
        {/* PERMISSIONS */}
        <Route path="/settings/permissions" element={<ProtectedRoute permission="roles:read"><PermissionList /></ProtectedRoute>} />
        <Route path="/settings/permissions/add" element={<ProtectedRoute permission="roles:create"><PermissionForm /></ProtectedRoute>} />
        <Route path="/settings/permissions/edit/:id" element={<ProtectedRoute permission="roles:update"><PermissionForm /></ProtectedRoute>} />


        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="h-screen flex flex-col items-center justify-center bg-slate-100">
              <h1 className="text-7xl font-bold text-blue-600">404</h1>

              <p className="text-gray-500 mt-3 text-lg">Page Not Found</p>

              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-all"
              >
                Go To Dashboard
              </button>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
