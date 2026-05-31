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
            <Link to="/">
              <h1 className="text-xl">My Finance Tracker</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4 font-bold">
            <Link
              to="/entities"
              className="border-2 border-transparent px-3 py-1.5 transition-all hover:border-black hover:bg-main hover:text-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] [&.active]:border-black [&.active]:bg-main [&.active]:text-black [&.active]:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              Entities
            </Link>
            <Link
              to="/about"
              className="border-2 border-transparent px-3 py-1.5 transition-all hover:border-black hover:bg-main hover:text-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] [&.active]:border-black [&.active]:bg-main [&.active]:text-black [&.active]:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
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
