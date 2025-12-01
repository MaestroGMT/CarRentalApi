import { useEffect, useState } from "react";
import { createCar, getCarClasses, updateCar } from "../api";
import { useAuth } from "../context/AuthContext";

function AdminCreateCarModal({ onClose, onSuccess, mode = "create", car }) {
  const { accessToken } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [plateNumber, setPlateNumber] = useState(car?.plateNumber || "");
  const [brand, setBrand] = useState(car?.brand || "");
  const [model, setModel] = useState(car?.model || "");
  const [carClassId, setCarClassId] = useState(car?.carClassId || "");
  const [isAvailable, setIsAvailable] = useState(car?.isAvailable ?? true);
  const [imageUrl, setImageUrl] = useState(car?.imageUrl || "");

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await getCarClasses();
        setClasses(data);
      } catch (err) {
        setError(err.message || "Failed to load car classes.");
      } finally {
        setLoadingClasses(false);
      }
    }
    loadClasses();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!plateNumber || !brand || !model || !carClassId) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        plateNumber,
        brand,
        model,
        carClassId: Number(carClassId),
        isAvailable,
        imageUrl: imageUrl || null
      };
      if (mode === "edit" && car) {
        await updateCar(accessToken, car.id, payload);
      } else {
        await createCar(accessToken, payload);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to save car.");
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
        <h2>{mode === "edit" ? "Edit car" : "Add new car"}</h2>

        {loadingClasses ? (
          <p>Loading car classes...</p>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Plate number
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                required
              />
            </label>
            <label>
              Brand
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </label>
            <label>
              Model
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </label>
            <label>
              Car class
              <select
                value={carClassId}
                onChange={(e) => setCarClassId(e.target.value)}
                required
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              <span>Available</span>
            </label>
            <label>
              Image URL
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/car.jpg"
              />
            </label>

            {error && <p className="error">{error}</p>}

            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Saving..." : mode === "edit" ? "Save" : "Add car"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminCreateCarModal;
