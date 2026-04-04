-- 1. Setup
PRAGMA foreign_keys = ON;

-- 2. Master Directory
-- This table tracks every single entity (Bank, Person, Stock, etc.)
CREATE TABLE IF NOT EXISTS entity_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    account_reference TEXT NOT NULL,
    entity_type TEXT NOT NULL
);

-- 3. Banking & Liabilities
CREATE TABLE IF NOT EXISTS liquid_accounts (
    uuid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    account_number_mask TEXT,
    minimum_balance TEXT,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_cards (
    uuid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    card_number_mask TEXT,
    credit_limit TEXT,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

-- 4. Investments
CREATE TABLE IF NOT EXISTS stocks (
    uuid TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL,
    average_price TEXT,
    quantity INTEGER,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mutual_funds (
    uuid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    fund_type TEXT,
    nav TEXT,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fixed_deposits (
    uuid TEXT PRIMARY KEY,
    fd_number_mask TEXT,
    bank_name TEXT,
    principal_amount TEXT,
    interest_rate TEXT,
    maturity_date TEXT,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bonds (
    uuid TEXT PRIMARY KEY,
    isin TEXT NOT NULL,
    name TEXT NOT NULL,
    coupon_rate TEXT,
    face_value TEXT,
    maturity_date TEXT,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

-- 5. Contacts (People & Companies)
CREATE TABLE IF NOT EXISTS external_contacts (
    uuid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT, -- LendingCategory or LoanCategory
    is_institution INTEGER DEFAULT 0,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

-- 6. Virtual & Misc (The 'Other' class)
-- Used for UPI Lite, Travel, Eating Out, etc.
CREATE TABLE IF NOT EXISTS virtual_entities (
    uuid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tags TEXT, -- Store list as JSON string: '["travel", "personal"]'
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

-- 7. The Ledger
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    from_entities_id TEXT NOT NULL,
    to_entities_id TEXT NOT NULL,
    amount TEXT NOT NULL,
    transaction_datetime TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    transaction_category TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY(from_entities_id) REFERENCES entity_registry(uuid),
    FOREIGN KEY(to_entities_id) REFERENCES entity_registry(uuid)
);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_txn_from ON transactions(from_entities_id);
CREATE INDEX IF NOT EXISTS idx_txn_to ON transactions(to_entities_id);
CREATE INDEX IF NOT EXISTS idx_reg_uuid ON entity_registry(uuid);
