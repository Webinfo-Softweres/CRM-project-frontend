import AdminLayout from "../../layouts/AdminLayout";
import AnalyticsCard from "../../components/cards/AnalyticsCard";
import RevenueChart from "../../components/charts/RevenueChart";
import ProductivityChart from "../../components/charts/ProductivityChart";

import {
  performanceData,
} from "../../data/reportData";

function PerformanceReports() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">
          Performance Reports
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <AnalyticsCard
            title="Total Revenue"
            value="$92,000"
            bgColor="bg-blue-600"
          />

          <AnalyticsCard
            title="Completed Tasks"
            value="320"
            bgColor="bg-green-600"
          />

          <AnalyticsCard
            title="Pending Tasks"
            value="48"
            bgColor="bg-yellow-500"
          />

          <AnalyticsCard
            title="Active Projects"
            value="18"
            bgColor="bg-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <RevenueChart />
          <ProductivityChart />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="text-xl font-bold">
              Employee Performance
            </h2>
          </div>

          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">
                  Employee
                </th>

                <th className="text-left p-4">
                  Department
                </th>

                <th className="text-left p-4">
                  Tasks
                </th>

                <th className="text-left p-4">
                  Hours
                </th>

                <th className="text-left p-4">
                  Productivity
                </th>
              </tr>
            </thead>

            <tbody>
              {performanceData.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {employee.employee}
                  </td>

                  <td className="p-4">
                    {employee.department}
                  </td>

                  <td className="p-4">
                    {employee.completedTasks}
                  </td>

                  <td className="p-4">
                    {employee.hoursWorked}
                  </td>

                  <td className="p-4">
                    {employee.productivity}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default PerformanceReports;