import { useEffect, useState } from "react";
import { getMyReservations, deleteReservation } from "../api";
import { useAuth } from "../context/AuthContext";
import AdminEditReservationModal from "./AdminEditReservationModal";
import AdminCreateCarModal from "./AdminCreateCarModal";

function AdminPanel() {
  const { accessToken, isAdmin, isLoggedIn } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) return;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getMyReservations(accessToken);
        setReservations(data);
      } catch (err) {
        setError(err.message || "Failed to load reservations.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [accessToken, isLoggedIn, isAdmin, refreshTick]);

  async function handleDelete(id) {
    if (!window.confirm("Cancel this reservation?")) return;
    setBusyId(id);
    setError("");
    try {
      await deleteReservation(accessToken, id);
      setReservations((list) => list.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete reservation.");
    } finally {
      setBusyId(null);
    }
  }

  if (!isLoggedIn || !isAdmin) return <p>Admins only.</p>;
  if (loading) return <p>Loading admin data...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <section className="reservations-section">
      <div className="admin-header">
        <h1>Admin panel</h1>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>
          Add new car
        </button>
      </div>
      <div className="reservations-list admin-list">
        {reservations.length === 0 ? (
          <p>No reservations in the system.</p>
        ) : (
          reservations.map((res) => (
            <div key={res.id} className="reservation-card">
              {res.carImageUrl && (
                <div className="reservation-image small">
                  <img src={res.carImageUrl} alt={`Car ${res.carPlateNumber}`} />
                </div>
              )}
              <h2>{res.customerName}</h2>
              <p className="car-plate">Car: {res.carPlateNumber}</p>
              <p className="car-class">
                From: {new Date(res.dateFrom).toLocaleDateString()}<br />
                To: {new Date(res.dateTo).toLocaleDateString()}
              </p>
              <p className="hint">User ID: {res.userId}</p>
              <div className="admin-actions">
                <button
                  className="btn-outline dark"
                  onClick={() => handleDelete(res.id)}
                  disabled={busyId === res.id}
                >
                  {busyId === res.id ? "Canceling..." : "Cancel reservation"}
                </button>
                <button className="btn-primary" onClick={() => setEditing(res)}>
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {createOpen && (
        <AdminCreateCarModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => {
            setCreateOpen(false);
            // cars list not shown here, so just a confirmation
            alert("Car created successfully.");
          }}
        />
      )}

      {editing && (
        <AdminEditReservationModal
          reservation={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            setRefreshTick((prev) => prev + 1);
          }}
        />
      )}
    </section>
  );
}

export default AdminPanel;
