function AnalyticsCard({
  title,
  value,
  bgColor,
}) {
  return (
    <div className={`${bgColor} p-5 rounded-lg text-white shadow`}>
      <h2 className="text-lg">
        {title}
      </h2>

      <p className="text-3xl font-bold mt-3">
        {value}
      </p>
    </div>
  );
}

export default AnalyticsCard;