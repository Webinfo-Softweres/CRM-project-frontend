import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";

import StatusBadge from "../../components/ui/StatusBadge";

import {
  getProjectFullContextFromState,
  buildProjectTimeline,
  getStaffRoleDepartment,
  getStaffNameFromState,
} from "../../utils/projectHelpers";

import { fetchProjects } from "../../redux/projectSlice";
import { fetchCustomers } from "../../redux/customerSlice";
import { fetchQuotations } from "../../redux/quotationSlice";
import { fetchEnquiries } from "../../redux/enquirySlice";
import { fetchUsers } from "../../redux/userSlice";
import { fetchRoles } from "../../redux/roleSlice";
import { fetchDepartments } from "../../redux/departmentSlice";
import { usePermissions } from "../../hooks/usePermissions";

import {
  ArrowLeft,
  Pencil,
  User,
  ClipboardList,
  FileText,
  FolderKanban,
  Clock,
} from "lucide-react";

import { motion } from "framer-motion";
import AnimatedPage from "../../components/animations/AnimatedPage";
import AnimatedCard from "../../components/animations/AnimatedCard";

import { Link, useParams } from "react-router-dom";

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3.5 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-gray-500 sm:w-44 shrink-0">{label}</dt>
      <dd className="text-sm font-semibold text-slate-800 flex-1">{value ?? "—"}</dd>
    </div>
  );
}

function StaffValue({ staffBundle, fallbackName }) {
  const name = staffBundle?.user?.name ?? fallbackName;
  if (!name) return "—";

  const { role, department } = getStaffRoleDepartment(staffBundle);

  return (
    <span>
      {name}
      {(role || department) && (
        <span className="block text-xs font-normal text-gray-500 mt-1">
          {role && <span>Role: {role}</span>}
          {role && department && <span className="mx-1.5">·</span>}
          {department && <span>Department: {department}</span>}
        </span>
      )}
    </span>
  );
}

