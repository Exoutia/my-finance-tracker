import { useCallback, useEffect, useState } from "react";
import * as api from "../services/transactionsService";
import { capitalize } from "../utils/textTransform";

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<api.Transaction[]>([]);
  const [entities, setEntities] = useState<api.Entity[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [newRow, setNewRow] = useState<api.TransactionCreate>({
    transaction_datetime: new Date().toISOString().slice(0, 16),
    from_entities_id: "",
    to_entities_id: "",
    amount: "",
    transaction_type: "expense",
    category: "rent",
  });

  // 1. Initial Load
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

  // 2. Dynamic Category Loading
  // We target only the specific property to avoid the dependency loop
  const currentType = newRow.transaction_type;

  useEffect(() => {
    if (currentType) {
      api.get_categories(currentType).then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setNewRow((prev) => ({ ...prev, category: data[0] }));
        }
      });
    }
  }, [currentType]);

  // 3. Handle Submit
  const handleAdd = async () => {
    if (!newRow.from_entities_id || !newRow.to_entities_id || !newRow.amount) {
      alert("Please fill in all required fields (From, To, Amount)");
      return;
    }
    try {
      await api.create_transaction(newRow);

      // Reset amount and keep date/type for convenience
      setNewRow((prev) => ({ ...prev, amount: "" }));

      // Refresh list - matching the structure used in initLoad
      const updated = await api.get_recent_transactions();
      setTransactions(updated.toReversed());
    } catch (err) {
      alert("Failed to save transaction: " + err);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Ledger...</div>;

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
            {transactions.map((txn) => (
              <tr key={txn.uuid} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 text-gray-500">
                  {txn.transaction_datetime.replace("T", " ").slice(0, 16)}
                </td>
                <td className="p-3">
                  <span className="rounded-full px-2 py-0.5">
                    {capitalize(txn.transaction_type, "_")}
                  </span>
                </td>
                <td className="p-3 text-gray-600">
                  {capitalize(txn.transaction_category, "_")}
                </td>
                <td className="p-3 font-medium">
                  {capitalize(txn.from_entity_name)}
                </td>
                <td className="p-3 font-medium">
                  {capitalize(txn.to_entity_name)}
                </td>
                <td className="p-3 font-mono">
                  ₹{parseFloat(txn.amount).toLocaleString("en-IN")}
                </td>
                <td className="p-3 text-center text-gray-300">—</td>
              </tr>
            ))}

            <tr className="bg-blue-50/50">
              <td className="p-1">
                <input
                  type="date"
                  className="border rounded p-1"
                  value={newRow.transaction_datetime}
                  onChange={(e) =>
                    setNewRow({
                      ...newRow,
                      transaction_datetime: e.target.value,
                    })
                  }
                />
              </td>
              <td className="p-1">
                <select
                  className="border rounded p-1 w-full"
                  value={newRow.transaction_type}
                  onChange={(e) =>
                    setNewRow({ ...newRow, transaction_type: e.target.value })
                  }
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-1">
                <select
                  className="border rounded p-1 w-full"
                  value={newRow.category}
                  onChange={(e) =>
                    setNewRow({ ...newRow, category: e.target.value })
                  }
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-1">
                <select
                  className="border rounded p-1 w-full"
                  value={newRow.from_entities_id}
                  onChange={(e) =>
                    setNewRow({ ...newRow, from_entities_id: e.target.value })
                  }
                >
                  <option value="">Select...</option>
                  {entities.map((e) => (
                    <option key={e.uuid} value={e.uuid}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-1">
                <select
                  className="border rounded p-1 w-full"
                  value={newRow.to_entities_id}
                  onChange={(e) =>
                    setNewRow({ ...newRow, to_entities_id: e.target.value })
                  }
                >
                  <option value="">Select...</option>
                  {entities.map((e) => (
                    <option key={e.uuid} value={e.uuid}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-1">
                <input
                  type="number"
                  className="border rounded p-1 w-full"
                  placeholder="0.00"
                  value={newRow.amount}
                  onChange={(e) =>
                    setNewRow({ ...newRow, amount: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </td>
              <td className="p-1 text-center">
                <button
                  onClick={handleAdd}
                  className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  ADD
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
