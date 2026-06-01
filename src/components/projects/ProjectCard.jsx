import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const ProjectCard = ({ project }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {project.name}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Client: {project.client}
          </p>
        </div>

        <StatusBadge status={project.status} />
      </div>

      <p className="text-gray-600 text-sm mt-4 line-clamp-2">
        {project.description}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Manager</p>
          <p className="font-medium text-sm">{project.manager}</p>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:bg-gray-800"
        >
          View
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;