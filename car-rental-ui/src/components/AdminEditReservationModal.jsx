import { useState } from "react";
import { updateReservation } from "../api";
import { useAuth } from "../context/AuthContext";

function AdminEditReservationModal({ reservation, onClose, onSuccess }) {
  const { accessToken } = useAuth();
  const [customerName, setCustomerName] = useState(reservation.customerName);
  const [dateFrom, setDateFrom] = useState(
    reservation.dateFrom ? reservation.dateFrom.slice(0, 10) : ""
  );
  const [dateTo, setDateTo] = useState(
    reservation.dateTo ? reservation.dateTo.slice(0, 10) : ""
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!customerName || !dateFrom || !dateTo) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setSubmitting(true);
      await updateReservation(accessToken, reservation.id, {
        customerName,
        dateFrom: new Date(`${dateFrom}T00:00:00`).toISOString(),
        dateTo: new Date(`${dateTo}T00:00:00`).toISOString(),
        carId: reservation.carId
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to update reservation.");
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
        <h2>Edit reservation</h2>
        <p className="hint">Car plate: {reservation.carPlateNumber}</p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Customer name
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </label>

          <label>
            Start date
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              required
            />
          </label>

          <label>
            End date
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminEditReservationModal;
