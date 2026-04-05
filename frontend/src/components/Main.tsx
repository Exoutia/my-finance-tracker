import RecentTransactions from "./RecentTransactions";

const Main = () => {
  return (
    <main className="h-main-height">
      <RecentTransactions />
      <div>
        <h2>Action Buttons</h2>
        <button>Create Transaction</button>
        <button>Create Entity</button>
      </div>
      <div>
        <h2>Transactions</h2>
      </div>
    </main>
  );
};
export default Main;
