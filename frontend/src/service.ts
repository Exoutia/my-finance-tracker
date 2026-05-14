const BASE_URL = "/api";

export interface Entity {
  name: string;
  entity_type: string;
  uuid: string;
  tags: string[];
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
) {
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

  return response.json() as Promise<T>;
}

export async function getEntities(): Promise<Entity[] | null> {
  try {
    const data = await apiRequest<Entity[]>("/entities");
    return data;
  } catch (error) {
    // You could trigger a toast notification here
    console.error(error);
    return null;
  }
}

export async function getEntityTypes(): Promise<string[] | null> {
  try {
    const data = await apiRequest<string[]>("/entities/entity-types");
    return data;
  } catch (error) {
    // You could trigger a toast notification here
    console.error(error);
    return null;
  }
}
