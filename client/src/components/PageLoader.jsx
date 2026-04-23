const PageLoader = ({ label = "Loading..." }) => {
  return (
    <div className="card centered-card">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
};

export default PageLoader;
