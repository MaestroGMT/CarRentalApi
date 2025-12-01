import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { accessToken, isLoggedIn, updateProfileLocal } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getProfile(accessToken);
        setProfile(data);
        setUsername(data.username);
      } catch (err) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [accessToken, isLoggedIn]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      setSubmitting(true);
      const payload = {
        username,
        password: password || undefined
      };
      const updated = await updateProfile(accessToken, payload);
      setProfile(updated);
      setUsername(updated.username);
      setPassword("");
      updateProfileLocal(updated.username);
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLoggedIn) return <p>Please login to view profile.</p>;
  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!profile) return null;

  return (
    <section className="reservations-section">
      <h1>Profile</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          New password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
        </label>
        {success && <p className="success">{success}</p>}
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Profile;
