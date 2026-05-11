const BASE_URL = "/api";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const dbPassword = sessionStorage.getItem("db_password");

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (dbPassword) {
    headers.set("X-DB-Password", dbPassword);
  }

  // endpoint should be something like "/" or "/transactions"
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "API request failed");
  }

  return response.json();
}

export async function getEntities() {
  try {
    const data = await apiRequest("/entities");
    console.log("Finance Data:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error.message);
    // You could trigger a toast notification here
    return null;
  }
}
