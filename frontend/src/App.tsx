import { Header } from "@/components/header/header.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { Entities } from "@/src/entities.tsx";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Header />
        <Entities />
      </QueryClientProvider>
    </>
  );
}

export default App;
