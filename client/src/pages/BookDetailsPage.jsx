import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import PageLoader from "../components/PageLoader";
import { useAuth } from "../context/AuthContext";

const BookDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/books/${id}`);
      setBook(response.data.data);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Could not load this book."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  const handleBorrow = async () => {
    try {
      setIsSubmitting(true);
      setSuccess("");
      setError("");
      await api.post("/borrow", { bookId: id });
      setSuccess("Borrow request submitted. An admin can now approve it.");
    } catch (borrowError) {
      setError(getErrorMessage(borrowError, "Could not create borrow request."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewChange = (event) => {
    setReviewData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!reviewData.comment.trim()) {
      setError("Please write a short review comment.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");
      const response = await api.post(`/books/${id}/reviews`, {
        rating: Number(reviewData.rating),
        comment: reviewData.comment.trim()
      });
      setBook(response.data.data);
      setReviewData({ rating: 5, comment: "" });
      setSuccess("Review saved successfully.");
    } catch (reviewError) {
      setError(getErrorMessage(reviewError, "Could not save review."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading book details..." />;
  }

  if (!book) {
    return (
      <div className="card centered-card">
        <h3>Book not found</h3>
      </div>
    );
  }

  return (
    <section className="page-content details-layout">
      <div className="card details-card">
        <div className="details-meta">
          <span className={`badge ${book.available ? "badge-approved" : "badge-pending"}`}>
            {book.available ? "Available" : "Currently borrowed"}
          </span>
          <span className="category-pill">{book.category}</span>
        </div>

        <h1>{book.title}</h1>
        <p className="book-author">by {book.author}</p>
        <p className="muted-text">{book.description}</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {user && user.role !== "admin" && (
          <button
            type="button"
            className="button"
            onClick={handleBorrow}
            disabled={!book.available || isSubmitting}
          >
            {!book.available ? "Book Unavailable" : isSubmitting ? "Submitting..." : "Request Borrow"}
          </button>
        )}
      </div>

      <div className="stack-column">
        <div className="card">
          <div className="section-heading">
            <div>
              <h3>Reader Reviews</h3>
              <p>{book.reviews.length} review(s) from your library community</p>
            </div>
          </div>

          {book.reviews.length === 0 ? (
            <p className="muted-text">No reviews yet. Be the first to leave one.</p>
          ) : (
            <div className="review-list">
              {book.reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <strong>{review.user?.name || "Reader"}</strong>
                    <span>{review.rating}/5</span>
                  </div>
                  <p>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {user && (
          <form className="card form-card" onSubmit={handleReviewSubmit}>
            <div className="section-heading">
              <div>
                <h3>Leave a Review</h3>
                <p>Share a quick rating and note for other readers.</p>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Rating
                <select name="rating" value={reviewData.rating} onChange={handleReviewChange}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Comment
              <textarea
                name="comment"
                rows="4"
                value={reviewData.comment}
                onChange={handleReviewChange}
                placeholder="What did you think about this book?"
              />
            </label>

            <button type="submit" className="button" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default BookDetailsPage;
