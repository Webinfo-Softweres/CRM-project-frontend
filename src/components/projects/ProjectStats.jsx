const ProjectStats = ({ projects }) => {
  const total = projects.length;

  const completed = projects.filter(
    (p) => p.status === "Completed"
  ).length;

  const pending = projects.filter(
    (p) => p.status === "Pending"
  ).length;

  const progress = projects.filter(
    (p) => p.status === "In Progress"
  ).length;

  const stats = [
    { label: "Total Projects", value: total },
    { label: "Completed", value: completed },
    { label: "Pending", value: pending },
    { label: "In Progress", value: progress },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-2xl p-5 border border-gray-100"
        >
          <p className="text-sm text-gray-500">{item.label}</p>

          <h2 className="text-3xl font-bold mt-2">
            {item.value}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default ProjectStats;