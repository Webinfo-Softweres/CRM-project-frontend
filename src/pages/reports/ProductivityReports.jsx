import AdminLayout from "../../layouts/AdminLayout";
import ProductivityChart from "../../components/charts/ProductivityChart";

function ProductivityReports() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">
          Productivity Reports
        </h1>

        <ProductivityChart />
      </div>
    </AdminLayout>
  );
}

export default ProductivityReports;