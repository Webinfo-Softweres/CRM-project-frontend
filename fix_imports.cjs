const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');

const filesToUpdate = [
  'workReports/WorkReportList.jsx',
  'tasks/TaskList.jsx',
  'staff/StaffList.jsx',
  'quotations/QuotationList.jsx',
  'projects/ProjectList.jsx',
  'permissions/PermissionList.jsx',
  'notifications/NotificationList.jsx',
  'feedback/FeedbackList.jsx',
  'enquiries/EnquiryList.jsx',
  'customers/CustomerList.jsx',
  'attendance/AttendancePage.jsx',
  'activity/ActivityPage.jsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  const importStatement = 'import Pagination from "../../components/common/Pagination";\n';
  const importStatementWithoutNewline = 'import Pagination from "../../components/common/Pagination";';
  
  // Remove all occurrences of the import statement
  content = content.split('\n').filter(line => !line.includes(importStatementWithoutNewline)).join('\n');
  
  // Prepend it to the file
  content = importStatement + content;
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed import in ${file}`);
});
