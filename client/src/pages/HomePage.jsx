import { useDeferredValue, useEffect, useState } from "react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import BookCard from "../components/BookCard";
import PageLoader from "../components/PageLoader";

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get("/books");
        setAllBooks(response.data.data);
      } catch (loadError) {
        console.error(getErrorMessage(loadError));
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError("");
        const params = {};

        if (deferredSearch.trim()) {
          params.search = deferredSearch.trim();
        }

        if (category) {
          params.category = category;
        }

        const response = await api.get("/books", {
          params,
          signal: controller.signal
        });

        setBooks(response.data.data);
      } catch (fetchError) {
        if (fetchError.name !== "CanceledError") {
          setError(getErrorMessage(fetchError, "Could not load books."));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();

    return () => controller.abort();
  }, [deferredSearch, category]);

  const categories = [...new Set(allBooks.map((book) => book.category))];

  return (
    <section className="page-content">
      <div className="hero card">
        <div>
          <span className="eyebrow">Library Management System</span>
          <h1>Find, borrow, and manage books without the clutter.</h1>
          <p>
            Search by title or author, filter by category, and handle borrowing workflows with a
            friendly interface for both readers and admins.
          </p>
        </div>
        <div className="stats-grid">
          <div className="stat-box">
            <strong>{allBooks.length}</strong>
            <span>Books in catalog</span>
          </div>
          <div className="stat-box">
            <strong>{allBooks.filter((book) => book.available).length}</strong>
            <span>Currently available</span>
          </div>
        </div>
      </div>

      <div className="card filter-bar">
        <label>
          Search books
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or author"
          />
        </label>

        <label>
          Filter by category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <PageLoader label="Fetching books..." />
      ) : books.length === 0 ? (
        <div className="card centered-card">
          <h3>No books found</h3>
          <p>Try a different search term or category filter.</p>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomePage;
