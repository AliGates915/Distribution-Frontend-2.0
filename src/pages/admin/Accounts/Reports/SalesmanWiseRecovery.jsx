import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../../Components/Skeleton";
import CommanHeader from "../../Components/CommanHeader";

const SalesmanWiseRecovery = () => {
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]); // NEW: Separate state for filtered data
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [paymentType, setPaymentType] = useState("Cash");
  const [cashData, setCashData] = useState({
    receiptId: "",
    date: "",
    customer: "", // store customer _id (not name)
    amountReceived: 0,
    newBalance: 0,
    remarks: "",
  });

  const [bankData, setBankData] = useState({
    receiptId: "",
    date: "",
    customer: "", // Added customer field
    bankName: "",
    accountName: "", // Changed from accountHolderName to accountName
    accountNumber: "",
    amountReceived: 0,
    remarks: "",
  });

  const [customers, setCustomers] = useState([]);
  const [customersCash, setCustomersCash] = useState([]);
  const [customersBank, setCustomersBank] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiptId, setReceiptId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [balance, setBalance] = useState("");
  const [mode, setMode] = useState("");
  const [date, setDate] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVoucher, setEditingVoucher] = useState(null); // Fixed: was editingReceipt
  const [errors, setErrors] = useState({});
  const [nextReceiptId, setNextReceiptId] = useState("001");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const API_URL = `${
    import.meta.env.VITE_API_BASE_URL
  }/payment-receipt-voucher`;

  // Fixed fetchVouchers - remove useCallback or add proper dependencies
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      const fetchedVouchers = res?.data?.data || res?.data || [];

      setVouchers(fetchedVouchers);
      setFilteredVouchers(fetchedVouchers); // Initialize filtered vouchers
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
      toast.error("Failed to fetch vouchers");
      setVouchers([]);
      setFilteredVouchers([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []); // Empty dependency array - fetch only on mount

  // fetch cusomers from cash

  const fetchCustomersCash = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/customers`
      );
      setCustomersCash(res.data);
      setCustomers(res.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Failed to fetch cash customers");
      setVouchers([]);
      setFilteredVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersCash();
  }, []);

  const fetchBanksByCustomer = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/banks`);

      const banksData = res.data?.data || [];
      setCustomersBank(banksData);
    } catch (error) {
      console.error("Failed to fetch banks for customer:", error);
      setCustomersBank([]);
    }
  };

  useEffect(() => {
    fetchBanksByCustomer();
  }, []);
  console.log({ customersBank });

  // const fetchBanks = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${import.meta.env.VITE_API_BASE_URL}/payment-receipt-voucher`
  //     );
  //     const vouchers = res.data?.data || [];
  //     console.log("Res ", res.data.data);

  //     // Extract unique bank names from vouchers that have a bankSection
  //     const uniqueBanks = vouchers
  //       .filter((v) => v.bankSection)
  //       .map((v) => ({
  //         bankName: v.bankSection.bankName,
  //         accountNumber: v.bankSection.accountNumber,
  //         accountName: v.bankSection.accountName, // Updated to accountName
  //       }))
  //       .filter(
  //         (b, index, self) =>
  //           index === self.findIndex((t) => t.bankName === b.bankName)
  //       );

  //     setBanks(uniqueBanks);
  //   } catch (error) {
  //     console.error("Failed to fetch bank data:", error);
  //     toast.error("Failed to fetch bank data");
  //     setBanks([]);
  //   }
  // };
  // useEffect(() => {
  //   fetchBanks();
  // }, []);
  // FIXED: Voucher search - doesn't modify main vouchers state
  useEffect(() => {
    if (!searchTerm) {
      setFilteredVouchers(vouchers);
      setCurrentPage(1); // Reset to first page when search is cleared
      return;
    }

    const delayDebounce = setTimeout(() => {
      const filtered = vouchers.filter((voucher) =>
        voucher.receiptId?.toUpperCase().includes(searchTerm.toUpperCase())
      );
      setFilteredVouchers(filtered);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, vouchers]); // Only depends on searchTerm and vouchers

  // Generate next voucher ID - FIXED
  useEffect(() => {
    if (vouchers.length > 0) {
      const maxNo = Math.max(
        ...vouchers.map((v) => {
          const match = v.receiptId?.match(/RV-(\d+)/); // Changed to match your API (RV-)
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextReceiptId("RV-" + (maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextReceiptId("RV-001");
    }
  }, [vouchers]);

  // Reset form fields
  const resetForm = () => {
    setReceiptId("");
    setCustomerName("");
    setBalance("");
    setCashData({
      receiptId: "",
      date: "",
      customer: "",
      amountReceived: 0,
      newBalance: 0,
      remarks: "",
    });
    setBankData({
      receiptId: "",
      date: "",
      customer: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      amountReceived: 0,
      remarks: "",
    });
    setPaymentType("Cash"); // ✅ Reset radio to default
    setMode("");
    setDate("");
    setReceivedBy(userInfo.employeeName || "");
    setStatus("");
    setRemarks("");
    setEditingVoucher(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedCustomerName = customerName.trim();
    const trimmedBalance = balance.trim();
    const trimmedMode = mode.trim();
    const trimmedDate = date.trim();
    const parsedBalance = parseFloat(balance);

    if (!trimmedCustomerName)
      newErrors.customerName = "Customer Name is required";
    if (!trimmedBalance || isNaN(parsedBalance) || parsedBalance <= 0) {
      newErrors.balance = "Balance must be a positive number";
    }
    if (!trimmedMode) newErrors.mode = "Mode is required";
    if (!trimmedDate) newErrors.date = "Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers for form and table actions
  const handleAddVoucher = () => {
    resetForm();
    setCashData({ ...cashData, date: new Date().toISOString().split("T")[0] });
    setIsSliderOpen(true);
  };

  const handleEditClick = (voucher) => {
  console.log({ voucher });
  setEditingVoucher(voucher);
  setErrors({});
  setIsSliderOpen(true);

  if (voucher.mode === "Cash") {
  setPaymentType("Cash");

  let formattedDate = "";
  if (voucher.date?.includes("T")) {
    formattedDate = voucher.date.split("T")[0];
  } else if (voucher.date?.includes("-")) {
    const parsed = new Date(voucher.date);
    if (!isNaN(parsed)) formattedDate = parsed.toISOString().split("T")[0];
  }

  setCashData({
    receiptId: voucher.receiptId || "",
    date: formattedDate,
    customer: voucher.customer?._id || "",
    balance: voucher.customer?.balance || 0,   // ✅ FIXED — now included
    amountReceived: voucher.amountReceived || 0,
    newBalance: voucher.newBalance || 0,
    remarks: voucher.remarks || "",
  });
}
 else {
    setPaymentType("Bank");

    // ✅ FIXED MAPPING for your given API data
    const bank = voucher.bankSection || {};
    setBankData({
      receiptId: voucher.receiptId || "",
      date: voucher.date?.includes("T")
        ? voucher.date.split("T")[0]
        : new Date(voucher.date).toISOString().split("T")[0],
      customer: bank.customer || "", // ✅ correct field
      bankName: bank.bankName || "",
      accountName: bank.accountHolderName || "",
      accountNumber: bank.accountNumber || "",
      amountReceived: voucher.amountReceived || 0,
      remarks: voucher.remarks || "",
    });

    if (bank.customer) {
      fetchBanksByCustomer(bank.customer);
    } else {
      setCustomersBank([
        {
          bankName: bank.bankName,
          accountName: bank.accountHolderName,
          accountNumber: bank.accountNumber,
        },
      ]);
    }
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let voucherData;

      if (paymentType === "Cash") {
        voucherData = {
          receiptId: editingVoucher ? cashData.receiptId : nextReceiptId,
          date: cashData.date,
          mode: "Cash",
          customer: cashData.customer,
          amountReceived: cashData.amountReceived,
          newBalance: cashData.newBalance,
          remarks: cashData.remarks,
        };
      } else {
        voucherData = {
          receiptId: editingVoucher ? bankData.receiptId : nextReceiptId,
          date: bankData.date || new Date().toISOString().split("T")[0],
          mode: "Bank",
          amountReceived: bankData.amountReceived,
          bankSection: {
            customer: bankData.customer,
            bankName: bankData.bankName,
            accountNumber: bankData.accountNumber,
            accountHolderName: bankData.accountName,
          },
          remarks: bankData.remarks,
        };
      }

      console.log("Submitting data:", voucherData);

      const isUpdate = Boolean(editingVoucher?._id);

      // 🟢 Save or update voucher
      if (isUpdate) {
        await axios.put(`${API_URL}/${editingVoucher._id}`, voucherData, {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("Payment receipt updated successfully");
      } else {
        await axios.post(API_URL, voucherData, {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("Payment receipt created successfully");
      }

      // Refresh and close form
      await fetchVouchers();
      resetForm();
    } catch (error) {
      console.error("Error submitting payment receipt:", error);
      toast.error("Failed to save payment receipt");
    }
  };

  // 🗑️ Delete Voucher
  const handleDelete = async (id) => {
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

    const result = await swalWithTailwindButtons.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.success) {
          setVouchers((prev) => prev.filter((v) => v._id !== id));
          setFilteredVouchers((prev) => prev.filter((v) => v._id !== id));
          swalWithTailwindButtons.fire(
            "Deleted!",
            "Payment Receipt Voucher deleted successfully.",
            "success"
          );
        } else {
          swalWithTailwindButtons.fire(
            "Error!",
            response.data.message || "Failed to delete voucher.",
            "error"
          );
        }
      } catch (error) {
        console.error("Delete error:", error);
        swalWithTailwindButtons.fire(
          "Error!",
          "Server error while deleting voucher.",
          "error"
        );
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      swalWithTailwindButtons.fire(
        "Cancelled",
        "Payment Receipt Voucher is safe 🙂",
        "error"
      );
    }
  };
  console.log({ vouchers });

  // Pagination logic - UPDATED to use filteredVouchers
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredVouchers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredVouchers.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              Payment Receipt Voucher Details
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredVouchers.length} of {vouchers.length} vouchers
              {searchTerm && " (filtered)"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter Voucher ID eg: RV-001" // Changed to RV-
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddVoucher}
            >
              + Add Payment Receipt Voucher
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
            <div className="min-w-[1200px]">
              <div className="hidden lg:grid grid-cols-[0.4fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>SR</div>
                <div>Voucher ID</div>
                <div>Payer Name</div>
                <div>Amount</div>
                <div>Payment Method</div>
                <div>Receipt Date</div>
                <div>Balance</div>
                <div>Remarks</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={currentRecords.length || 5}
                    cols={9}
                    className="lg:grid-cols-[0.4fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    {searchTerm
                      ? "No vouchers found matching your search."
                      : "No vouchers found."}
                  </div>
                ) : (
                  currentRecords.map((voucher, index) => (
                    <div
                      key={voucher._id}
                      className="grid grid-cols-1 lg:grid-cols-[0.4fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">
                        {indexOfFirstRecord + index + 1}
                      </div>
                      <div className="text-gray-600">{voucher.receiptId}</div>

                      <div className="text-gray-600">
                        {voucher.customer?.customerName ||
                          voucher.bankSection.accountHolderName ||
                          "-"}
                      </div>
                      <div className="text-gray-600">
                        Rs.{voucher.amountReceived || "-"}
                      </div>

                      <div className="text-gray-600">{voucher.mode}</div>
                      <div className="text-gray-600">
                        {voucher.date
                          ? new Date(voucher.date).toLocaleDateString()
                          : "-"}
                      </div>
                      <div className="text-gray-600">
                        Rs.{voucher.newBalance || "-"}
                      </div>
                      <div className="text-gray-600">
                        {voucher.remarks || "-"}
                      </div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(voucher)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(voucher._id)}
                          className="py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pagination Controls - UPDATED to use filteredVouchers */}
          {totalPages > 1 && (
            <div className="flex justify-between my-4 px-10">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, filteredVouchers.length)} of{" "}
                {filteredVouchers.length} records
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

        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div
              ref={sliderRef}
              className="w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingVoucher
                    ? "Update Payment Receipt Voucher"
                    : "Add a New Payment Receipt Voucher"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                {/* Payment Type Selection */}
                {/* Payment Type Selection */}
                <div className="flex gap-4">
                  {!editingVoucher ? (
                    <>
                      {/* Show both in Add mode */}
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentType"
                          value="Cash"
                          checked={paymentType === "Cash"}
                          onChange={(e) => setPaymentType(e.target.value)}
                        />
                        Cash
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentType"
                          value="Bank"
                          checked={paymentType === "Bank"}
                          onChange={(e) => setPaymentType(e.target.value)}
                        />
                        Bank
                      </label>
                    </>
                  ) : paymentType === "Cash" ? (
                    // 🟢 Show only Cash when editing a Cash voucher
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentType"
                        value="Cash"
                        checked
                        readOnly
                      />
                      Cash
                    </label>
                  ) : (
                    // 🟦 Show only Bank when editing a Bank voucher
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentType"
                        value="Bank"
                        checked
                        readOnly
                      />
                      Bank
                    </label>
                  )}
                </div>

                {/* Cash Form */}
                {paymentType === "Cash" && (
                  <div className="space-y-4">
                    {/* Date & Receipt ID */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={cashData.date}
                          onChange={(e) =>
                            setCashData({ ...cashData, date: e.target.value })
                          }
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Receipt ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={
                            editingVoucher
                              ? editingVoucher.receiptId
                              : nextReceiptId
                          }
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Customer & Balance */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={cashData.customer}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const selectedCustomer = customers.find(
                              (c) => c._id === selectedId
                            );

                            setCashData({
                              ...cashData,
                              customer: selectedCustomer?._id || "",
                              balance: selectedCustomer?.balance || 0, // ✅ store actual balance
                              newBalance: selectedCustomer?.balance || 0,
                              amountReceived: 0, // reset when new customer selected
                            });
                          }}
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Customer</option>
                          {customersCash.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.customerName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Balance field */}
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Balance
                        </label>
                        <input
                          type="number"
                          value={cashData.balance}
                          readOnly
                          className="w-full p-3 border rounded-md bg-gray-100"
                        />
                      </div>
                    </div>

                    {/* Amount Received & New Balance */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Amount Received{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={cashData.amountReceived}
                          onChange={(e) => {
                            const amount = parseFloat(e.target.value) || 0;
                            const newBalance = cashData.balance - amount; // ✅ live calculation
                            setCashData({
                              ...cashData,
                              amountReceived: amount,
                              newBalance,
                            });
                          }}
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          New Balance
                        </label>
                        <input
                          type="text"
                          value={Math.max(0, Math.round(cashData.newBalance))} // prevent negative display
                          readOnly
                          className={`w-full p-3 border rounded-md ${
                            cashData.newBalance < 0
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100"
                          }`}
                        />
                      </div>
                    </div>
                    {/* Remarks Field */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Remarks
                      </label>
                      <textarea
                        value={cashData.remarks}
                        onChange={(e) =>
                          setCashData({
                            ...cashData,
                            remarks: e.target.value,
                          })
                        }
                        placeholder="Enter any remarks or notes"
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>
                  </div>
                )}

                {/* Bank Form */}
                {paymentType === "Bank" && (
                  <div className="space-y-4">
                    {/* Customer & Bank Name */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Customer <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={bankData.customer}
                          onChange={(e) => {
                            const customerId = e.target.value;
                            setBankData({
                              ...bankData,
                              customer: customerId,
                              bankName: "",
                            });
                            fetchBanksByCustomer(customerId); // ✅ move API call here
                          }}
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Customer</option>
                          {customers.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.customerName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Bank Name <span className="text-red-500">*</span>
                        </label>

                        {customersBank.length === 1 ? (
                          // ✅ Show input field if only one bank
                          <input
                            type="text"
                            value={bankData.bankName}
                            readOnly
                            className="w-full p-3 border rounded-md bg-gray-100"
                          />
                        ) : (
                          // ✅ Show select field if multiple banks
                          <select
                            value={bankData.bankName}
                            onChange={(e) => {
                              const selectedBankName = e.target.value;
                              const selectedBank = customersBank.find(
                                (b) => b.bankName === selectedBankName
                              );

                              if (selectedBank) {
                                setBankData({
                                  ...bankData,
                                  bankName: selectedBank.bankName,
                                  accountName: selectedBank.accountName,
                                  accountNumber: selectedBank.accountNumber,
                                });
                              } else {
                                setBankData({
                                  ...bankData,
                                  bankName: selectedBankName,
                                  accountName: "",
                                  accountNumber: "",
                                });
                              }
                            }}
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Bank</option>
                            {customersBank.map((b, index) => (
                              <option key={index} value={b.bankName}>
                                {b.bankName}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Account Name & Account Number */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Account Holder Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankData.accountName}
                          onChange={(e) =>
                            setBankData({
                              ...bankData,
                              accountName: e.target.value,
                            })
                          }
                          placeholder="Enter Account Name"
                          className="w-full p-3 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Account No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankData.accountNumber}
                          onChange={(e) =>
                            setBankData({
                              ...bankData,
                              accountNumber: e.target.value,
                            })
                          }
                          placeholder="Enter Account Number"
                          className="w-full p-3 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Amount Received & Remarks */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Amount Received{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={bankData.amountReceived}
                          onChange={(e) =>
                            setBankData({
                              ...bankData,
                              amountReceived: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">
                          Remarks
                        </label>
                        <input
                          value={bankData.remarks}
                          onChange={(e) =>
                            setBankData({
                              ...bankData,
                              remarks: e.target.value,
                            })
                          }
                          placeholder="Enter any remarks or notes"
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  Save Payment
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesmanWiseRecovery;
