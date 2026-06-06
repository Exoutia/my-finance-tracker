import { createFileRoute } from "@tanstack/react-router";
import Transactions from "@/src/transactions-components/transactions-components.tsx";

export const Route = createFileRoute("/transactions/")({
  component: Transactions,
});

export type UUID = string;

export type EntityType =
  | "liquid_accounts"
  | "demat_accounts"
  | "stocks"
  | "fixed_deposits"
  | "mutual_funds"
  | "bonds"
  | "person"
  | "company"
  | "virtual_entities"
  | "credit_cards";

// --- Dependency Interfaces ---
export interface TagRead {
  id: number;
  name: string;
}

export interface EntityRegistryRead {
  id: number;
  uuid: UUID;
  name: string;
  entity_type: EntityType;
  table_name: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  active: boolean;
}

export interface LiquidAccountRead {
  id: number;
  uuid: UUID;
  name: string;
  account_number: string;
  minimum_balance: number; // JavaScript uses number for Decimals
  created_at: string;
  updated_at: string;
  active: boolean;
}

// --- Main Transaction Interfaces ---

export interface TransactionBase {
  to_entities_id: UUID;
  from_entities_id: UUID;
  amount: number; // Mapped from Decimal
  description: string | null;
  transaction_datetime: string; // ISO datetime string
}

export interface TransactionCreate extends TransactionBase {
  tags?: string[]; // Defaults to empty array if not supplied
}

export interface TransactionRead extends TransactionBase {
  uuid: UUID;
  tags: TagRead[];
}

export interface TransactionWithNameRead extends TransactionRead {
  to_entity: EntityRegistryRead;
  from_entity: EntityRegistryRead;
}

// --- Composite API Response Interfaces ---

export interface EntityLiquidResponse {
  EntityRegistry: EntityRegistryRead;
  LiquidAccount: LiquidAccountRead;
}
