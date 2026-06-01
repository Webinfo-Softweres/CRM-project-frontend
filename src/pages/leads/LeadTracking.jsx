// src/pages/leads/LeadTracking.jsx

import AdminLayout from "../../layouts/AdminLayout";

import { motion } from "framer-motion";

import {
  Plus,
  Search,
  Filter,
  User,
  Phone,
  Mail,
  CalendarDays,
  BadgeCheck,
  Clock3,
  CircleDashed,
  MoreVertical,
  TrendingUp,
} from "lucide-react";

import { Link } from "react-router-dom";

import { leadData } from "../../data/leadData";

function LeadTracking() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Lead Tracking
            </h1>

            <p className="text-gray-500 mt-1">
              Track sales pipeline and customer conversion
            </p>
          </div>

          <Link
            to="/leads/add"
            className="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg"
          >
            <Plus size={18} />
            Add Lead
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl shadow-sm p-5">
            <p className="text-gray-500 text-sm">Total Leads</p>

            <h2 className="text-3xl font-bold mt-2">
              {leadData.length}
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-5">
            <p className="text-gray-500 text-sm">New Leads</p>

            <h2 className="text-3xl font-bold mt-2 text-orange-500">
              {
                leadData.filter(
                  (lead) => lead.status === "New",
                ).length
              }
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-5">
            <p className="text-gray-500 text-sm">In Progress</p>

            <h2 className="text-3xl font-bold mt-2 text-blue-600">
              {
                leadData.filter(
                  (lead) => lead.status === "In Progress",
                ).length
              }
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-5">
            <p className="text-gray-500 text-sm">Converted</p>

            <h2 className="text-3xl font-bold mt-2 text-green-600">
              {
                leadData.filter(
                  (lead) => lead.status === "Converted",
                ).length
              }
            </h2>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3 w-full lg:w-96">
            <Search size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="Search leads..."
              className="bg-transparent outline-none ml-3 w-full text-sm"
            />
          </div>

          <button className="flex items-center gap-2 border border-gray-300 px-5 py-3 rounded-2xl hover:bg-gray-100 transition-all">
            <Filter size={18} />
            Filter
          </button>
        </div>

        {/* Lead Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl shadow-sm overflow-hidden"
        >
          {/* Table Header */}
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-slate-800">
              Lead List
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-5 text-sm font-semibold text-slate-600">
                    Lead
                  </th>

                  <th className="text-left p-5 text-sm font-semibold text-slate-600">
                    Contact
                  </th>

                  <th className="text-left p-5 text-sm font-semibold text-slate-600">
                    Service
                  </th>

                  <th className="text-left p-5 text-sm font-semibold text-slate-600">
                    Follow Up
                  </th>

                  <th className="text-left p-5 text-sm font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="text-left p-5 text-sm font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {leadData.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b hover:bg-slate-50 transition-all"
                  >
                    {/* Lead */}
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                          <User className="text-blue-600" />
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {lead.name}
                          </h3>

                          <p className="text-sm text-gray-500">
                            {lead.company}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          {lead.email}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {lead.phone}
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="p-5">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                        <TrendingUp size={12} />
                        {lead.service}
                      </span>
                    </td>

                    {/* Follow Up */}
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays size={14} />
                        {lead.follow_up}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit
                        
                        ${
                          lead.status === "New"
                            ? "bg-orange-100 text-orange-700"
                            : lead.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {lead.status === "New" && (
                          <Clock3 size={12} />
                        )}

                        {lead.status === "In Progress" && (
                          <CircleDashed size={12} />
                        )}

                        {lead.status === "Converted" && (
                          <BadgeCheck size={12} />
                        )}

                        {lead.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-5">
                      <button className="hover:bg-gray-100 p-2 rounded-xl transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default LeadTracking;