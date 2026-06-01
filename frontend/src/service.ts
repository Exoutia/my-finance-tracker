import type { PaginationState } from "@tanstack/react-table";
import type { QueryFunctionContext } from "@tanstack/react-query";

const BASE_URL = "/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// --- Interfaces ---
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
): Promise<T> {
  // Guard against SSR environments crashing on sessionStorage
  const dbPassword = typeof window !== "undefined"
    ? sessionStorage.getItem("db_password")
    : null;

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (dbPassword) {
    headers.set("X-DB-Password", dbPassword);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers, // Seamlessly forwards multi-part boundaries if FormData was detected
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

export function getEntities(): Promise<Entity[]> {
  return apiRequest<Entity[]>("/entities");
}

export function getAllEntitiesAtOnce(): Promise<Entity[]> {
  return apiRequest<Entity[]>("/entities/all");
}

export function getPaginatedEntities(
  { queryKey }: QueryFunctionContext<PaginatedInputQueryKey>,
): Promise<PaginatedEntity> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_key, paginationState] = queryKey;
  const { pageIndex, pageSize } = paginationState;

  const offset = pageIndex * pageSize;
  const limit = pageSize;

  return apiRequest<PaginatedEntity>(
    `/entities/paginated?offset=${offset}&limit=${limit}`,
  );
}

export function getEntityTypes(): Promise<string[]> {
  return apiRequest<string[]>("/entities/entity-types");
}

// --- POST Mutations ---

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

