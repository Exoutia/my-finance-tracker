import { useEffect, useRef, useState } from "react";
import * as api from "@/src/services/transactionsService.ts";

interface AddRowProps {
  entities: api.Entity[];
  onAdd: (row: api.TransactionCreate) => Promise<void>;
  typeToCategory: Record<string, string[]>;
}

export function AddTransactionRow({
  entities,
  onAdd,
  typeToCategory,
}: AddRowProps) {
  const availableTypes = Object.keys(typeToCategory);
  const defaultType = availableTypes[0] || "expense";

  // 1. Setup the Ref and a focus trigger state
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [shouldFocus, setShouldFocus] = useState(false);

  const createEmptyRow = (): api.TransactionCreate => ({
    transaction_datetime: new Date().toISOString().split("T")[0],
    from_entities_id: "",
    to_entities_id: "",
    amount: "",
    transaction_type: defaultType,
    category: typeToCategory[defaultType]?.[0] || "",
  });

  const [rows, setRows] = useState<api.TransactionCreate[]>([
    createEmptyRow(),
  ]);

  // 2. Watch for changes: When a row is added and shouldFocus is true, focus the input
  useEffect(() => {
    if (shouldFocus && firstInputRef.current) {
      firstInputRef.current.focus();
      setShouldFocus(false); // Reset the trigger
    }
  }, [rows.length, shouldFocus]);

  const updateRow = (index: number, key: string, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      const newRow = { ...updated[index], [key]: value };

      if (key === "transaction_type") {
        newRow.category = typeToCategory[value]?.[0] || "";
      }

      updated[index] = newRow;
      return updated;
    });
  };

  const addNewRowAndFocus = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
    setShouldFocus(true); // Tell the useEffect to focus after render
  };

  const addNewRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const deleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAll = async () => {
    for (const row of rows) {
      if (!row.from_entities_id || !row.to_entities_id || !row.amount) {
        alert("Please fill all required fields");
        return;
      }
    }
    await Promise.all(rows.toReversed().map((row) => onAdd(row)));
    setRows([createEmptyRow()]);
  };

  const handleLastCellKey = (
    e: React.KeyboardEvent,
    row_index: number,
  ) => {
    if (e.key === "Tab" && !e.shiftKey && row_index === rows.length - 1) {
      e.preventDefault();
      addNewRowAndFocus();
    }
  };

  return (
    <>
      {rows.map((row, index) => (
        <tr key={index} className="bg-blue-50/50">
          {/* Date - The First Element */}
          <td className="p-1">
            <input
              // 3. Attach ref only to the LAST row in the list
              ref={index === rows.length - 1 ? firstInputRef : null}
              type="date"
              className="border rounded p-1 w-full"
              value={row.transaction_datetime}
              onChange={(e) =>
                updateRow(index, "transaction_datetime", e.target.value)}
            />
          </td>

          {/* Type Cell */}
          <td className="p-1">
            <select
              className="border rounded p-1 w-full"
              value={row.transaction_type}
              onChange={(e) =>
                updateRow(index, "transaction_type", e.target.value)}
            >
              {availableTypes.map((t) => <option key={t} value={t}>{t}
              </option>)}
            </select>
          </td>

          {/* Category Cell */}
          <td className="p-1">
            <select
              className="border rounded p-1 w-full"
              value={row.category}
              onChange={(e) => updateRow(index, "category", e.target.value)}
            >
              {(typeToCategory[row.transaction_type] || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </td>

          {/* From */}
          <td className="p-1">
            <select
              className="border rounded p-1 w-full"
              value={row.from_entities_id}
              onChange={(e) =>
                updateRow(index, "from_entities_id", e.target.value)}
            >
              <option value="">Select...</option>
              {entities.map((e) => (
                <option key={e.uuid} value={e.uuid}>{e.name}</option>
              ))}
            </select>
          </td>

          {/* To */}
          <td className="p-1">
            <select
              className="border rounded p-1 w-full"
              value={row.to_entities_id}
              onChange={(e) =>
                updateRow(index, "to_entities_id", e.target.value)}
            >
              <option value="">Select...</option>
              {entities.map((e) => (
                <option key={e.uuid} value={e.uuid}>{e.name}</option>
              ))}
            </select>
          </td>

          {/* Amount (LAST CELL) */}
          <td className="p-1">
            <input
              type="number"
              className="border rounded p-1 w-full"
              placeholder="0.00"
              value={row.amount}
              onChange={(e) => updateRow(index, "amount", e.target.value)}
              onKeyDown={(e) => handleLastCellKey(e, index)}
            />
          </td>

          {/* Delete */}
          <td className="p-1 text-center">
            <button
              type="button"
              onClick={() => deleteRow(index)}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              ✕
            </button>
          </td>
        </tr>
      ))}

      {/* Action Row */}
      <tr>
        <td colSpan={7} className="p-2 text-right space-x-2">
          <button
            type="button"
            onClick={addNewRow}
            className="rounded bg-gray-500 px-3 py-1 text-xs font-bold text-white"
          >
            + Add Row
          </button>

          <button
            type="button"
            onClick={handleSubmitAll}
            className="rounded bg-blue-600 px-4 py-1 text-xs font-bold text-white"
          >
            Submit All
          </button>
        </td>
      </tr>
    </>
  );
}
