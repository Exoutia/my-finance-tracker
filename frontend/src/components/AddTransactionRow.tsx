import { useEffect, useState } from "react";
import * as api from "@/src/services/transactionsService.ts";

interface AddRowProps {
  entities: api.Entity[];
  types: string[];
  onAdd: (row: api.TransactionCreate) => Promise<void>;
}

export function AddTransactionRow({ entities, types, onAdd }: AddRowProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [row, setRow] = useState<api.TransactionCreate>({
    transaction_datetime: new Date().toISOString().split("T")[0],
    from_entities_id: "",
    to_entities_id: "",
    amount: "",
    transaction_type: "expense",
    category: "",
  });

  // Handle dynamic categories based on Type
  useEffect(() => {
    if (row.transaction_type) {
      api.get_categories(row.transaction_type).then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setRow((prev) => ({ ...prev, category: data[0] }));
        }
      });
    }
  }, [row.transaction_type]);

  const handleSubmit = async () => {
    if (!row.from_entities_id || !row.to_entities_id || !row.amount) {
      alert("Please fill in all required fields");
      return;
    }
    await onAdd(row);
    setRow((prev) => ({ ...prev, amount: "" })); // Clear amount after success
  };

  return (
    <tr className="bg-blue-50/50">
      <td className="p-1">
        <input
          type="date"
          className="border rounded p-1 w-full"
          value={row.transaction_datetime}
          onChange={(e) =>
            setRow({ ...row, transaction_datetime: e.target.value })}
        />
      </td>
      <td className="p-1">
        <select
          className="border rounded p-1 w-full"
          value={row.transaction_type}
          onChange={(e) => setRow({ ...row, transaction_type: e.target.value })}
        >
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>
      <td className="p-1">
        <select
          className="border rounded p-1 w-full"
          value={row.category}
          onChange={(e) => setRow({ ...row, category: e.target.value })}
        >
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="p-1">
        <select
          className="border rounded p-1 w-full"
          value={row.from_entities_id}
          onChange={(e) => setRow({ ...row, from_entities_id: e.target.value })}
        >
          <option value="">Select...</option>
          {entities.map((e) => (
            <option key={e.uuid} value={e.uuid}>{e.name}</option>
          ))}
        </select>
      </td>
      <td className="p-1">
        <select
          className="border rounded p-1 w-full"
          value={row.to_entities_id}
          onChange={(e) => setRow({ ...row, to_entities_id: e.target.value })}
        >
          <option value="">Select...</option>
          {entities.map((e) => (
            <option key={e.uuid} value={e.uuid}>{e.name}</option>
          ))}
        </select>
      </td>
      <td className="p-1">
        <input
          type="number"
          className="border rounded p-1 w-full"
          placeholder="0.00"
          value={row.amount}
          onChange={(e) => setRow({ ...row, amount: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      </td>
      <td className="p-1 text-center">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
        >
          ADD
        </button>
      </td>
    </tr>
  );
}
