export const API_BASE = "http://localhost:5104";

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/Auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Login failed");
  }

  return res.json(); // { accessToken, refreshToken } arba { token }
}

export async function getCars() {
  const res = await fetch(`${API_BASE}/api/Cars`);
  if (!res.ok) {
    throw new Error("Failed to load cars");
  }
  return res.json();
}

export async function getMyReservations(token) {
  const res = await fetch(`${API_BASE}/api/Reservations`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to load reservations");
  }

  return res.json();
}

export async function createReservation(token, reservation) {
  const res = await fetch(`${API_BASE}/api/Reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(reservation)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create reservation");
  }

  return res.json();
}

export async function deleteReservation(token, reservationId) {
  const res = await fetch(`${API_BASE}/api/Reservations/${reservationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to delete reservation");
  }
}

export async function updateReservation(token, reservationId, reservation) {
  const res = await fetch(`${API_BASE}/api/Reservations/${reservationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(reservation)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update reservation");
  }

  return res.json();
}

export async function getCarClasses() {
  const res = await fetch(`${API_BASE}/api/CarClasses`);
  if (!res.ok) {
    throw new Error("Failed to load car classes");
  }
  return res.json();
}

export async function createCar(token, car) {
  const res = await fetch(`${API_BASE}/api/Cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(car)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create car");
  }

  return res.json();
}

export async function updateCar(token, id, car) {
  const res = await fetch(`${API_BASE}/api/Cars/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(car)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update car");
  }

  return res.json();
}

export async function createCarClass(token, carClass) {
  const res = await fetch(`${API_BASE}/api/CarClasses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(carClass)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create car class");
  }

  return res.json();
}

export async function updateCarClass(token, id, carClass) {
  const res = await fetch(`${API_BASE}/api/CarClasses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(carClass)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update car class");
  }

  return res.json();
}

export async function deleteCarClass(token, id) {
  const res = await fetch(`${API_BASE}/api/CarClasses/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to delete car class");
  }
}

export async function getProfile(token) {
  const res = await fetch(`${API_BASE}/api/Auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load profile");
  }
  return res.json();
}

export async function updateProfile(token, profile) {
  const res = await fetch(`${API_BASE}/api/Auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(profile)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update profile");
  }
  return res.json();
}

export async function getCarReservations(token, carId) {
  const res = await fetch(`${API_BASE}/api/Reservations/car/${carId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load car reservations");
  }

  return res.json();
}
