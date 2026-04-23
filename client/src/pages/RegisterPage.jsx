import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import getErrorMessage from "../api/getErrorMessage";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: ""
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email, and password are required.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const user = await register(formData);
      navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Registration failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="card auth-card">
        <div className="section-heading">
          <div>
            <h2>Create Account</h2>
            <p>Start borrowing books and tracking library requests in one place.</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            Full Name
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Jane Doe" />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
            />
          </label>

          <button type="submit" className="button button-block" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
        <p className="muted-text">
          Admin accounts should be created manually or through the provided seed script.
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;
