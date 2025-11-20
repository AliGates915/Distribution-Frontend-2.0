import { NavLink } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaThList,
  FaUsers,
  FaBox,
  FaIndustry,
  FaWarehouse,
  FaBoxOpen,
  FaBook,
  FaCalendarAlt,
  FaUserTie,
  FaTruck,
} from "react-icons/fa";
import { AiFillBank } from "react-icons/ai";
import { RiBankCard2Line, RiBankCardLine  } from "react-icons/ri";

import {
  BadgeEuro,
  DollarSign,
  FileSpreadsheet,
  Scale,
} from "lucide-react";
import CommanHeader from "../Components/CommanHeader";

// 🔹 Functionalities
const purchaseFunctionalities = [
 
  {
    to: "/admin/bank-receipt-voucher",
    label: "Bank Receipt Voucher",
    icon: <RiBankCard2Line strokeWidth={3} size={40} />,
  },
   {
    to: "/admin/bank-payment-voucher",
    label: "Bank Payment Voucher",
    icon: <RiBankCardLine strokeWidth={3} size={40} />,
  },
];

// 🔹 Reports
const purchaseReports = [

  {
    to: "/admin/bank-ledger",
    label: "Bank Ledger",
    icon: <FaBook className="text-4xl" />,
  },
    {
    to: "/admin/opening-bank-position",
    label: "Bank Position",
    icon: <Scale strokeWidth={3} size={40} />,
  }
];

// 🔹 Setup
const purchaseSetup = [
 {
    to: "/admin/bank/define",
    label: "Bank Define",
    icon: <AiFillBank strokeWidth={3} size={40} />,
  },
];

const BankSideBar = () => {
  return (
    <div>
      <CommanHeader />

      <div
        className="p-6 relative min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/images/sales-invoice2.jpg')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-10 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Functionalities Section */}
          <h1 className="text-2xl text-white font-bold mb-6">Functionalities</h1>
          <div className="bg-gray-400 opacity-80 rounded-xl px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {purchaseFunctionalities.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center text-white hover:text-green-600 group transition-all duration-300 hover:bg-emerald-100 h-32 w-60 rounded-2xl"
                >
                  <div className="text-4xl mb-2 text-white group-hover:text-green-700 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-center">{item.label}</h2>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Reports Section */}
          <h1 className="mt-2 text-2xl text-white font-bold mb-6">Reports</h1>
          <div className="bg-gray-400 opacity-80 rounded-xl px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {purchaseReports.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center text-white hover:text-green-600 group transition-all duration-300 hover:bg-emerald-100 h-32 w-60 rounded-2xl"
                >
                  <div className="text-4xl mb-2 text-white group-hover:text-green-700 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-center">{item.label}</h2>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Setup Section */}
          <h1 className="mt-2 text-2xl text-white font-bold mb-6">Setup</h1>
          <div className="bg-gray-400 opacity-80 rounded-xl px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {purchaseSetup.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center text-white hover:text-green-600 group transition-all duration-300 hover:bg-emerald-100 h-32 w-60 rounded-2xl"
                >
                  <div className="text-4xl mb-2 text-white group-hover:text-green-700 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-center">{item.label}</h2>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankSideBar;
