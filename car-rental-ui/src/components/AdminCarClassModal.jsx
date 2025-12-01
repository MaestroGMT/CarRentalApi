import { useState } from "react";
import { createCarClass, updateCarClass } from "../api";
import { useAuth } from "../context/AuthContext";

function AdminCarClassModal({ mode = "create", carClass, onClose, onSuccess }) {
  const { accessToken } = useAuth();
  const [name, setName] = useState(carClass?.name || "");
  const [description, setDescription] = useState(carClass?.description || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    try {
      setSubmitting(true);
      if (mode === "create") {
        await createCarClass(accessToken, { name, description });
      } else if (carClass) {
        await updateCarClass(accessToken, carClass.id, { name, description });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to save car class.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <button
          type="button"
          className="modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
        <h2>{mode === "create" ? "Add car class" : "Edit car class"}</h2>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminCarClassModal;
