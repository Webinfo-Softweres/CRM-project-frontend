import AdminLayout from "../../layouts/AdminLayout";

function DailyWorkReport() {
  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-6">
          Daily Work Report
        </h1>

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Task Name"
            className="w-full border p-3 rounded"
          />

          <input
            type="number"
            placeholder="Hours Worked"
            className="w-full border p-3 rounded"
          />

          <textarea
            placeholder="Work Summary"
            className="w-full border p-3 rounded h-40"
          ></textarea>

          <button className="bg-blue-600 text-white px-6 py-3 rounded">
            Submit Report
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default DailyWorkReport;