import { BadgeIndianRupee } from "lucide-react";
import "./App.css";
import { ModeToggle } from "@/components/toggle-theme-button.tsx";

function App() {
  return (
    <>
      <nav className="fixed left-0 top-0 z-20 mx-auto flex h-17.5 w-full items-center border-b-4 border-border bg-secondary-background px-5">
        <div className="flex justify-between w-full m-10">
          <div className="flex gap-2 justify-center items-center">
            <BadgeIndianRupee />
            <h1 className="text-xl">My Finance Tracker</h1>
          </div>
          <div className="flex gap-2 justify-center items-center">
            <ModeToggle />
          </div>
        </div>
      </nav>
      {/*TODO: Fix the error where this item is hiding behind nav bar*/}
      <h1 className="text-2xl text-purple-500">Hello guys</h1>
    </>
  );
}

export default App;
