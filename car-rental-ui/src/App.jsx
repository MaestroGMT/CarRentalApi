import { useState } from "react";
import Header from "./components/Header";
import CarList from "./components/CarList";
import LoginModal from "./components/LoginModal";
import MyReservations from "./components/MyReservations";
import AdminPanel from "./components/AdminPanel";
import AdminCarClasses from "./components/AdminCarClasses";
import Profile from "./components/Profile";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

function AppContent() {
  const [activePage, setActivePage] = useState("cars"); // cars | reservations | admin
  const [loginOpen, setLoginOpen] = useState(false);
  const [reservationsRefresh, setReservationsRefresh] = useState(0);
  const { isAdmin } = useAuth();

  function handleReservationCreated() {
    setReservationsRefresh((x) => x + 1);
    setActivePage("reservations");
  }

  return (
    <div className="app">
      <Header
        activePage={activePage}
        onChangePage={setActivePage}
        onLoginClick={() => setLoginOpen(true)}
      />

      <main className="content">
        {/* Hero / intro */}
        <section className="hero">
          <div className="hero-text">
            <h1>Car rental made simple</h1>
            <p>
              Browse available cars, create reservations and manage your rentals
              easily.
            </p>
            <button
              className="btn-primary"
              onClick={() => setActivePage("cars")}
            >
              Browse cars
            </button>
          </div>
        </section>

        {/* Puslapiai */}
        {activePage === "cars" && (
          <CarList onReserved={handleReservationCreated} />
        )}
        {activePage === "reservations" && (
          <MyReservations refreshKey={reservationsRefresh} />
        )}
        {activePage === "admin" && isAdmin && (
          <AdminPanel />
        )}
        {activePage === "carClasses" && isAdmin && <AdminCarClasses />}
        {activePage === "profile" && <Profile />}
      </main>

      <footer className="footer">
        <p>{new Date().getFullYear()} CarRental API Laboratorinis darbas</p>
        <p>Kauno Technologijų universitetas @jaška</p>
      </footer>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
