import type { PaginationState } from "@tanstack/react-table";
import type { QueryFunctionContext } from "@tanstack/react-query";

const BASE_URL = "/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;

    // Fixes the prototype chain for built-in classes in ES5/TS
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

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
    const errorBody = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));

    throw new ApiError(
      errorBody.detail || "API request failed",
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export async function getEntities(): Promise<Entity[] | null> {
  try {
    const data = await apiRequest<Entity[]>("/entities");
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getAllEntitiesAtOnce(): Promise<Entity[] | null> {
  try {
    const data = await apiRequest<Entity[]>("/entities/all");
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

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
  minimum_balance: number;
  id: number;
  uuid: string;
  entity_name: string;
}

export async function createLiquidAccount(
  data: LiquidAccountCreate,
): Promise<LiquidAccountRead | null> {
  const response = await apiRequest<LiquidAccountRead>("/liquid-accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response;
}

export interface CreditCardCreate {
  name: string;
  card_number: string;
  limit: string;
  statement_date: number;
  grace_period: number;
}

export interface CreditCardRead {
  display_name: string;
  id: number;
  uuid: string;
  limit: string;
}

export async function createCreditCardEntity(
  data: CreditCardCreate,
): Promise<CreditCardRead | null> {
  const response = await apiRequest<CreditCardRead>("/credit-cards", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response;
}

export interface BondCreate {
  unique_id: string;
  name: string;
  coupon_interest_rate: string;
  face_value: string;
  maturity_date: Date;
}

export interface BondRead {
  name: string;
  coupon_interest_rate: string;
  face_value: string;
  maturity_date: Date;
}

export async function createBondEntity(
  data: BondCreate,
): Promise<BondRead | null> {
  const response = await apiRequest<BondRead>("/bonds", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response;
}

export interface ExternalContactCreate {
  name: string;
  tags?: string | null;
  is_institution: boolean;
  mobile_number?: string | null;
  description?: string | null;
}

export interface ExternalContractRead {
  name: string;
  tags?: string | null;
  is_institution: boolean;
  mobile_number?: string | null;
  id: number;
  uuid: string;
  display_name: string;
}

export async function createExternalContractEntity(
  data: ExternalContactCreate,
): Promise<ExternalContractRead | null> {
  const response = await apiRequest<ExternalContractRead>(
    "/external-contracts",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  return response;
}

export interface DematAccountCreate {
  name: string;
  account_number: string;
  depository_participant: string;
  dp_id: string;
}

export interface DematAccountRead {
  name: string;
  depository_participant: string;
  dp_id: string;
  id: number;
  uuid: string;
}

export async function createDematAccount(
  data: DematAccountCreate,
): Promise<DematAccountRead | null> {
  const response = await apiRequest<DematAccountRead>(
    "/demat-accounts",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  return response;
}
