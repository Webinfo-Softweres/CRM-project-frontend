import { customerData } from "../data/customerData";
import { quotationData } from "../data/quotationData";
import { enquiryData } from "../data/enquiryData";
import { usersData } from "../data/usersData";
import { rolesData } from "../data/rolesData";
import { departmentsData } from "../data/departmentsData";
import { projectData } from "../data/projectData";

export function getCustomerById(customerId) {
  return customerData.find((c) => c.id === customerId) ?? null;
}

export function getQuotationById(quotationId) {
  return quotationData.find((q) => q.id === quotationId) ?? null;
}

export function getEnquiryById(enquiryId) {
  return enquiryData.find((e) => e.id === enquiryId) ?? null;
}

export function getUserById(userId) {
  return usersData.find((u) => u.id === userId) ?? null;
}

export function getRoleById(roleId) {
  return rolesData.find((r) => r.id === roleId) ?? null;
}

export function getDepartmentById(departmentId) {
  return departmentsData.find((d) => d.id === departmentId) ?? null;
}

export function getStaffName(userIdOrName) {
  if (typeof userIdOrName === "number") {
    return getUserById(userIdOrName)?.name ?? "—";
  }
  return userIdOrName ?? "—";
}

export function getUserWithRelations(userId) {
  const user = getUserById(userId);
  if (!user) return null;

  const role = getRoleById(user.role_id);
  const department = getDepartmentById(user.department_id);

  return { user, role, department };
}

export function getCustomerLabel(customerId) {
  const customer = getCustomerById(customerId);
  if (!customer) return "—";
  return `${customer.name} (${customer.company_name})`;
}

export function getQuotationLabel(quotationId) {
  const quote = getQuotationById(quotationId);
  if (!quote) return "—";
  return `#${quote.id} — ${quote.description}`;
}

export function getApprovedQuotations() {
  return quotationData.filter(
    (q) => q.status === "Approved" || q.status === "Confirmed",
  );
}

export function getProjectFullContext(projectId) {
  const project = projectData.find((p) => p.id === Number(projectId));
  if (!project) return null;

  const customer = getCustomerById(project.customer_id);
  const quotation = getQuotationById(project.quotation_id);
  const enquiry = quotation ? getEnquiryById(quotation.enquiry_id) : null;

  const enquiryCustomer = enquiry?.customer_id
    ? getCustomerById(enquiry.customer_id)
    : null;

  const assignedStaff = enquiry?.assigned_to
    ? getUserWithRelations(
        typeof enquiry.assigned_to === "number" ? enquiry.assigned_to : null,
      )
    : null;

  const createdBy = quotation?.created_by
    ? getUserWithRelations(quotation.created_by)
    : null;

  const approvedBy = quotation?.approved_by
    ? getUserWithRelations(quotation.approved_by)
    : null;

  return {
    project,
    customer,
    quotation,
    enquiry,
    enquiryCustomer,
    assignedStaff,
    createdBy,
    approvedBy,
  };
}

