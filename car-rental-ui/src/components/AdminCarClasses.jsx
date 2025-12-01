import { useEffect, useState } from "react";
import { deleteCarClass, getCarClasses } from "../api";
import { useAuth } from "../context/AuthContext";
import AdminCarClassModal from "./AdminCarClassModal";

function AdminCarClasses() {
  const { isAdmin, isLoggedIn, accessToken } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) return;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getCarClasses();
        setClasses(data);
      } catch (err) {
        setError(err.message || "Failed to load car classes.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isLoggedIn, isAdmin, refreshTick]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this car class?")) return;
    setBusyId(id);
    setError("");
    try {
      await deleteCarClass(accessToken, id);
      setClasses((list) => list.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete car class.");
    } finally {
      setBusyId(null);
    }
  }

  if (!isLoggedIn || !isAdmin) return <p>Admins only.</p>;
  if (loading) return <p>Loading car classes...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <section className="reservations-section">
      <div className="admin-header">
        <h1>Car classes</h1>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          Add car class
        </button>
      </div>

      {classes.length === 0 ? (
        <p>No car classes yet.</p>
      ) : (
        <div className="reservations-list admin-list">
          {classes.map((cls) => (
            <div key={cls.id} className="reservation-card">
              <h2>{cls.name}</h2>
              <p className="hint">{cls.description || "No description"}</p>
              <div className="admin-actions">
                <button className="btn-primary" onClick={() => setEditing(cls)}>
                  Edit
                </button>
                <button
                  className="btn-outline dark"
                  onClick={() => handleDelete(cls.id)}
                  disabled={busyId === cls.id}
                >
                  {busyId === cls.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <AdminCarClassModal
          mode="create"
          onClose={() => setCreating(false)}
          onSuccess={() => {
            setCreating(false);
            setRefreshTick((t) => t + 1);
          }}
        />
      )}

      {editing && (
        <AdminCarClassModal
          mode="edit"
          carClass={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            setRefreshTick((t) => t + 1);
          }}
        />
      )}
    </section>
  );
}

export default AdminCarClasses;