function DetailGroup({ title, icon: Icon, iconClass, children }) {
  return (
    <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${iconClass}`}>
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      <dl className="px-6 py-2">{children}</dl>
    </AnimatedCard>
  );
}

const formatTimelineDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate} at ${formattedTime}`;
};

const timelineColors = {
  customer: "bg-green-500",
  enquiry: "bg-orange-500",
  quotation: "bg-purple-500",
  project: "bg-blue-600",
};

function ProjectDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { can } = usePermissions();

  const { items: projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { items: customers, loading: customersLoading } = useSelector((state) => state.customers);
  const { items: quotations, loading: quotationsLoading } = useSelector((state) => state.quotations);
  const { items: enquiries, loading: enquiriesLoading } = useSelector((state) => state.enquiries);
  const { items: users, loading: usersLoading } = useSelector((state) => state.users);
  const { items: roles, loading: rolesLoading } = useSelector((state) => state.roles);
  const { items: departments, loading: departmentsLoading } = useSelector((state) => state.departments);

  useEffect(() => {
    if (projects.length === 0) dispatch(fetchProjects());
    if (customers.length === 0) dispatch(fetchCustomers());
    if (quotations.length === 0) dispatch(fetchQuotations());
    if (enquiries.length === 0) dispatch(fetchEnquiries());
    if (users.length === 0) dispatch(fetchUsers());
    if (roles.length === 0) dispatch(fetchRoles());
    if (departments.length === 0) dispatch(fetchDepartments());
  }, [dispatch, projects.length, customers.length, quotations.length, enquiries.length, users.length, roles.length, departments.length]);

  const isLoading =
    projectsLoading ||
    customersLoading ||
    quotationsLoading ||
    enquiriesLoading ||
    usersLoading ||
    rolesLoading ||
    departmentsLoading;

  const context = getProjectFullContextFromState({
    projectId: id,
    projects,
    customers,
    quotations,
    enquiries,
    users,
    roles,
    departments,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Loading project details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!context) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Project not found</h1>
          <Link
            to="/projects"
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-2xl"
          >
            Back to Projects
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const { project, customer, quotation, enquiry, assignedStaff, createdBy, approvedBy } =
    context;

  const timeline = buildProjectTimeline(context, {
    canReadQuotations: can("quotations:read"),
  });

  const formattedAmount = quotation
    ? `₹${Number(quotation.amount).toLocaleString("en-IN")}`
    : "—";

  return (
    <AdminLayout>
      <AnimatedPage className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link
                to="/projects"
                className="bg-slate-100 hover:bg-slate-200 p-3 rounded-2xl shrink-0 transition-all"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-400">Project #{project.id}</span>
                  <StatusBadge status={project.status} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
                  {project.project_name}
                </h1>
                {customer && (
                  <p className="text-gray-500 mt-1 text-sm">
                    {customer.name} · {customer.company_name}
                  </p>
                )}
              </div>
            </div>
            {can("projects:update") && (
              <Link
                to={`/projects/edit/${project.id}`}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-sm font-medium transition-all"
              >
                <Pencil size={16} />
                Edit Project
              </Link>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* All details */}
          <div className="xl:col-span-2 space-y-5">
            {customer && (
              <DetailGroup
                title="Customer"
                icon={User}
                iconClass="bg-green-100 text-green-600"
              >
                <InfoRow label="Customer Name" value={customer.name} />
                <InfoRow label="Business Name" value={customer.company_name} />
                <InfoRow label="Phone" value={customer.phone} />
                <InfoRow label="Email" value={customer.email} />
                <InfoRow label="Address" value={customer.address} />
              </DetailGroup>
            )}

            {enquiry && (
              <DetailGroup
                title="Enquiry"
                icon={ClipboardList}
                iconClass="bg-orange-100 text-orange-600"
              >
                <InfoRow label="Source" value={enquiry.source} />
                <InfoRow label="Service Type" value={enquiry.service_required} />
                <InfoRow label="Requirement Detail" value={enquiry.description} />
                <InfoRow
                  label="Assigned To"
                  value={
                    <StaffValue
                      staffBundle={assignedStaff}
                      fallbackName={getStaffNameFromState(enquiry.assigned_to, users)}
                    />
                  }
                />
              </DetailGroup>
            )}

            {quotation && (
              <DetailGroup
                title="Quotation"
                icon={FileText}
                iconClass="bg-purple-100 text-purple-600"
              >
                {can("quotations:read") && (
                  <InfoRow label="Amount" value={formattedAmount} />
                )}
                <InfoRow
                  label="Created By"
                  value={<StaffValue staffBundle={createdBy} />}
                />
                <InfoRow
                  label="Approved By"
                  value={<StaffValue staffBundle={approvedBy} />}
                />
              </DetailGroup>
            )}

            <DetailGroup
              title="Project"
              icon={FolderKanban}
              iconClass="bg-blue-100 text-blue-600"
            >
              <InfoRow label="Project Name" value={project.project_name} />
              <InfoRow label="Start Date" value={project.start_date} />
              <InfoRow label="End Date" value={project.end_date} />
              <InfoRow
                label="Status"
                value={<StatusBadge status={project.status} />}
              />
            </DetailGroup>
          </div>

          {/* Timeline */}
          <div className="xl:col-span-1">
            <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                  <Clock size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Timeline</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ordered by created date
                  </p>
                </div>
              </div>

              {timeline.length === 0 ? (
                <p className="text-sm text-gray-500">No timeline events available.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />

                  <ul className="space-y-6">
                    {timeline.map((event, index) => (
                      <li key={`${event.type}-${index}`} className="relative pl-8">
                        <span
                          className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white ${timelineColors[event.type]}`}
                        />

                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          {formatTimelineDate(event.date)}
                        </p>

                        <p className="font-semibold text-slate-800 mt-1">
                          {event.title}
                        </p>

                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                          {event.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AnimatedCard>
          </div>
        </div>

      </AnimatedPage>
    </AdminLayout>
  );
}

export default ProjectDetails;
