import AdminLayout from "../../layouts/AdminLayout";
import RevenueChart from "../../components/charts/RevenueChart";

function RevenueReports() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">
          Revenue Reports
        </h1>

        <RevenueChart />
      </div>
    </AdminLayout>
  );
}

export default RevenueReports;