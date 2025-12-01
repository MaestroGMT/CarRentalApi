// src/components/CarList.jsx
import { useEffect, useState } from "react";
import { getCars, getCarClasses } from "../api";
import { useAuth } from "../context/AuthContext";
import ReservationModal from "./ReservationModal";
import AdminCreateCarModal from "./AdminCreateCarModal";

function CarList({ onReserved }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [editingCar, setEditingCar] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const { isLoggedIn, isAdmin } = useAuth();
  const [carClasses, setCarClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [carsData, classesData] = await Promise.all([
          getCars(),
          getCarClasses()
        ]);
        setCars(carsData);
        setCarClasses(classesData);
      } catch (err) {
        console.error(err);
        setError("Failed to load cars.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshTick]);

  function handleReserveClick(car) {
    if (!car.isAvailable) return;
    setSelectedCar(car);
  }

  function handleCloseModal(refresh = false) {
    setSelectedCar(null);
    if (refresh && onReserved) onReserved();
  }

  function handleEditClose(refresh = false) {
    setEditingCar(null);
    if (refresh) setRefreshTick((x) => x + 1);
  }

  if (loading) return <p>Loading cars...</p>;
  if (error) return <p className="error">{error}</p>;

  const filteredCars =
    selectedClassId === "all"
      ? cars
      : cars.filter((c) => String(c.carClassId) === String(selectedClassId));

  return (
    <section className="cars-section">
      <div className="cars-header">
        <h1>Available cars</h1>
        <div className="filter">
          <label>
            <span>Class</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="all">All classes</option>
              {carClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="cars-grid">
        {filteredCars.map((car) => (
          <div key={car.id} className="car-card">
            {}
            <div className="car-image-wrapper">
              <img
                src={car.imageUrl || "https://via.placeholder.com/400x240?text=Car"}
                alt={`${car.brand} ${car.model}`}
              />
            </div>
            <div className="car-info">
              <h2>
                {car.brand} {car.model}
              </h2>
              <p className="car-plate">Plate: {car.plateNumber}</p>
              <p className="car-class">Class: {car.carClassName}</p>
              <p className="car-status">
                {car.isAvailable ? "Available" : ""}
              </p>
            </div>
            <div className="car-actions">
              <div>
                {isLoggedIn ? (
                  car.isAvailable ? (
                    <button
                      className="btn-primary"
                      onClick={() => handleReserveClick(car)}
                    >
                      Reserve
                    </button>
                  ) : (
                    <span className="hint">Not available</span>
                  )
                ) : (
                  <span className="hint">Login to make a reservation</span>
                )}
              </div>
              {isAdmin && (
                <button
                  className="btn-outline dark"
                  onClick={() => setEditingCar(car)}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedCar && (
        <ReservationModal
          car={selectedCar}
          onClose={() => handleCloseModal(false)}
          onSuccess={() => handleCloseModal(true)}
        />
      )}

      {editingCar && (
        <AdminCreateCarModal
          mode="edit"
          car={editingCar}
          onClose={() => handleEditClose(false)}
          onSuccess={() => handleEditClose(true)}
        />
      )}
    </section>
  );
}

export default CarList;
