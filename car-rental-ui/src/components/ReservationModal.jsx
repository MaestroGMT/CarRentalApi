import { useEffect, useMemo, useState } from "react";
import { createReservation, getCarReservations } from "../api";
import { useAuth } from "../context/AuthContext";

function ReservationModal({ car, onClose, onSuccess }) {
  const { accessToken } = useAuth();
  const [customerName, setCustomerName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [conflict, setConflict] = useState(false);

  useEffect(() => {
    async function load() {
      setLoadingReservations(true);
      setError("");
      try {
        const data = await getCarReservations(accessToken, car.id);
        setReservations(data);
      } catch (err) {
        setError(err.message || "Failed to load availability.");
      } finally {
        setLoadingReservations(false);
      }
    }
    load();
  }, [accessToken, car.id]);

  const hasOverlap = useMemo(() => {
    if (!dateFrom || !dateTo) return false;
    const start = new Date(`${dateFrom}T00:00:00Z`);
    const end = new Date(`${dateTo}T00:00:00Z`);
    return reservations.some((r) => {
      const rStart = new Date(r.dateFrom);
      const rEnd = new Date(r.dateTo);
      return rStart < end && start < rEnd;
    });
  }, [dateFrom, dateTo, reservations]);

  useEffect(() => {
    setConflict(hasOverlap);
  }, [hasOverlap]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!customerName || !dateFrom || !dateTo) {
      setError("Please fill all fields.");
      return;
    }

    if (hasOverlap) {
      setConflict(true);
      setError("Car is already reserved on these days.");
      return;
    }

    try {
      setSubmitting(true);

      await createReservation(accessToken, {
        customerName,
        dateFrom: new Date(`${dateFrom}T00:00:00`).toISOString(),
        dateTo: new Date(`${dateTo}T00:00:00`).toISOString(),
        carId: car.id
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to create reservation.");
    } finally {
      setSubmitting(false);
    }
  }

  const errorId = conflict || error ? "reservation-error" : undefined;

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
        <h2>Reserve {car.brand} {car.model}</h2>
        <p className="hint">Plate: {car.plateNumber}</p>

        <div className="reserved-ranges">
          <p className="hint">Booked dates:</p>
          {loadingReservations ? (
            <p className="hint">Loading...</p>
          ) : reservations.length === 0 ? (
            <p className="hint">No existing reservations.</p>
          ) : (
            <div className="reserved-tags">
              {reservations.map((r) => (
                <span key={r.id} className="reserved-tag">
                  {new Date(r.dateFrom).toLocaleDateString()} –{" "}
                  {new Date(r.dateTo).toLocaleDateString()}
                </span>
              ))}
            </div>
          )}
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Your name
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter full name"
              aria-describedby={errorId}
              required
            />
          </label>

          <label>
            Start date
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={conflict ? "input-conflict" : ""}
              aria-describedby={errorId}
              required
            />
          </label>

          <label>
            End date
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={conflict ? "input-conflict" : ""}
              aria-describedby={errorId}
              required
            />
          </label>

          {conflict && (
            <p id="reservation-error" className="error" role="alert" aria-live="assertive">
              Car is already reserved on these days.
            </p>
          )}
          {error && !conflict && (
            <p id="reservation-error" className="error" role="alert" aria-live="assertive">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Confirm reservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservationModal;
