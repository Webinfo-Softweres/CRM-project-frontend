import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import AdminLayout from "../../layouts/AdminLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import AnimatedPage from "../../components/animations/AnimatedPage";
import AnimatedCard from "../../components/animations/AnimatedCard";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
  IndianRupee,
  User,
  ClipboardList,
  Pencil,
  AlertTriangle,
  Download,
} from "lucide-react";

import { fetchQuotations } from "../../redux/quotationSlice";
import { fetchEnquiries } from "../../redux/enquirySlice";
import { fetchCustomers } from "../../redux/customerSlice";
import { fetchUsers } from "../../redux/userSlice";
import { fetchDepartments } from "../../redux/departmentSlice";
import { fetchRoles } from "../../redux/roleSlice";

import { usePermissions } from "../../hooks/usePermissions";
import { getStaffNameFromState } from "../../utils/projectHelpers";
import { generateQuotationPDF } from "../../utils/pdfGenerator";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// ── Sub-components ────────────────────────────────────────────────────────────
function InfoRow({ label, value, fullWidth }) {
  return (
    <div className={`flex flex-col ${fullWidth ? '' : 'sm:flex-row sm:items-start'} gap-1 ${fullWidth ? '' : 'sm:gap-4'} py-3.5 border-b border-gray-100 last:border-0`}>
      <dt className={`text-sm text-gray-500 ${fullWidth ? '' : 'sm:w-44 shrink-0'}`}>{label}</dt>
      <dd className="text-sm font-semibold text-slate-800 flex-1 whitespace-pre-wrap">
        {value ?? "—"}
      </dd>
    </div>
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

// ── QuotationDetails Page ─────────────────────────────────────────────────────
function QuotationDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { can } = usePermissions();

  const { items: quotations, loading: quotationsLoading } = useSelector((s) => s.quotations);
  const { items: enquiries, loading: enquiriesLoading } = useSelector((s) => s.enquiries);
  const { items: customers, loading: customersLoading } = useSelector((s) => s.customers);
  const { items: users, loading: usersLoading } = useSelector((s) => s.users);
  const { items: departments, loading: departmentsLoading } = useSelector((s) => s.departments);
  const { items: roles, loading: rolesLoading } = useSelector((s) => s.roles);

  useEffect(() => {
    if (quotations.length === 0) dispatch(fetchQuotations());
    if (enquiries.length === 0) dispatch(fetchEnquiries());
    if (customers.length === 0) dispatch(fetchCustomers());
    if (users.length === 0) dispatch(fetchUsers());
    if (departments.length === 0) dispatch(fetchDepartments());
    if (roles.length === 0) dispatch(fetchRoles());
  }, [dispatch, quotations.length, enquiries.length, customers.length, users.length, departments.length, roles.length]);

  const isLoading =
    quotationsLoading || enquiriesLoading || customersLoading ||
    usersLoading || departmentsLoading || rolesLoading;

  const quote = quotations.find((q) => String(q.id) === String(id));

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading && !quote) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading quotation details...</p>
        </div>
      </AdminLayout>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!isLoading && !quote) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Quotation not found</h2>
          <p className="text-gray-500 mt-2">The quotation you are looking for does not exist.</p>
          <Link to="/quotations" className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium">
            Back to Quotations
          </Link>
        </div>
      </AdminLayout>
    );
  }

  // ── Resolved relationships — MUST come before handleDownloadQuotation ──────
  const enquiry = enquiries.find((e) => String(e.id) === String(quote.enquiry_id));
  const customer = enquiry ? customers.find((c) => String(c.id) === String(enquiry.customer_id)) : null;

  // ── Download handler — defined AFTER enquiry & customer are resolved ───────
  const handleDownloadQuotation = async () => {
    await generateQuotationPDF({ quote, customer, enquiry });
  };

  const creatorName = getStaffNameFromState(quote.created_by, users);
  const approverName = getStaffNameFromState(quote.approved_by, users);

  const formattedAmount = `₹${Number(quote.amount).toLocaleString("en-IN")}`;

  const timeline = [
    {
      date: "Created",
      title: "Quotation generated",
      description: `${formatDate(quote.created_at)} at ${formatTime(quote.created_at)}`,
      color: "bg-blue-600",
    },
    {
      date: "Status",
      title: "Current status",
      description: quote.status || "Draft",
      color:
        quote.status === "Approved" ? "bg-green-500" :
          quote.status === "Confirmed" ? "bg-blue-500" :
            quote.status === "Rejected" ? "bg-red-500" :
              "bg-orange-500",
    },
  ];

  return (
    <AdminLayout>
      <AnimatedPage className="space-y-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link
                to="/quotations"
                className="bg-slate-100 hover:bg-slate-200 p-3 rounded-2xl shrink-0 transition-all"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-400">Quotation #{quote.id}</span>
                  <StatusBadge status={quote.status} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
                  Quotation Details
                </h1>
                {customer && (
                  <p className="text-gray-500 mt-1 text-sm">
                    For {customer.name} · {customer.company_name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {can("quotations:read") && (
                <button
                  onClick={handleDownloadQuotation}
                  className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all"
                >
                  <Download size={16} />
                  Download
                </button>
              )}
              {can("quotations:update") && (
                <Link
                  to={`/quotations/edit/${quote.id}`}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-sm font-medium transition-all"
                >
                  <Pencil size={16} />
                  Edit Quotation
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Body ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left */}
          <div className="xl:col-span-2 space-y-5">
            <DetailGroup title="Quotation Information" icon={FileText} iconClass="bg-purple-100 text-purple-600">
              <InfoRow label="Description" value={quote.description || "—"} fullWidth={true} />
              {can("quotations:read") && <InfoRow label="Amount" value={formattedAmount} />}
              <InfoRow label="Status" value={<StatusBadge status={quote.status} />} />
              <InfoRow label="Created By" value={creatorName} />
              <InfoRow label="Approved By" value={approverName} />
              <InfoRow label="Created On" value={`${formatDate(quote.created_at)} at ${formatTime(quote.created_at)}`} />
            </DetailGroup>

            {customer && (
              <DetailGroup title="Customer" icon={User} iconClass="bg-green-100 text-green-600">
                <InfoRow label="Customer Name" value={customer.name} />
                <InfoRow label="Business Name" value={customer.company_name} />
                <InfoRow label="Phone" value={customer.phone} />
                <InfoRow label="Email" value={customer.email} />
              </DetailGroup>
            )}

            {enquiry && (
              <DetailGroup title="Related Enquiry" icon={ClipboardList} iconClass="bg-orange-100 text-orange-600">
                <InfoRow label="Enquiry ID" value={`#${enquiry.id}`} />
                <InfoRow label="Source" value={enquiry.source} />
                <InfoRow label="Service Type" value={enquiry.service_required} />
                <InfoRow label="Requirement" value={enquiry.description} fullWidth={true} />
              </DetailGroup>
            )}
          </div>

          {/* Right — timeline */}
          <div className="xl:col-span-1">
            <AnimatedCard className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                  <Clock size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Timeline</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Activity history</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
                <ul className="space-y-6">
                  {timeline.map((event, index) => (
                    <li key={`${event.title}-${index}`} className="relative pl-8">
                      <span className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white ${event.color}`} />
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{event.date}</p>
                      <p className="font-semibold text-slate-800 mt-1">{event.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{event.description}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {can("quotations:read") && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="bg-indigo-50 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                      <p className="text-lg font-bold text-indigo-700 mt-0.5">{formattedAmount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <IndianRupee size={20} />
                    </div>
                  </div>
                </div>
              )}
            </AnimatedCard>
          </div>
        </div>
      </AnimatedPage>
    </AdminLayout>
  );
}

export default QuotationDetails;