import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <section className="page-content">
      <div className="card centered-card">
        <h1>404</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="button">
          Back to Home
        </Link>
      </div>
    </section>
  );
};

export default NotFoundPage;
