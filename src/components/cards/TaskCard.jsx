import { Link } from "react-router-dom";

import StatusBadge from "../ui/StatusBadge";
import PriorityBadge from "../ui/PriorityBadge";

import {
  Clock3,
  User2,
  Building2,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { motion } from "framer-motion";

function TaskCard({ task }) {
  return (
    <Link to="/tasks/details" className="h-full block">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-200 hover:border-blue-200 hover:shadow-blue-100 hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-between"
      >
        <div className="p-6 flex flex-col h-full">
          {/* TOP CONTENT */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 leading-snug">
                  {task.title}
                </h2>

                <p className="text-gray-500 mt-1 text-sm">{task.project}</p>
              </div>

              <PriorityBadge priority={task.priority} />
            </div>

            {/* Info */}
            <div className="mt-6 space-y-4">
              {/* Assigned */}
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <User2 size={18} className="text-blue-600" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Assigned To</p>

                  <h4 className="font-semibold text-slate-700 text-sm">
                    {task.assignedTo}
                  </h4>
                </div>
              </div>

              {/* Department */}
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Building2 size={18} className="text-purple-600" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Department</p>

                  <h4 className="font-semibold text-slate-700 text-sm">
                    {task.department}
                  </h4>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl">
                  <Clock3 size={18} className="text-orange-500" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Estimated Hours</p>

                  <h4 className="font-semibold text-slate-700 text-sm">
                    {task.hours} hrs
                  </h4>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-xl">
                  <CalendarDays size={18} className="text-red-500" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Due Date</p>

                  <h4 className="font-semibold text-slate-700 text-sm">
                    {task.dueDate}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM CONTENT */}
          <div className="mt-6">
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Progress</span>

                <span className="text-sm font-semibold text-slate-700">
                  {task.progress}%
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${task.progress}%`,
                  }}
                  transition={{ duration: 0.8 }}
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                />
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-6 flex items-center justify-between">
              <StatusBadge status={task.status} />

              <button className="flex items-center gap-2 text-blue-600 font-medium text-sm hover:text-blue-700 transition-all">
                View Details
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Completion Message */}
            {task.progress === 100 && (
              <div className="mt-5 bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-600" />

                <p className="text-sm font-medium text-green-700">
                  Task completed successfully
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default TaskCard;
