import { BadgeIndianRupee } from "lucide-react";
import { ModeToggle } from "@/components/theme-provider/toggle-theme-button.tsx";
import { Link } from "@tanstack/react-router";
export function Header() {
  return (
    <nav className="sticky left-0 top-0 z-20 mx-auto flex h-17.5 w-full items-center border-b-4 border-border bg-secondary-background px-2.5 md:px-5">
      <div className="flex justify-between w-full mx-0.5 md:mx-10">
        <div className="flex gap-10 justify-between items-center">
          <div className="flex gap-2 justify-center items-center">
            <BadgeIndianRupee />
            <h1 className="text-xl">My Finance Tracker</h1>
          </div>
          <div className="flex gap-5 justify-start itesm-center">
            <Link to="/entities" className="[&.active]:font-bold">
              Entities
            </Link>
            <Link to="/about" className="[&.active]:font-bold">
              About
            </Link>
          </div>
        </div>
        <div className="flex gap-2 justify-center items-center">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
