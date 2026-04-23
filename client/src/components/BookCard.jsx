import { Link } from "react-router-dom";

const BookCard = ({ book }) => {
  return (
    <article className="card book-card">
      <div className="book-card-top">
        <span className={`badge ${book.available ? "badge-approved" : "badge-pending"}`}>
          {book.available ? "Available" : "Unavailable"}
        </span>
        <span className="category-pill">{book.category}</span>
      </div>

      <div className="book-card-body">
        <h3>{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <p className="muted-text">{book.description.slice(0, 120)}...</p>
      </div>

      <Link to={`/books/${book._id}`} className="button button-block">
        View Details
      </Link>
    </article>
  );
};

export default BookCard;
