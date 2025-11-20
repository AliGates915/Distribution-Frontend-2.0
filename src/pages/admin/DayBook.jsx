import React, { useState } from "react";
import CommanHeader from "../admin/Components/CommanHeader";

const DayBook = () => {
  // ---------- STATIC DATA ----------
  const [search, setSearch] = useState("");
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(today);

  const salesRecoveryData = [
    { sr: 1, description: "Sale - Product A", amount: 500 },
    { sr: 2, description: "Recovery - Client X", amount: 300 },
    { sr: 3, description: "Sale - Product B", amount: 250 },
  ];

  const expenseData = [
    { sr: 1, description: "Fuel Expense", amount: 200 },
    { sr: 2, description: "Stationery", amount: 50 },
    { sr: 3, description: "Snacks", amount: 80 },
  ];

  // ---------- SEARCH FILTER ----------
  const filteredSalesRecovery = salesRecoveryData.filter((item) =>
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredExpenses = expenseData.filter((item) =>
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  // ---------- CALCULATIONS ----------
  const totalSalesRecovery = filteredSalesRecovery.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalExpense = filteredExpenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalProfit = totalSalesRecovery - totalExpense;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />

      <div className="px-6 mx-auto">
        {/* ---------------- PAGE TITLE ---------------- */}
        <h1 className="text-2xl font-bold text-newPrimary mb-6">Day Book</h1>

        {/* ---------------- DATE + SEARCH BAR ---------------- */}
        <div className="flex justify-between items-center mb-6">
          {/* Date Input */}
          <div className="flex gap-2">
            <label className="text-sm  font-medium mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-2 h-[40px] rounded-md w-48 focus:ring-2 focus:ring-newPrimary"
            />
          </div>

          {/* Search Input */}
          <div className="flex flex-col">
           
            <input
              type="text"
              placeholder="Search description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded-md w-64 focus:ring-2 focus:ring-newPrimary"
            />
          </div>
        </div>

        {/* ---------------- TWO SECTION TABLE ---------------- */}
        <div className="grid grid-cols-2 gap-6">

          {/* SALES + RECOVERY */}
          <div className="border rounded-xl shadow bg-white">
            <div className="bg-gray-100 p-3 text-center text-lg font-semibold">
              Sales + Recovery
            </div>

            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">SR</th>
                  <th className="p-3 border">Description</th>
                  <th className="p-3 border">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalesRecovery.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 border">{item.sr}</td>
                    <td className="p-3 border">{item.description}</td>
                    <td className="p-3 border font-semibold">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="p-4 text-right font-bold text-green-600">
              Total = {totalSalesRecovery}
            </div>
          </div>

          {/* EXPENSE */}
          <div className="border rounded-xl shadow bg-white">
            <div className="bg-gray-100 p-3 text-center text-lg font-semibold">
              Expense
            </div>

            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">SR</th>
                  <th className="p-3 border">Description</th>
                  <th className="p-3 border">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 border">{item.sr}</td>
                    <td className="p-3 border">{item.description}</td>
                    <td className="p-3 border font-semibold">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="p-4 text-right font-bold text-red-600">
              Total Expense = {totalExpense}
            </div>
          </div>
        </div>

        {/* ---------------- FOOTER CALCULATIONS ---------------- */}
        <div className="mt-6 bg-white shadow p-6 rounded-xl">
          <p className="text-xl font-semibold">
            Total Balance =
            <span className="text-blue-600"> {totalSalesRecovery}</span>
          </p>

          <p className="text-xl font-semibold mt-2">
            Total Profit =
            <span className="text-green-700"> {totalProfit}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DayBook;
