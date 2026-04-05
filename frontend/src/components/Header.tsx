import { CircleDollarSign } from "lucide-react";
const Header = () => {
  return (
    <nav className="p-2 h-nav-foot-height bg-tan-500 shadow-tan-100 shadow-md">
      <div className="flex text-gray-50 text-[16px] gap-1 items-center">
        <CircleDollarSign size={15} />
        <h1>My Financial Tracker</h1>
      </div>
    </nav>
  );
};
export default Header;
