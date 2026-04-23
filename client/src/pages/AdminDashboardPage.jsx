import { startTransition, useEffect, useState } from "react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import BookForm from "../components/BookForm";
import PageLoader from "../components/PageLoader";
import StatusBadge from "../components/StatusBadge";

const AdminDashboardPage = () => {
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [booksResponse, requestsResponse, usersResponse] = await Promise.all([
        api.get("/books"),
        api.get("/borrow"),
        api.get("/users")
      ]);

      startTransition(() => {
        setBooks(booksResponse.data.data);
        setRequests(requestsResponse.data.data);
        setUsers(usersResponse.data.data);
      });
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Could not load admin dashboard."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleBookSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      if (selectedBook) {
        await api.put(`/books/${selectedBook._id}`, formData);
        setSuccess("Book updated successfully.");
      } else {
        await api.post("/books", formData);
        setSuccess("Book added successfully.");
      }

      setSelectedBook(null);
      await loadDashboard();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Could not save book."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (bookId) => {
    const confirmed = window.confirm("Delete this book from the catalog?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await api.delete(`/books/${bookId}`);
      setSuccess("Book deleted successfully.");
      await loadDashboard();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Could not delete book."));
    }
  };

  const handleBorrowAction = async (borrowId, action) => {
    const actionLabels = {
      approve: "approved",
      reject: "rejected",
      return: "marked as returned"
    };

    try {
      setError("");
      setSuccess("");
      await api.patch(`/borrow/${borrowId}/${action}`);
      setSuccess(`Borrow request ${actionLabels[action]} successfully.`);
      await loadDashboard();
    } catch (actionError) {
      setError(getErrorMessage(actionError, `Could not ${action} this request.`));
    }
  };

  if (loading) {
    return <PageLoader label="Loading admin dashboard..." />;
  }

  return (
    <section className="page-content">
      <div className="hero card admin-hero">
        <div>
          <span className="eyebrow">Admin Dashboard</span>
          <h1>Manage books, requests, and members from one workspace.</h1>
        </div>
        <div className="stats-grid">
          <div className="stat-box">
            <strong>{books.length}</strong>
            <span>Total books</span>
          </div>
          <div className="stat-box">
            <strong>{requests.filter((item) => item.status === "pending").length}</strong>
            <span>Pending requests</span>
          </div>
          <div className="stat-box">
            <strong>{users.length}</strong>
            <span>Registered users</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <BookForm
        selectedBook={selectedBook}
        onSubmit={handleBookSubmit}
        onCancel={() => setSelectedBook(null)}
        isSubmitting={isSubmitting}
      />

      <div className="dashboard-grid">
        <div className="card">
          <div className="section-heading">
            <div>
              <h3>Book Catalog</h3>
              <p>Edit, remove, or mark books as available.</p>
            </div>
          </div>

          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.category}</td>
                    <td>{book.available ? "Available" : "Unavailable"}</td>
                    <td className="table-actions">
                      <button type="button" className="button button-secondary" onClick={() => setSelectedBook(book)}>
                        Edit
                      </button>
                      <button type="button" className="button button-danger" onClick={() => handleDelete(book._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="section-heading">
            <div>
              <h3>Borrow Requests</h3>
              <p>Approve, reject, or complete borrow records.</p>
            </div>
          </div>

          <div className="request-list">
            {requests.length === 0 ? (
              <p className="muted-text">No borrow requests yet.</p>
            ) : (
              requests.map((request) => (
                <div key={request._id} className="request-card">
                  <div>
                    <strong>{request.book?.title || "Removed Book"}</strong>
                    <p className="muted-text">
                      {request.user?.name} ({request.user?.email})
                    </p>
                  </div>

                  <div className="request-actions">
                    <StatusBadge status={request.status} />
                    {request.status === "pending" && (
                      <>
                        <button
                          type="button"
                          className="button"
                          onClick={() => handleBorrowAction(request._id, "approve")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="button button-danger"
                          onClick={() => handleBorrowAction(request._id, "reject")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {request.status === "approved" && (
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => handleBorrowAction(request._id, "return")}
                      >
                        Mark Returned
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-heading">
          <div>
            <h3>Users</h3>
            <p>Admin-only member list from the protected `/api/users` endpoint.</p>
          </div>
        </div>

        <div className="user-grid">
          {users.map((member) => (
            <div key={member._id} className="user-tile">
              <strong>{member.name}</strong>
              <p>{member.email}</p>
              <span className="category-pill">{member.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
