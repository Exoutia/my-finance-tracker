import type { Transaction } from "@/src/services/transactionsService.ts";
import { capitalize } from "@/src/utils/textTransform.ts";

interface TransactionListProps {
  transactions: Transaction[];
}

export const RecentTransactionsRows: React.FC<TransactionListProps> = ({
  transactions,
}) => {
  return (
    <>
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
          <td className="p-3 font-medium">{capitalize(txn.to_entity_name)}</td>
          <td className="p-3 font-mono">
            ₹{parseFloat(txn.amount).toLocaleString("en-IN")}
          </td>
          <td className="p-3 text-center text-gray-300">—</td>
        </tr>
      ))}
    </>
  );
};
