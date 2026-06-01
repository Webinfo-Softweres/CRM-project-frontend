import AdminLayout from "../../layouts/AdminLayout";

function DepartmentReports() {
  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-6">
          Department Analytics
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-blue-100 p-5 rounded">
            <h2 className="text-xl font-bold">
              Development
            </h2>

            <p className="mt-3">
              Productivity: 92%
            </p>
          </div>

          <div className="bg-green-100 p-5 rounded">
            <h2 className="text-xl font-bold">
              SEO
            </h2>

            <p className="mt-3">
              Productivity: 80%
            </p>
          </div>

          <div className="bg-yellow-100 p-5 rounded">
            <h2 className="text-xl font-bold">
              Marketing
            </h2>

            <p className="mt-3">
              Productivity: 88%
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default DepartmentReports;