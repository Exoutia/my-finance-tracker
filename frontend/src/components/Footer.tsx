import { CircleDollarSign } from "lucide-react";

const Footer = () => {
  return (
    <footer className="h-nav-foot-height text-gray-50 p-2 bg-regal-navy-600">
      <div className="flex justify-end items-center gap-1">
        <CircleDollarSign size={15} />
        <h1 className="text-end">My Financial Tracker</h1>
      </div>
    </footer>
  );
};
export default Footer;
