import TransactionTable from "@/src/transactions-components/transactionTable.tsx";
import TransactionCreate from "@/src/transactions-components/transaction-create.tsx";

export default function Transactions() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <TransactionTable />
      <TransactionCreate />
    </div>
  );
}
