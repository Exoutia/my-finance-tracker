import { useCallback, useEffect, useState } from "react";
import * as api from "@/src/services/transactionsService.ts";
import { RecentTransactionsRows } from "@/src/components/RecentTransactionsRows.tsx";
import { AddTransactionRow } from "@/src/components/AddTransactionRow.tsx";

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<api.Transaction[]>([]);
  const [entities, setEntities] = useState<api.Entity[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const initLoad = useCallback(async () => {
    try {
      const [txnRes, entRes, typeRes] = await Promise.all([
        api.get_recent_transactions(),
        api.get_all_entities(),
        api.get_transaction_types(),
      ]);
      setTransactions(txnRes.toReversed());
      setEntities(entRes);
      setTypes(typeRes);
    } catch (err) {
      console.error("Initialization failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initLoad();
  }, [initLoad]);

  const handleAddTransaction = async (newRow: api.TransactionCreate) => {
    try {
      await api.create_transaction(newRow);
      // Refresh only the transaction list
      const updated = await api.get_recent_transactions();
      setTransactions(updated.toReversed());
    } catch (err) {
      alert("Failed to save transaction: " + err);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading Ledger...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="border-b p-3">Date & Time</th>
              <th className="border-b p-3">Type</th>
              <th className="border-b p-3">Category</th>
              <th className="border-b p-3">From (Source)</th>
              <th className="border-b p-3">To (Destination)</th>
              <th className="border-b p-3">Amount</th>
              <th className="border-b p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <RecentTransactionsRows transactions={transactions} />
            <AddTransactionRow
              entities={entities}
              types={types}
              onAdd={handleAddTransaction}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}
