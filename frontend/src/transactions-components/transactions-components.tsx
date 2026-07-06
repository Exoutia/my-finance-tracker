import TransactionTable from "@/src/transactions-components/transactionTable.tsx";
import TransactionCreate from "@/src/transactions-components/transaction-create.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";

export default function Transactions() {
  return (
    <Tabs defaultValue="create-transactions" className="max-w-7xl mx-auto p-4">
      <TabsList className="grid w-1/3 grid-cols-2 bg-secondary-background">
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="create-transactions">Create</TabsTrigger>
      </TabsList>
      <TabsContent value="transactions">
        <TransactionTable />
      </TabsContent>
      <TabsContent value="create-transactions">
        <TransactionCreate />
      </TabsContent>
    </Tabs>
  );
}
