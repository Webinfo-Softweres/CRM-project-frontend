function StatusBadge({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case "Active":
      case "Ongoing":
        return "bg-green-100 text-green-700";

      case "Pending":
      case "Hold":
        return "bg-yellow-100 text-yellow-700";

      case "Completed":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
