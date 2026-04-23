import { useEffect, useState } from "react";

const initialState = {
  title: "",
  author: "",
  description: "",
  category: "",
  available: true
};

const BookForm = ({ selectedBook, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedBook) {
      setFormData({
        title: selectedBook.title || "",
        author: selectedBook.author || "",
        description: selectedBook.description || "",
        category: selectedBook.category || "",
        available: selectedBook.available ?? true
      });
    } else {
      setFormData(initialState);
    }
  }, [selectedBook]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title || !formData.author || !formData.description || !formData.category) {
      setError("All book fields are required.");
      return;
    }

    setError("");
    await onSubmit(formData);
    setFormData(initialState);
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <h3>{selectedBook ? "Edit Book" : "Add New Book"}</h3>
          <p>Keep your catalog fresh and searchable.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-grid">
        <label>
          Title
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Book title" />
        </label>
        <label>
          Author
          <input name="author" value={formData.author} onChange={handleChange} placeholder="Author name" />
        </label>
        <label>
          Category
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Programming, Fiction..." />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
          />
          Mark as available
        </label>
      </div>

      <label>
        Description
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="5"
          placeholder="Write a short description"
        />
      </label>

      <div className="button-row">
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : selectedBook ? "Update Book" : "Add Book"}
        </button>
        {selectedBook && (
          <button type="button" className="button button-secondary" onClick={onCancel}>
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
};

export default BookForm;
