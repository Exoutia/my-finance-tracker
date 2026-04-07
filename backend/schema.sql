-- 1. Setup
PRAGMA foreign_keys = ON;

-- 2. Master Directory
-- This table tracks every single entity (Bank, Person, Stock, etc.)
CREATE TABLE IF NOT EXISTS entity_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT UNIQUE NOT NULL,
    account_reference TEXT NOT NULL,
    table_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Banking & Liabilities
CREATE TABLE IF NOT EXISTS liquid_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    account_number_mask TEXT,
    minimum_balance TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    card_number_mask TEXT,
    credit_limit TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

-- 4. Investments
CREATE TABLE IF NOT EXISTS stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL,
    average_price TEXT,
    quantity INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mutual_funds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    fund_type TEXT,
    nav TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fixed_deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    fd_number_mask TEXT,
    bank_name TEXT,
    principal_amount TEXT,
    interest_rate TEXT,
    maturity_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bonds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    isin TEXT NOT NULL,
    name TEXT NOT NULL,
    coupon_rate TEXT,
    face_value TEXT,
    maturity_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

-- 5. Contacts (People & Companies)
CREATE TABLE IF NOT EXISTS external_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT, -- LendingCategory or LoanCategory
    is_institution INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(uuid) REFERENCES entity_registry(uuid) ON DELETE CASCADE
);

-- 6. Virtual & Misc (The 'Other' class)
-- Used for UPI Lite, Travel, Eating Out, etc.
CREATE TABLE IF NOT EXISTS virtual_entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tags TEXT, -- Store list as JSON string: '["travel", "personal"]'
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
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
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(from_entities_id) REFERENCES entity_registry(uuid),
    FOREIGN KEY(to_entities_id) REFERENCES entity_registry(uuid)
);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_txn_from ON transactions(from_entities_id);
CREATE INDEX IF NOT EXISTS idx_txn_to ON transactions(to_entities_id);
CREATE INDEX IF NOT EXISTS idx_reg_uuid ON entity_registry(uuid);

CREATE TRIGGER IF NOT EXISTS trg_entity_registry_updated
AFTER UPDATE ON entity_registry
BEGIN
    UPDATE entity_registry SET updated_at = CURRENT_TIMESTAMP
    WHERE uuid = OLD.uuid;
END;

CREATE TRIGGER IF NOT EXISTS trg_transactions_updated
AFTER UPDATE ON transactions -- Removed comma
BEGIN
    UPDATE transactions SET updated_at = CURRENT_TIMESTAMP
    WHERE uuid = OLD.uuid;
END;

CREATE TRIGGER IF NOT EXISTS trg_liquid_accounts_updated
AFTER UPDATE ON liquid_accounts
BEGIN
    UPDATE liquid_accounts SET updated_at = CURRENT_TIMESTAMP
    WHERE uuid = OLD.uuid;
END;

CREATE TRIGGER IF NOT EXISTS trg_credit_cards_updated
AFTER UPDATE ON credit_cards
BEGIN
    UPDATE credit_cards SET updated_at = CURRENT_TIMESTAMP
    WHERE uuid = OLD.uuid;
END;

CREATE TRIGGER IF NOT EXISTS trg_stocks_updated
AFTER UPDATE ON stocks
BEGIN
    UPDATE stocks SET updated_at = CURRENT_TIMESTAMP
    WHERE uuid = OLD.uuid;
END;

CREATE TRIGGER IF NOT EXISTS trg_mutual_funds_updated
AFTER UPDATE ON mutual_funds
BEGIN
    UPDATE mutual_funds SET updated_at = CURRENT_TIMESTAMP
    WHERE uuid = OLD.uuid;
END;

CREATE TRIGGER IF NOT EXISTS trg_fixed_deposits_updated
AFTER UPDATE ON fixed_deposits
BEGIN
    UPDATE fixed_deposits SET updated_at = CURRENT_TIMESTAMP
    WHERE uuid = OLD.uuid;
END;

CREATE TRIGGER IF NOT EXISTS trg_bonds_updated
AFTER UPDATE ON bonds
BEGIN
    UPDATE bonds SET updated_at = CURRENT_TIMESTAMP
    WHERE uuid = OLD.uuid;
END;

CREATE TRIGGER IF NOT EXISTS trg_external_contracts_updated
AFTER UPDATE ON external_contacts
BEGIN
    UPDATE external_contacts SET updated_at = CURRENT_TIMESTAMP
    WHERE uuid = OLD.uuid;
END;

CREATE TRIGGER IF NOT EXISTS trg_virtual_entities_updated
AFTER UPDATE ON virtual_entities
BEGIN
    UPDATE virtual_entities SET updated_at = CURRENT_TIMESTAMP
    WHERE uuid = OLD.uuid;
END;
