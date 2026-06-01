import { Link } from "react-router-dom";

import StatusBadge from "../ui/StatusBadge";

import {
  getCustomerLabel,
  getQuotationLabel,
} from "../../utils/projectHelpers";

const ProjectTable = ({ projects }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr className="text-left text-sm text-gray-500">
            <th className="p-4">ID</th>
            <th className="p-4">Project Name</th>
            <th className="p-4">Customer</th>
            <th className="p-4">Quotation</th>
            <th className="p-4">Start</th>
            <th className="p-4">End</th>
            <th className="p-4">Status</th>
            <th className="p-4">Created</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className="border-t border-gray-100 text-sm"
            >
              <td className="p-4 text-gray-500">#{project.id}</td>

              <td className="p-4 font-medium">{project.project_name}</td>

              <td className="p-4">
                {getCustomerLabel(project.customer_id)}
              </td>

              <td className="p-4">
                {getQuotationLabel(project.quotation_id)}
              </td>

              <td className="p-4">{project.start_date}</td>

              <td className="p-4">{project.end_date}</td>

              <td className="p-4">
                <StatusBadge status={project.status} />
              </td>

              <td className="p-4">{project.created_at}</td>

              <td className="p-4">
                <Link
                  to={`/projects/${project.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;
