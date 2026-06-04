import { configureStore } from "@reduxjs/toolkit";

import activityReducer from "./activitySlice";
import authReducer from "./authSlice";
import customerReducer from "./customerSlice";
import dashboardReducer from "./dashboardSlice";
import departmentReducer from "./departmentSlice";
import enquiryReducer from "./enquirySlice";
import feedbackReducer from "./feedbackSlice";
import permissionReducer from "./permissionSlice";
import projectReducer from "./projectSlice";
import quotationReducer from "./quotationSlice";
import roleReducer from "./roleSlice";
import taskReducer from "./taskSlice";
import userReducer from "./userSlice";
import workReportReducer from "./workReportSlice";
import notificationReducer from "./notificationSlice";
import attendanceReducer from "./attendanceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    activity: activityReducer,
    customers: customerReducer,
    dashboard: dashboardReducer,
    departments: departmentReducer,
    enquiries: enquiryReducer,
    feedback: feedbackReducer,
    permissions: permissionReducer,
    projects: projectReducer,
    quotations: quotationReducer,
    roles: roleReducer,
    tasks: taskReducer,
    users: userReducer,
    workReports: workReportReducer,
    notifications: notificationReducer,
    attendance: attendanceReducer,
  },
});
