import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-badge">L</span>
          <div>
            <p>Library Hub</p>
            <small>Borrow smarter, manage faster</small>
          </div>
        </Link>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          {user && <NavLink to="/my-borrows">My Borrowed Books</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Admin Dashboard</NavLink>}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <div className="user-chip">
                <span>{user.name}</span>
                <small>{user.role}</small>
              </div>
              <button type="button" className="button button-secondary" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button button-secondary">
                Login
              </Link>
              <Link to="/register" className="button">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
