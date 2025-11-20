import { NavLink } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaBoxOpen,
  FaUserTie,
  FaUniversity,
  FaCashRegister,
} from "react-icons/fa";
import {
  DollarSign,
  Scale,
  FileSpreadsheet,
  ReceiptText,
} from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";


// 🔹 Functionalities
const accountFunctionalities = [
  {
    to: "/admin/accounts/expense-voucher",
    label: "Expense Voucher",
    icon: <DollarSign strokeWidth={3} size={40} />,
  },
  
];

// 🔹 Reports
const accountReports = [
  {
    to: "/admin/accounts/bank-ledger",
    label: "Bank Ledger",
    icon: <FaUniversity className="text-4xl" />,
  },
  {
    to: "/admin/accounts/datewise-cashrecived",
    label: "Datewise Cash Received",
    icon: <FaCashRegister className="text-4xl" />,
  },
  {
    to: "/admin/accounts/datewise-recovery",
    label: "Datewise Recovery",
    icon: <FaCalendarAlt className="text-4xl" />,
  },
  {
    to: "/admin/accounts/itemwise-recovery",
    label: "Itemwise Recovery",
    icon: <FaBoxOpen className="text-4xl" />,
  },
  {
    to: "/admin/accounts/salesmanwise-recovery",
    label: "Salesmanwise Recovery",
    icon: <FaUserTie className="text-4xl" />,
  },
];

// 🔹 Setup
const accountSetup = [
  {
    to: "/admin/accounts/define-bank",
    label: "Define Bank",
    icon: <FaMoneyBillWave className="text-4xl" />,
  },
];

const AccountSideBar = () => {
  return (
    <div>
      <CommanHeader />

      <div
        className="p-6 relative min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/images/sales-invoice1.jpg')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Functionalities Section */}
          <h1 className="text-2xl text-white font-bold mb-6">Functionalities</h1>
          <div className="bg-gray-400 opacity-80 rounded-xl px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {accountFunctionalities.map((item) => (
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
              {accountReports.map((item) => (
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
              {accountSetup.map((item) => (
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

export default AccountSideBar;
