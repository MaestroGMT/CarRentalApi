// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedRole = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");

    if (storedToken) setAccessToken(storedToken);
    if (storedRole) setRole(storedRole);
    if (storedUsername) setUsername(storedUsername);
  }, []);

  function parseRoleFromToken(token) {
    // JWT: header.payload.signature
    try {
      const payloadPart = token.split(".")[1];
      const payloadJson = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadJson);

      // role claim pagal tavo backendą – ClaimTypes.Role
      // paprastai eina kaip "role" arba "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      return (
        payload["role"] ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        null
      );
    } catch {
      return null;
    }
  }

  async function login(username, password) {
    const data = await apiLogin(username, password);

    // Pas tave login grąžina { token } arba { accessToken, refreshToken }
    const token = data.token || data.accessToken;
    if (!token) throw new Error("No token returned from API");

    const role = parseRoleFromToken(token);

    setAccessToken(token);
    setRole(role);
    setUsername(username);

    localStorage.setItem("accessToken", token);
    localStorage.setItem("role", role || "");
    localStorage.setItem("username", username);
  }

  function logout() {
    setAccessToken(null);
    setRole(null);
    setUsername(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  }

  function updateProfileLocal(newUsername) {
    if (newUsername) {
      setUsername(newUsername);
      localStorage.setItem("username", newUsername);
    }
  }

  const value = {
    accessToken,
    role,
    username,
    isLoggedIn: !!accessToken,
    isAdmin: role === "Admin",
    isUser: role === "User",
    login,
    logout,
    updateProfileLocal
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
