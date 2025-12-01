// src/components/LoginModal.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function LoginModal({ onClose }) {
  const { login, register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login | register
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await register(username, password);
      } else {
        await login(username, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        >
        <h2>{mode === "register" ? "Register" : "Login"}</h2>
        <form onSubmit={handleSubmit} className="form">
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
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <div className="auth-buttons">
              <button
                type="button"
                className={`btn-outline ${mode === "login" ? "active" : ""}`}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={`btn-outline ${mode === "register" ? "active" : ""}`}
                onClick={() => setMode("register")}
              >
                Register
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? mode === "register"
                    ? "Registering..."
                    : "Logging in..."
                  : mode === "register"
                    ? "Register & login"
                    : "Login"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
