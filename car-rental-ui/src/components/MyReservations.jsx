import { useEffect, useState } from "react";
import { getMyReservations } from "../api";
import { useAuth } from "../context/AuthContext";

function MyReservations({ refreshKey = 0 }) {
  const { accessToken, isLoggedIn } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;

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
  }, [accessToken, isLoggedIn, refreshKey]);

  if (!isLoggedIn) return <p>Please login to see your reservations.</p>;
  if (loading) return <p>Loading reservations...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!reservations.length) return <p>You have no reservations yet.</p>;

  return (
    <section className="reservations-section">
      <h1>My reservations</h1>
      <div className="reservations-list">
        {reservations.map((res) => (
          <div key={res.id} className="reservation-card">
            {res.carImageUrl && (
              <div className="reservation-image">
                <img
                  src={res.carImageUrl}
                  alt={`Car ${res.carPlateNumber}`}
                />
              </div>
            )}
            <h2>{res.customerName}</h2>
            <p className="car-plate">Car plate: {res.carPlateNumber}</p>
            <p className="car-class">
              From: {new Date(res.dateFrom).toLocaleDateString()}<br />
              To: {new Date(res.dateTo).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MyReservations;
