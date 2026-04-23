const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase() || "pending";

  return <span className={`badge badge-${normalizedStatus}`}>{normalizedStatus}</span>;
};

export default StatusBadge;
