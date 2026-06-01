import StatusBadge from "../ui/StatusBadge";

import { CalendarDays, User, FileText, ArrowUpRight } from "lucide-react";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import {
  getCustomerLabel,
  getQuotationLabel,
} from "../../utils/projectHelpers";

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className="h-full block">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all p-6 h-full flex flex-col justify-between"
      >
        <div>
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium">
                #{project.id}
              </p>

              <h2 className="text-2xl font-bold text-slate-800 leading-tight mt-1">
                {project.project_name}
              </h2>

              <p className="text-gray-500 mt-2 text-sm flex items-center gap-1">
                <User size={14} />
                {getCustomerLabel(project.customer_id)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={project.status} />

              <div className="bg-gray-100 p-2 rounded-xl">
                <ArrowUpRight size={18} className="text-slate-600" />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-2xl">
                <FileText size={18} className="text-purple-600" />
              </div>

              <div>
                <p className="text-xs text-gray-400">Approved Quote</p>

                <p className="font-semibold text-slate-700 text-sm">
                  {getQuotationLabel(project.quotation_id)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <CalendarDays size={18} className="text-blue-600" />
              </div>

              <div>
                <p className="text-xs text-gray-400">Timeline</p>

                <p className="font-semibold text-slate-700 text-sm">
                  {project.start_date} → {project.end_date}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Created</p>

            <p className="text-sm font-medium text-slate-700">
              {project.created_at}
            </p>
          </div>

          <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold">
            View Details
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

export default ProjectCard;
