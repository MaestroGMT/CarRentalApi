// src/components/Header.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Header({ activePage, onChangePage, onLoginClick }) {
  const { isLoggedIn, isAdmin, username, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNavClick(page) {
    onChangePage(page);
    setMenuOpen(false);
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo" onClick={() => handleNavClick("cars")}>
          <span className="logo-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 13h16l-1-4.5a2 2 0 0 0-2-1.5H7a2 2 0 0 0-2 1.5L4 13Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="7.5" cy="16.5" r="1.5" fill="currentColor" />
              <circle cx="16.5" cy="16.5" r="1.5" fill="currentColor" />
            </svg>
          </span>
          CarRental
        </div>

        {/* Desktop menu */}
        <nav className="nav-desktop">
          <button
            className={`nav-link ${activePage === "cars" ? "active" : ""}`}
            onClick={() => handleNavClick("cars")}
          >
            <span className="nav-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 13h16l-1-4.5a2 2 0 0 0-2-1.5H7a2 2 0 0 0-2 1.5L4 13Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7.5" cy="16.5" r="1.5" fill="currentColor"/>
                <circle cx="16.5" cy="16.5" r="1.5" fill="currentColor"/>
              </svg>
            </span>
            Cars
          </button>
          {isLoggedIn && !isAdmin && (
            <button
              className={`nav-link ${
                activePage === "reservations" ? "active" : ""
              }`}
              onClick={() => handleNavClick("reservations")}
            >
              <span className="nav-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 7h14M5 12h14M5 17h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </span>
              My Reservations
            </button>
          )}
          {isAdmin && (
            <button
              className={`nav-link ${activePage === "admin" ? "active" : ""}`}
              onClick={() => handleNavClick("admin")}
            >
              <span className="nav-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 10h4v4H4v-4Zm6-6h4v10h-4V4Zm6 4h4v12h-4V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Admin panel
            </button>
          )}
          {isAdmin && (
            <button
              className={`nav-link ${
                activePage === "carClasses" ? "active" : ""
              }`}
              onClick={() => handleNavClick("carClasses")}
            >
              <span className="nav-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 5h12v4H6V5Zm0 10h12v4H6v-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 9v6M18 9v6" stroke="currentColor" strokeWidth="1.6"/>
                </svg>
              </span>
              Car classes
            </button>
          )}
          {isLoggedIn && (
            <button
              className={`nav-link ${activePage === "profile" ? "active" : ""}`}
              onClick={() => handleNavClick("profile")}
            >
              <span className="nav-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M6 19c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </span>
              Profile
            </button>
          )}
        </nav>

        {/* Right side: user info / login button */}
        <div className="header-right">
          {isLoggedIn ? (
            <>
              <span className="user-label">Hello, {username}</span>
              <button className="btn-outline" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={onLoginClick}>
              Login
            </button>
          )}

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <span className={menuOpen ? "bar bar1 open" : "bar bar1"}></span>
            <span className={menuOpen ? "bar bar2 open" : "bar bar2"}></span>
            <span className={menuOpen ? "bar bar3 open" : "bar bar3"}></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="nav-mobile">
          <button
            className={`nav-link ${activePage === "cars" ? "active" : ""}`}
            onClick={() => handleNavClick("cars")}
          >
            Cars
          </button>
          {isLoggedIn && !isAdmin && (
            <button
              className={`nav-link ${
                activePage === "reservations" ? "active" : ""
              }`}
              onClick={() => handleNavClick("reservations")}
            >
              My Reservations
            </button>
          )}
          {isAdmin && (
            <button
              className={`nav-link ${activePage === "admin" ? "active" : ""}`}
              onClick={() => handleNavClick("admin")}
            >
              Admin panel
            </button>
          )}
          {isAdmin && (
            <button
              className={`nav-link ${
                activePage === "carClasses" ? "active" : ""
              }`}
              onClick={() => handleNavClick("carClasses")}
            >
              Car classes
            </button>
          )}
          {isLoggedIn && (
            <button
              className={`nav-link ${activePage === "profile" ? "active" : ""}`}
              onClick={() => handleNavClick("profile")}
            >
              Profile
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;
