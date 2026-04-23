import { useEffect, useState } from "react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import PageLoader from "../components/PageLoader";
import StatusBadge from "../components/StatusBadge";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "Not returned yet");

const MyBorrowedBooksPage = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeId, setActiveId] = useState("");

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const response = await api.get("/borrow/mine");
      setBorrows(response.data.data);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Could not load your borrow history."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  const handleReturn = async (borrowId) => {
    try {
      setActiveId(borrowId);
      setError("");
      setSuccess("");
      await api.patch(`/borrow/${borrowId}/return`);
      setSuccess("Book returned successfully.");
      await fetchBorrows();
    } catch (returnError) {
      setError(getErrorMessage(returnError, "Could not return the book."));
    } finally {
      setActiveId("");
    }
  };

  if (loading) {
    return <PageLoader label="Loading your borrowed books..." />;
  }

  return (
    <section className="page-content">
      <div className="section-heading">
        <div>
          <h1>My Borrowed Books</h1>
          <p>Track your requests, approvals, and returns in one place.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {borrows.length === 0 ? (
        <div className="card centered-card">
          <h3>No borrow activity yet</h3>
          <p>Browse the catalog and request your first book.</p>
        </div>
      ) : (
        <div className="stack-column">
          {borrows.map((borrow) => (
            <article key={borrow._id} className="card borrow-card">
              <div>
                <h3>{borrow.book?.title || "Removed Book"}</h3>
                <p className="muted-text">{borrow.book?.author}</p>
              </div>

              <div className="borrow-details">
                <div>
                  <span className="detail-label">Status</span>
                  <StatusBadge status={borrow.status} />
                </div>
                <div>
                  <span className="detail-label">Borrow Date</span>
                  <p>{formatDate(borrow.borrowDate)}</p>
                </div>
                <div>
                  <span className="detail-label">Return Date</span>
                  <p>{formatDate(borrow.returnDate)}</p>
                </div>
              </div>

              {borrow.status === "approved" && (
                <button
                  type="button"
                  className="button"
                  onClick={() => handleReturn(borrow._id)}
                  disabled={activeId === borrow._id}
                >
                  {activeId === borrow._id ? "Returning..." : "Return Book"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyBorrowedBooksPage;
