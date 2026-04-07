const BASE_URL = "http://localhost:8000";

export interface TransactionCreate {
  to_entities_id: string;
  from_entities_id: string;
  amount: number | string;
  transaction_datetime: string;
  transaction_type: string;
  category: string;
  description?: string;
}

export interface Entity {
  uuid: string;
  name: string;
  entity_type: string;
}

export interface Transaction {
  id: number;
  uuid: string;
  from_entities_id: string;
  to_entities_id: string;
  from_entity_name: string;
  to_entity_name: string;
  amount: string;
  transaction_datetime: string;
  transaction_type: "income" | "expense" | "transfer" | string;
  transaction_category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

async function get_recent_transactions(
  limit: number = 10,
): Promise<Transaction[]> {
  const response = await fetch(
    `${BASE_URL}/transactions/recent?limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error("no transaction found");
  }

  const data = await response.json();
  return data.response;
}

async function get_all_entities() {
  const response = await fetch(`${BASE_URL}/entity`);

  if (!response.ok) {
    throw new Error("no transaction found");
  }

  const data = await response.json();
  return data.response;
}

async function get_transaction_types() {
  const response = await fetch(`${BASE_URL}/transaction/transaction_types`);

  if (!response.ok) {
    throw new Error("No record found");
  }

  const data = await response.json();
  return data.response;
}

async function get_categories(type: string) {
  const response = await fetch(
    `${BASE_URL}/transaction/transaction_category?transaction_type=${type}`,
  );

  if (!response.ok) {
    throw new Error("No record found");
  }

  const data = await response.json();
  return data.response;
}

async function create_transaction(payload: TransactionCreate) {
  const response = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Ensure these keys match your 'schemas.TransactionCreate'
      to_entities_id: payload.to_entities_id,
      from_entities_id: payload.from_entities_id,
      amount: payload.amount.toString(), // SQLite expects TEXT based on your schema
      transaction_datetime: payload.transaction_datetime.replace("T", " "), // Clean for SQLite
      transaction_type: payload.transaction_type,
      category: payload.category,
      description: payload.description || "",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to create transaction");
  }

  return response.json();
}
export {
  create_transaction,
  get_all_entities,
  get_categories,
  get_recent_transactions,
  get_transaction_types,
};
