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
  
  const regex = /<div className="flex items-center gap-2">\s*<button[\s\S]*?>\s*Previous\s*<\/button>[\s\S]*?Array\.from\(\{ length: totalPages \}[\s\S]*?>\s*Next\s*<\/button>\s*<\/div>/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, `<Pagination \n                  currentPage={safePage} \n                  totalPages={totalPages} \n                  onPageChange={goToPage} \n                />`);
    fs.writeFileSync(filePath, content);
    console.log(`Replaced successfully in ${file}`);
  } else {
    console.log(`Regex did not match in ${file}`);
  }
});
