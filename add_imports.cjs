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
  'attendance/AttendancePage.jsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('import Pagination')) {
    // Find last import statement
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    
    content = content.slice(0, endOfLastImport + 1) + 
              'import Pagination from "../../components/common/Pagination";\n' + 
              content.slice(endOfLastImport + 1);
              
    fs.writeFileSync(filePath, content);
    console.log(`Added import to ${file}`);
  }
});
