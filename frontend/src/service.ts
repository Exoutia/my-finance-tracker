import type { PaginationState } from "@tanstack/react-table";
import type { QueryFunctionContext } from "@tanstack/react-query";

const BASE_URL = "/api";

export interface Entity {
  name: string;
  entity_type: string;
  uuid: string;
  tags: string[];
}

export interface PaginatedEntity {
  total: number;
  items: Entity[];
}

export type PaginatedInputQueryKey = [string, PaginationState];

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

// Update this function to dynamically build the URL parameters
export async function getPaginatedEntities(
  { queryKey }: QueryFunctionContext<PaginatedInputQueryKey>,
) {
  try {
    const [_key, paginationState] = queryKey;
    const { pageIndex, pageSize } = paginationState;

    const offset = pageIndex * pageSize;
    const limit = pageSize;

    const url = `/entities/paginated?offset=${offset}&limit=${limit}`;

    const data = await apiRequest<PaginatedEntity>(url);

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

export interface LiquidAccountCreate {
  name: string;
  account_number: string;
  minimum_balance: number;
}
export interface LiquidAccountRead {
  name: string;
  account_number: string;
  minimum_balance: number;
  id: number;
  uuid: string;
  entity_name: string;
}

export async function createLiquidAccount(
  data: LiquidAccountCreate,
): Promise<LiquidAccountRead | null> {
  try {
    const response = await apiRequest<LiquidAccountRead>("/liquid-accounts", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
}
