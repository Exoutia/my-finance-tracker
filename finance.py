import json
import sqlite3
from pathlib import Path
from typing import Any
from uuid import UUID

from schemas import (
    ENTITY_TYPE_TO_TABLE,
    Bond,
    CreditCard,
    EntityType,
    ExternalContact,
    FixedDeposit,
    LiquidAccount,
    Mutualfund,
    Other,
    Stock,
    TransactionSchema,
)


def create_db(db_path: Path, schema_path: Path):
    with open(schema_path, "r") as f:
        sql_script = f.read()

    conn = sqlite3.connect(db_path)
    conn.executescript(sql_script)
    conn.close()
    print(f"Database {db_path} created with all entity tables.")


class FinanceRepository:
    def __init__(self, db_path: Path):
        self.db_path = db_path

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        # Crucial for enforcing the relationships we defined in SQL
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def add_transaction(self, txn: TransactionSchema):
        sql = """
            INSERT INTO transactions (
                uuid, from_entities_id, to_entities_id, amount,
                transaction_datetime, transaction_type,
                transaction_category, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = (
            str(txn.uuid),
            str(txn.from_entities_id),
            str(txn.to_entities_id),
            str(txn.amount),
            txn.transaction_datetime.isoformat(),
            txn.transaction_type.value,
            txn.transaction_category.value,
            txn.description,
        )
        # Using 'with' on the connection handles the transaction
        # We then explicitly close it to stop the warning
        conn = self._get_connection()
        try:
            with conn:
                conn.execute(sql, params)
        finally:
            conn.close()

    def _register_and_insert(
        self, entity_uuid: UUID, name: str, ref: str, e_type: EntityType, specific_sql: str, specific_params: Any
    ):
        type_val = e_type.value if hasattr(e_type, "value") else str(e_type)
        table_name = ENTITY_TYPE_TO_TABLE[e_type]
        conn = self._get_connection()
        try:
            with conn:  # Handles COMMIT/ROLLBACK
                cursor = conn.cursor()
                cursor.execute(
                    """INSERT INTO entity_registry (uuid, name, account_reference, entity_type, table_name)
                    VALUES (?, ?, ?, ?, ?)""",
                    (str(entity_uuid), name, ref, type_val, table_name),
                )
                cursor.execute(specific_sql, specific_params)
        except sqlite3.Error as e:
            print(f"Failed to add {type_val}: {e}")
            raise
        finally:
            conn.close()  # THIS stops the ResourceWarning

    # --- Entity Creation Methods ---

    def add_liquid_account(self, acc: LiquidAccount):
        sql = "INSERT INTO liquid_accounts (uuid, name, account_number_mask, minimum_balance) VALUES (?, ?, ?, ?)"
        params = (
            str(acc.uuid),
            acc.name,
            acc.account_number_with_mask,
            str(acc.minimum_balance),
        )
        self._register_and_insert(
            acc.uuid,
            acc.name,
            acc.account_number_with_mask,
            acc.entity_type,
            sql,
            params,
        )

    def add_credit_card(self, card: CreditCard):
        sql = "INSERT INTO credit_cards (uuid, name, card_number_mask, credit_limit) VALUES (?, ?, ?, ?)"
        params = (
            str(card.uuid),
            card.name,
            card.card_number_with_mask,
            str(card.limit),
        )
        self._register_and_insert(
            card.uuid,
            card.name,
            card.card_number_with_mask,
            card.entity_type,
            sql,
            params,
        )

    def add_stock(self, stock: Stock):
        sql = "INSERT INTO stocks (uuid, symbol, exchange, average_price, quantity) VALUES (?, ?, ?, ?, ?)"
        params = (
            str(stock.uuid),
            stock.symbol,
            stock.exchange,
            str(stock.average_price),
            stock.quantity,
        )
        self._register_and_insert(stock.uuid, stock.symbol, stock.symbol, stock.entity_type, sql, params)

    def add_mutual_fund(self, mf: Mutualfund):
        sql = "INSERT INTO mutual_funds (uuid, name, fund_type, nav) VALUES (?, ?, ?, ?)"
        params = (str(mf.uuid), mf.name, mf.type.value, str(mf.nav) if mf.nav else None)
        self._register_and_insert(mf.uuid, mf.name, "MF", mf.entity_type, sql, params)

    def add_fixed_deposit(self, fd: FixedDeposit):
        sql = """INSERT INTO fixed_deposits (uuid, fd_number_mask, bank_name, principal_amount,
                 interest_rate, maturity_date) VALUES (?, ?, ?, ?, ?, ?)"""
        params = (
            str(fd.uuid),
            fd.fd_number_with_mask,
            fd.bank_name,
            str(fd.principal_amount),
            str(fd.interest_rate),
            fd.maturity_date.isoformat(),
        )
        self._register_and_insert(
            fd.uuid,
            f"FD-{fd.fd_number_with_mask}",
            fd.fd_number_with_mask,
            fd.entity_type,
            sql,
            params,
        )

    def add_bond(self, bond: Bond):
        sql = """INSERT INTO bonds (uuid, isin, name, coupon_rate, face_value, maturity_date)
                 VALUES (?, ?, ?, ?, ?, ?)"""
        params = (
            str(bond.uuid),
            bond.isin,
            bond.name,
            str(bond.coupon_rate),
            str(bond.face_value),
            bond.maturity_date.isoformat(),
        )
        self._register_and_insert(bond.uuid, bond.name, bond.isin, bond.entity_type, sql, params)

    def add_external_contact(self, contract: ExternalContact):
        sql = "INSERT INTO external_contacts (uuid, name, category, is_institution) VALUES (?, ?, ?, ?)"
        params = (
            str(contract.uuid),
            contract.name,
            contract.category.value,
            1 if contract.is_institution else 0,
        )
        self._register_and_insert(contract.uuid, contract.name, "EXT", contract.entity_type, sql, params)

    def add_other_entity(self, other: Other):
        """Maps the 'Other' dataclass to the 'virtual_entities' table."""
        # Convert list of tags to a JSON string for storage
        tags_json = json.dumps(other.tags)
        sql = "INSERT INTO virtual_entities (uuid, name, tags, description) VALUES (?, ?, ?, ?)"
        params = (str(other.uuid), other.name, tags_json, other.description)
        # Using EntityType.OTHER for the registry
        self._register_and_insert(other.uuid, other.name, "VIRTUAL", EntityType.VIRTUAL_ENTITY, sql, params)

    # --- Unified Save Dispatcher ---
    def save(self, entity: Any):
        if isinstance(entity, LiquidAccount):
            return self.add_liquid_account(entity)
        if isinstance(entity, CreditCard):
            return self.add_credit_card(entity)
        if isinstance(entity, Stock):
            return self.add_stock(entity)
        if isinstance(entity, Mutualfund):
            return self.add_mutual_fund(entity)
        if isinstance(entity, FixedDeposit):
            return self.add_fixed_deposit(entity)
        if isinstance(entity, Bond):
            return self.add_bond(entity)
        if isinstance(entity, ExternalContact):
            return self.add_external_contact(entity)
        if isinstance(entity, Other):
            return self.add_other_entity(entity)
        if isinstance(entity, TransactionSchema):
            return self.add_transaction(entity)
        raise ValueError(f"Unknown entity type: {type(entity)}")