export function parseDisplayDate(dateStr) {
  if (!dateStr) return 0;
  const timestamp = Date.parse(dateStr);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function getStaffRoleDepartment(staffBundle) {
  if (!staffBundle?.user) {
    return { role: null, department: null };
  }

  return {
    role: staffBundle.role?.role_name ?? staffBundle.user.role ?? null,
    department:
      staffBundle.department?.name ?? staffBundle.user.department ?? null,
  };
}

/** Plain-text staff line: Name · Role · Department */
export function formatStaffLine(staffBundle, fallbackName = null) {
  const name = staffBundle?.user?.name ?? fallbackName;
  if (!name) return null;

  const { role, department } = getStaffRoleDepartment(staffBundle);
  return [name, role, department].filter(Boolean).join(" · ");
}

export function buildProjectTimeline(context) {
  const {
    customer,
    enquiry,
    quotation,
    project,
    assignedStaff,
    createdBy,
    approvedBy,
  } = context;

  const events = [];

  if (customer?.created_at) {
    events.push({
      date: customer.created_at,
      timestamp: parseDisplayDate(customer.created_at),
      title: "Customer added",
      description: `${customer.name} (${customer.company_name}) joined the system`,
      type: "customer",
    });
  }

  if (enquiry?.created_at) {
    const assignedLine = formatStaffLine(assignedStaff);
    let description = `${enquiry.service_required} via ${enquiry.source}`;
    if (assignedLine) {
      description += `. Assigned to ${assignedLine}`;
    }

    events.push({
      date: enquiry.created_at,
      timestamp: parseDisplayDate(enquiry.created_at),
      title: "Enquiry created",
      description,
      type: "enquiry",
    });
  }

  if (quotation?.created_at) {
    const creatorLine = formatStaffLine(createdBy);
    const approverLine = formatStaffLine(approvedBy);
    let description = `₹${Number(quotation.amount).toLocaleString("en-IN")} — ${quotation.description}`;
    if (creatorLine) {
      description += `. Created by ${creatorLine}`;
    }
    if (approverLine) {
      description += `. Approved by ${approverLine}`;
    }

    events.push({
      date: quotation.created_at,
      timestamp: parseDisplayDate(quotation.created_at),
      title: "Quotation created",
      description,
      type: "quotation",
    });
  }

  if (project?.created_at) {
    events.push({
      date: project.created_at,
      timestamp: parseDisplayDate(project.created_at),
      title: "Project started",
      description: `${project.project_name} marked as ${project.status}`,
      type: "project",
    });
  }

  return events.sort((a, b) => a.timestamp - b.timestamp);
}

export function getProjectFullContextFromState({
  projectId,
  projects,
  customers,
  quotations,
  enquiries,
  users,
  roles,
  departments,
}) {
  const project = projects.find((p) => String(p.id) === String(projectId));
  if (!project) return null;

  const getCustomerByIdLocal = (id) => customers.find((c) => String(c.id) === String(id)) ?? null;
  const getQuotationByIdLocal = (id) => quotations.find((q) => String(q.id) === String(id)) ?? null;
  const getEnquiryByIdLocal = (id) => enquiries.find((e) => String(e.id) === String(id)) ?? null;
  const getUserByIdLocal = (id) => users.find((u) => String(u.id) === String(id)) ?? null;
  const getRoleByIdLocal = (id) => roles.find((r) => String(r.id) === String(id)) ?? null;
  const getDepartmentByIdLocal = (id) => departments.find((d) => String(d.id) === String(id)) ?? null;

  const getUserWithRelationsFromState = (userId) => {
    const user = getUserByIdLocal(userId);
    if (!user) return null;

    const role = getRoleByIdLocal(user.role_id);
    const department = getDepartmentByIdLocal(user.department_id);

    return { user, role, department };
  };

  const customer = getCustomerByIdLocal(project.customer_id);
  const quotation = getQuotationByIdLocal(project.quotation_id);
  const enquiry = quotation ? getEnquiryByIdLocal(quotation.enquiry_id) : null;

  const enquiryCustomer = enquiry?.customer_id
    ? getCustomerByIdLocal(enquiry.customer_id)
    : null;

  const assignedStaff = enquiry?.assigned_to
    ? getUserWithRelationsFromState(enquiry.assigned_to)
    : null;

  const createdBy = quotation?.created_by
    ? getUserWithRelationsFromState(quotation.created_by)
    : null;

  const approvedBy = quotation?.approved_by
    ? getUserWithRelationsFromState(quotation.approved_by)
    : null;

  return {
    project,
    customer,
    quotation,
    enquiry,
    enquiryCustomer,
    assignedStaff,
    createdBy,
    approvedBy,
  };
}

export function getStaffNameFromState(userIdOrName, users) {
  if (typeof userIdOrName === "number" || (typeof userIdOrName === "string" && !isNaN(Number(userIdOrName)))) {
    const userId = Number(userIdOrName);
    return users.find((u) => u.id === userId)?.name ?? "—";
  }
  return userIdOrName ?? "—";
}