export function createLiquidAccount(
  data: LiquidAccountCreate,
): Promise<LiquidAccountRead> {
  return apiRequest<LiquidAccountRead>("/liquid-accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
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

export function createCreditCardEntity(
  data: CreditCardCreate,
): Promise<CreditCardRead> {
  return apiRequest<CreditCardRead>("/credit-cards", {
    method: "POST",
    body: JSON.stringify(data),
  });
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

export function createBondEntity(data: BondCreate): Promise<BondRead> {
  return apiRequest<BondRead>("/bonds", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface ExternalContactCreate {
  name: string;
  tags?: string | null;
  is_institution: boolean;
  mobile_number?: string | null;
  description?: string | null;
}
export interface ExternalContactRead {
  name: string;
  tags?: string | null;
  is_institution: boolean;
  mobile_number?: string | null;
  id: number;
  uuid: string;
  display_name: string;
}

export function createExternalContactEntity(
  data: ExternalContactCreate,
): Promise<ExternalContactRead> {
  return apiRequest<ExternalContactRead>("/external-contacts", {
    method: "POST",
    body: JSON.stringify(data),
  });
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

export function createDematAccount(
  data: DematAccountCreate,
): Promise<DematAccountRead> {
  return apiRequest<DematAccountRead>("/demat-accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface FixedDepositCreate {
  bank_name: string;
  fd_identifier: string;
  principal_amount: number;
  interest_rate: number;
  maturity_date: Date;
}
export interface FixedDepositRead extends FixedDepositCreate {
  display_name: string;
}

export function createFixedDeposit(
  data: FixedDepositCreate,
): Promise<FixedDepositRead> {
  // FIXED TYPO: /fixed-depsoits -> /fixed-deposits
  return apiRequest<FixedDepositRead>("/fixed-deposits", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export type MutualFundType = "equity" | "debt" | "hybrid" | "elss" | "index";
export interface MutualFundCreate {
  name: string;
  type: MutualFundType;
}
export interface MutualFundRead extends MutualFundCreate {
  id: number;
  uuid: string;
}

export function createMutualFund(
  data: MutualFundCreate,
): Promise<MutualFundRead> {
  return apiRequest<MutualFundRead>("/mutual-funds", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface VirtualEntityCreate {
  name: string;
  description?: string | null;
}
export interface VirtualEntityRead extends VirtualEntityCreate {
  id: number;
  uuid: string;
}

export function createVirtualEntity(
  data: VirtualEntityCreate,
): Promise<VirtualEntityRead> {
  return apiRequest<VirtualEntityRead>("/virtual-entities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface StockCreate {
  symbol: string;
  name: string;
}
export interface StockRead extends StockCreate {
  id: number;
  uuid: string;
}

export function createStock(data: StockCreate): Promise<StockRead> {
  return apiRequest<StockRead>("/stocks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface BlueprintField {
  type: string;
  required: boolean;
  desc: string;
}

export const ENTITY_BLUEPRINT_REGISTRY: Record<
  string,
  Record<string, BlueprintField>
> = {
  liquid_account: {
    name: {
      type: "string",
      required: true,
      desc: "Ledger moniker or entity tracking alias.",
    },
    account_number: {
      type: "string",
      required: true,
      desc: "Raw alphanumeric account or routing tracking ID.",
    },
    minimum_balance: {
      type: "number",
      required: true,
      desc: "Threshold balance tracking baseline limit.",
    },
  },
  credit_card: {
    name: {
      type: "string",
      required: true,
      desc: "Card variation descriptive name label.",
    },
    card_number: {
      type: "string",
      required: true,
      desc: "Full card sequence or tracking identifier digits.",
    },
    limit: {
      type: "string",
      required: true,
      desc: "Total maximum credit limit allowance ceiling value.",
    },
    statement_date: {
      type: "number",
      required: true,
      desc: "Day of month when the billing period cycles (e.g. 15).",
    },
    grace_period: {
      type: "number",
      required: true,
      desc: "Interest-free payment window calculation buffer in days.",
    },
  },
  bonds: {
    unique_id: {
      type: "string",
      required: true,
      desc: "ISIN or internal sequence verification ID index number.",
    },
    name: {
      type: "string",
      required: true,
      desc: "Bond registry asset or issue authority classification.",
    },
    coupon_interest_rate: {
      type: "string",
      required: true,
      desc: "Yield payment rate sequence percentage descriptor.",
    },
    face_value: {
      type: "string",
      required: true,
      desc: "Maturity base valuation premium metric total.",
    },
    maturity_date: {
      type: "date",
      required: true,
      desc: "Final principal settlement fulfillment execution timeline date.",
    },
  },
  person: {
    name: {
      type: "string",
      required: true,
      desc:
        "Full text entity title descriptor or personal signature designation.",
    },
    isInstitution: {
      type: "boolean",
      required: true,
      desc: "required value: false",
    },
    tags: {
      type: "string",
      required: false,
      desc: "Optional raw CSV or parsing comma values string.",
    },
    mobile_number: {
      type: "string",
      required: false,
      desc: "Optional direct cellular configuration tracking parameters.",
    },
    description: {
      type: "string",
      required: false,
      desc: "Optional contextual notes tracking background details.",
    },
  },

  company: {
    name: {
      type: "string",
      required: true,
      desc:
        "Full text entity title descriptor or personal signature designation.",
    },
    isInstitution: {
      type: "boolean",
      required: true,
      desc: "required value: true",
    },
    tags: {
      type: "string",
      required: false,
      desc: "Optional raw CSV or parsing comma values string.",
    },
    mobile_number: {
      type: "string",
      required: false,
      desc: "Optional direct cellular configuration tracking parameters.",
    },
    description: {
      type: "string",
      required: false,
      desc: "Optional contextual notes tracking background details.",
    },
  },

  demat_account: {
    name: {
      type: "string",
      required: true,
      desc: "Demat investment folio broker label.",
    },
    account_number: {
      type: "string",
      required: true,
      desc: "Client ID tracking token designation digits.",
    },
    depository_participant: {
      type: "string",
      required: true,
      desc: "CDSL or NSDL institutional manager identity name.",
    },
    dp_id: {
      type: "string",
      required: true,
      desc:
        "Depository Participant tracking reference verification identification code.",
    },
  },
  fixed_deposit_account: {
    bank_name: {
      type: "string",
      required: true,
      desc: "Issuer banking counterparty identification desk moniker.",
    },
    fd_identifier: {
      type: "string",
      required: true,
      desc: "Certificate tracking index number assignment receipt.",
    },
    principal_amount: {
      type: "number",
      required: true,
      desc: "Initial corpus base asset total configuration valuation balance.",
    },
    interest_rate: {
      type: "number",
      required: true,
      desc:
        "Compound interest yield growth tracking baseline scalar percentage.",
    },
    maturity_date: {
      type: "date",
      required: true,
      desc: "Locked terminal window distribution date target frame marker.",
    },
  },
  mutual_fund: {
    name: {
      type: "string",
      required: true,
      desc: "Portfolio or Asset Management Company scheme title ledger marker.",
    },
    type: {
      type: "string",
      required: true,
      desc:
        "Must cleanly match: 'equity' | 'debt' | 'hybrid' | 'elss' | 'index'.",
    },
  },
  stocks: {
    symbol: {
      type: "string",
      required: true,
      desc: "Market ticker identification equity token (e.g., RELIANCE, TCS).",
    },
    name: {
      type: "string",
      required: true,
      desc: "Corporate legal entity listing index descriptive string.",
    },
  },
  virtual_entity: {
    name: {
      type: "string",
      required: true,
      desc: "Logical abstract node grouping identification ledger framework.",
    },
    description: {
      type: "string",
      required: false,
      desc:
        "Optional contextual system architecture background documentation info.",
    },
  },
};

export interface BulkUploadResponse {
  message: string;
  count: number;
  records: LiquidAccountRead[];
}

export function bulkCreateLiquidAccounts(
  formData: FormData,
): Promise<LiquidAccountRead[]> {
  return apiRequest<LiquidAccountRead[]>(
    "/liquid-accounts/bulk-upload",
    {
      method: "POST",
      body: formData,
      headers: new Headers({}),
    },
  );
}
