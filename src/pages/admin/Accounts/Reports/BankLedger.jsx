import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2 } from "lucide-react";

import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";
import { api } from "../../../../context/ApiService";
import CommanHeader from "../../Components/CommanHeader";

const BankLedger = () => {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  // New states for CustomerLedger form
  const [ledgerId, setLedgerId] = useState("");
  const [date, setDate] = useState("");
  const [salesInvoice, setSalesInvoice] = useState("");
  const [status, setStatus] = useState("");

  // Already present in your code:
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [dateRange, setDateRange] = useState("thisMonth");

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");

  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLedgerEntry, setEditingLedgerEntry] = useState(null);
  const [errors, setErrors] = useState({});
  const [customerList, setCustomerList] = useState([]);
  const [nextCustomerId, setNextCustomerId] = useState("003");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // fetch Customer List
  const fetchCustomerList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/customers");
      setCustomerList(response);
      console.log("Customers:", response);
    } catch (error) {
      console.error("Failed to fetch customer list", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchCustomerList();
  }, [fetchCustomerList]);

  // fetch Customer ID

  // ✅ Fetch customer ledger by selectedCustomer
  const fetchCustomerId = useCallback(async (id) => {
    if (!id) {
      console.log("⚠️ No customer selected yet");
      return; // don’t run when nothing selected
    }

    try {
      setLoading(true);
      console.log("Fetching ledger for:", id);

      const response = await api.get(`/customer-ledger?customer=${id}`);
      setLedgerEntries(response.data);
      console.log("Customer Ledger Data:", response.data);
    } catch (error) {
      console.error("Failed to fetch customer ledger", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerId(selectedCustomer);
    }
  }, [selectedCustomer, fetchCustomerId]);

  // fetch Date
  // ✅ Dynamic fetch by date and customer
  const fetchDate = useCallback(async () => {
    if (!selectedCustomer) return; // no customer selected yet

    try {
      setLoading(true);

      // Build dynamic query params
      let query = `/customer-ledger?customer=${selectedCustomer}`;
      if (dateFrom) query += `&from=${dateFrom}`;
      if (dateTo) query += `&to=${dateTo}`;

      const response = await api.get(query);

      // ✅ Store the ledger results instead of overwriting date state
      setLedgerEntries(response.data?.data || response.data || []);

      console.log("Filtered Ledger (Date Range):", response.data);
    } catch (error) {
      console.error("Failed to fetch ledger by date", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [selectedCustomer, dateFrom, dateTo]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchDate();
    }
  }, [selectedCustomer, dateFrom, dateTo, fetchDate]);

  // Filter ledger data based on selected customer and date range
  const filteredLedger = ledgerEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    return (
      entry.customerId === selectedCustomer &&
      (!from || entryDate >= from) &&
      (!to || entryDate <= to)
    );
  });

  // Simulate fetching ledger entries
  const fetchLedgerEntries = useCallback(async () => {
    try {
      setLoading(true);
      // Static data already set in state
    } catch (error) {
      console.error("Failed to fetch ledger entries", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchLedgerEntries();
  }, [fetchLedgerEntries]);

  // Ledger search
  useEffect(() => {
    if (!searchTerm || !searchTerm.startsWith("CUS-")) {
      fetchLedgerEntries();
      return;
    }

    const delayDebounce = setTimeout(() => {
      try {
        setLoading(true);
        const filtered = ledgerEntries.filter((entry) =>
          entry.customerId.toUpperCase().includes(searchTerm.toUpperCase())
        );
        setLedgerEntries(filtered);
      } catch (error) {
        console.error("Search ledger entries failed:", error);
        setLedgerEntries([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchLedgerEntries, ledgerEntries]);

  // Generate next customer ID
  useEffect(() => {
    if (ledgerEntries.length > 0) {
      const maxNo = Math.max(
        ...ledgerEntries.map((entry) => {
          const match = entry.customerId?.match(/CUS-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextCustomerId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextCustomerId("001");
    }
  }, [ledgerEntries]);

  // Reset form fields
  const resetForm = () => {
    setCustomerId("");
    setCustomerName("");
    setTransactionDate("");
    setTransactionType("");
    setAmount("");
    setNotes("");
    setEditingLedgerEntry(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedCustomerId = customerId.trim();
    const trimmedCustomerName = customerName.trim();
    const trimmedTransactionDate = transactionDate.trim();
    const trimmedTransactionType = transactionType.trim();
    const trimmedAmount = amount.trim();
    const parsedAmount = parseFloat(amount);

    if (!trimmedCustomerId) newErrors.customerId = "Customer ID is required";
    if (!trimmedCustomerName)
      newErrors.customerName = "Customer Name is required";
    if (!trimmedTransactionDate)
      newErrors.transactionDate = "Transaction Date is required";
    if (!trimmedTransactionType)
      newErrors.transactionType = "Transaction Type is required";
    if (!trimmedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers for form and table actions
  const handleAddLedgerEntry = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (ledgerEntry) => {
    setEditingLedgerEntry(ledgerEntry);
    setCustomerId(ledgerEntry.customerId || "");
    setCustomerName(ledgerEntry.customerName || "");
    setTransactionDate(ledgerEntry.transactionDate || "");
    setTransactionType(ledgerEntry.transactionType || "");
    setAmount(ledgerEntry.amount || "");
    setNotes(ledgerEntry.notes || "");
    setErrors({});
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Calculate The amount value and balance

    const totalPaid = filteredLedger.reduce(
      (acc, curr) => acc + (parseFloat(curr.paid) || 0),
      0
    );
    const totalReceived = filteredLedger.reduce(
      (acc, curr) => acc + (parseFloat(curr.received) || 0),
      0
    );
    const totalBalance = totalReceived - totalPaid;

    // Calculate balance based on transaction type
    const amountValue = parseFloat(amount);
    const balance = transactionType === "Credit" ? amountValue : -amountValue;

    const newLedgerEntry = {
      customerId: editingLedgerEntry ? customerId : `CUS-${nextCustomerId}`,
      customerName: customerName.trim(),
      transactionDate: transactionDate.trim(),
      transactionType: transactionType.trim(),
      amount: amountValue,
      balance: parseFloat(balance.toFixed(2)),
      notes: notes.trim(),
    };

    try {
      if (editingLedgerEntry) {
        setLedgerEntries((prev) =>
          prev.map((entry) =>
            entry._id === editingLedgerEntry._id
              ? { ...entry, ...newLedgerEntry, _id: entry._id }
              : entry
          )
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Ledger entry updated successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        setLedgerEntries((prev) => [
          ...prev,
          { ...newLedgerEntry, _id: `temp-${Date.now()}` },
        ]);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Ledger entry added successfully.",
          confirmButtonColor: "#3085d6",
        });
      }
      fetchLedgerEntries();
      resetForm();
    } catch (error) {
      console.error("Error saving ledger entry:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to save ledger entry.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleDelete = (id) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        actions: "space-x-2",
        confirmButton:
          "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300",
        cancelButton:
          "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300",
      },
      buttonsStyling: false,
    });

    swalWithTailwindButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            setLedgerEntries((prev) =>
              prev.filter((entry) => entry._id !== id)
            );
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Ledger entry deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete ledger entry.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Ledger entry is safe 🙂",
            "error"
          );
        }
      });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = ledgerEntries.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(ledgerEntries.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  console.log({ ledgerEntries });

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              Customer Ledger Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* <input
              type="text"
              placeholder="Enter Customer ID eg: CUS-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            /> */}
            {/* <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddLedgerEntry}
            >
              + Add Ledger Entry
            </button> */}
          </div>
        </div>
        <div className="flex gap-6">
          {/* Left Filter Section */}
          <div className="w-full">
            <div className="space-y-5">
              <div className="flex gap-5">
                {/* Customer Selection */}
                <div className="w-[400px]">
                  <label className="block text-gray-700 font-medium mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customerList.map((cust) => (
                      <option key={cust._id} value={cust._id}>
                        {cust.customerName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="w-[250px]">
                  <label className="block text-gray-700 font-medium mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  >
                    <option value="">Select Range</option>
                    <option value="all">All Dates</option>
                    <option value="custom">Custom</option>
                    <option value="today">Today</option>
                    <option value="thisWeek">This Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="currentFY">Current Financial Year</option>
                    <option value="lastFY">Last Financial Year</option>
                    <option value="since30">Since 30 Days Ago</option>
                    <option value="since60">Since 60 Days Ago</option>
                    <option value="since90">Since 90 Days Ago</option>
                    <option value="since365">Since 365 Days Ago</option>
                    <option value="nextMonth">Next Month</option>
                    <option value="nextFY">Next Financial Year</option>
                    <option value="q1">Quarter 1</option>
                    <option value="q2">Quarter 2</option>
                    <option value="q3">Quarter 3</option>
                    <option value="q4">Quarter 4</option>
                  </select>
                </div>

                {/* Date From */}
                <div className="w-[200px]">
                  <label className="block text-gray-700 font-medium mb-2">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  />
                </div>

                {/* Date To */}
                <div className="w-[200px]">
                  <label className="block text-gray-700 font-medium mb-2">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Form Content */}
          <div className="flex-1">{/* your main form fields go here */}</div>
        </div>

        <div className="p-0">
          {/* Selection Form */}

          <div className="rounded-xl shadow border border-gray-200 overflow-hidden mt-6">
            {selectedCustomer ? (
              <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
                <div className="min-w-full custom-scrollbar">
                  {/* Table Header */}
                  <div className="hidden lg:grid grid-cols-[0.2fr_0.5fr_0.5fr_2.5fr_repeat(3,0.7fr)] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                    <div>SR</div>
                    <div>Date</div>
                    <div>ID</div>
                    <div>Description</div>
                    <div>Paid</div>
                    <div>Received</div>
                    <div>Balance</div>
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col divide-y divide-gray-100">
                    {loading ? (
                      <div className="text-center py-4 text-gray-500 bg-white">
                        Loading...
                      </div>
                    ) : ledgerEntries.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 bg-white">
                        No ledger entries found.
                      </div>
                    ) : (
                      <>
                        {ledgerEntries.map((entry, index) => (
                          <div
                            key={entry.id || index}
                            className="grid grid-cols-[0.2fr_0.5fr_0.5fr_2.5fr_repeat(3,0.7fr)] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                          >
                            <div className="text-gray-600">{index + 1}</div>
                            <div className="text-gray-600">{entry.Date}</div>
                            <div className="text-gray-600">{entry.ID}</div>
                            <div className="text-gray-600">
                              {entry.Description}
                            </div>
                            <div className="text-gray-600">{entry.Paid}</div>
                            <div className="text-gray-600">
                              {entry.Received}
                            </div>
                            <div className="text-gray-600">{entry.Balance}</div>
                          </div>
                        ))}

                        {/* Totals Row */}
                        <div className="hidden lg:grid grid-cols-[0.2fr_0.5fr_0.5fr_2.5fr_repeat(3,0.7fr)] justify-items-start gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                          <div className="col-span-4"></div>

                          {/* Calculate totals */}
                          <div className="text-blue-700 text-center">
                            Total Paid:{" "}
                            <span className="font-bold">
                              {Math.round(
                                ledgerEntries.reduce(
                                  (sum, e) => sum + (parseFloat(e.Paid) || 0),
                                  0
                                )
                              )}
                            </span>
                          </div>
                          <div className="text-green-700 text-center">
                            Total Received:{" "}
                            <span className="font-bold">
                              {Math.round(
                                ledgerEntries.reduce(
                                  (sum, e) =>
                                    sum + (parseFloat(e.Received) || 0),
                                  0
                                )
                              )}
                            </span>
                          </div>
                          <div className="text-red-700 text-center">
                            Total Balance:{" "}
                            <span className="font-bold">
                              {Math.round(
                                ledgerEntries.reduce(
                                  (sum, e) =>
                                    sum + (parseFloat(e.Balance) || 0),
                                  0
                                )
                              )}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-white rounded-lg mt-6">
                Please select a customer to view ledger entries.
              </div>
            )}

            {/* Pagination Controls (Optional) */}
            {totalPages > 1 && (
              <div className="flex justify-between my-4 px-10">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstRecord + 1} to{" "}
                  {Math.min(indexOfLastRecord, filteredLedger.length)} of{" "}
                  {filteredLedger.length} records
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-newPrimary text-white hover:bg-newPrimary/80"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-newPrimary text-white hover:bg-newPrimary/80"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div
              ref={sliderRef}
              className="w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingLedgerEntry
                    ? "Update Ledger Entry"
                    : "Add a New Ledger Entry"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                {/* Top Section */}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading
                    ? "Saving..."
                    : editingLedgerEntry
                    ? "Update Ledger Entry"
                    : "Save Ledger Entry"}
                </button>
              </form>
            </div>
          </div>
        )}

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #edf2f7;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #a0aec0;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #718096;
          }
        `}</style>
      </div>
    </div>
  );
};

export default BankLedger;
