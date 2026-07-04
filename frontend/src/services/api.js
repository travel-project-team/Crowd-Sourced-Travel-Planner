// Dedicated HTTP request file for all backend communication

const API_ROUTE = "/api";

/* ----------------------------------------------
Each function represents one backend API endpoint 
------------------------------------------------*/

// Connection test
export async function connectionTest() {
  const res = await fetch(`${API_ROUTE}/test`);
  return res.json();
}

/* =========================
   USERS
========================= */



/* =========================
   TRIPS
========================= */



/* =========================
   EXPERIENCES
========================= */