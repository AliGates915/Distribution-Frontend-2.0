import React, { useState, useEffect } from "react";
import axios from "axios";
import CommanHeader from "../../admin/Components/CommanHeader";
import TableSkeleton from "../../admin/Components/Skeleton";
import { Printer } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../../context/ApiService";

const BankLedger = () => {
  const [banks, setBanks] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [loading, setLoading] = useState(false);

  // Fetch Banks
  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/banks`);
      setBanks(res.data?.data || []);
    } catch {
      toast.error("Failed to load banks");
    }
  };

  // Fetch Ledger Entries
  const fetchBankLedger = async (bankId) => {
    if (!bankId) return;
    try {
      setLoading(true);
      let query = `/bank-ledger/${bankId}`;
      if (dateFrom && dateTo) {
        query += `?from=${dateFrom}&to=${dateTo}`;
      }
      const res = await api.get(query);
      setLedgerEntries(res.data || []);
    } catch (err) {
      toast.error("Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    if (selectedBank) fetchBankLedger(selectedBank);
  }, [selectedBank, dateFrom, dateTo]);

  const totalDebit = ledgerEntries
    .filter((e) => e.type === "Debit")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCredit = ledgerEntries
    .filter((e) => e.type === "Credit")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />

      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-newPrimary">Bank Ledger Details</h1>
          
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-5 mb-6">
          {/* Bank Select */}
          <div className="w-[300px]">
            <label className="block text-gray-700 font-medium mb-2">
              Bank Name *
            </label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
            >
              <option value="">Select Bank</option>
              {banks.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.bankName} — {b.accountHolderName}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className="w-[200px]">
            <label className="block text-gray-700 font-medium mb-2">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
            />
          </div>

          {/* To Date */}
          <div className="w-[200px]">
            <label className="block text-gray-700 font-medium mb-2">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="rounded-xl shadow border bg-white overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : !selectedBank ? (
            <div className="text-center py-6 text-gray-500">
              Please select a bank to view ledger entries.
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No ledger entries found.
            </div>
          ) : (
            <>
              <div className="hidden lg:grid grid-cols-[0.5fr_1.2fr_2fr_1fr_1fr_1fr] bg-gray-100 text-xs font-semibold text-gray-600 uppercase py-3 px-6">
                <div>SR</div>
                <div>Date</div>
                <div>Description</div>
                <div>Type</div>
                <div>Amount</div>
                <div>Balance After</div>
              </div>

              {ledgerEntries.map((entry, i) => (
                <div
                  key={entry._id || i}
                  className="grid grid-cols-[0.5fr_1.2fr_2fr_1fr_1fr_1fr] px-6 py-3 text-sm border-b hover:bg-gray-50"
                >
                  <div>{i + 1}</div>
                  <div>{new Date(entry.date).toLocaleDateString()}</div>
                  <div>{entry.description}</div>
                  <div
                    className={
                      entry.type === "Credit"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {entry.type}
                  </div>
                  <div>Rs. {entry.amount.toLocaleString()}</div>
                  <div>Rs. {entry.balanceAfter.toLocaleString()}</div>
                </div>
              ))}

              {/* Totals */}
              <div className="grid grid-cols-[3.7fr_1fr_1fr_1fr] bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-700">
                <div></div>
                <div className="text-green-600">
                  Total Credit: {totalCredit.toLocaleString()}
                </div>
                <div className="text-red-600">
                  Total Debit: {totalDebit.toLocaleString()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankLedger;
