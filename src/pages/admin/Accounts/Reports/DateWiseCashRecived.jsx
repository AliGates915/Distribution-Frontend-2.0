import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";
import { api } from "../../../../context/ApiService";
const DateWisePurchase = () => {
  const [receivables, setReceivables] = useState([]);

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [receivableId, setReceivableId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingReceivable, setEditingReceivable] = useState(null);
  const [errors, setErrors] = useState({});
  const [customerList, setCustomerList] = useState([
    { _id: "cust1", customerName: "John Doe" },
    { _id: "cust2", customerName: "Jane Smith" },
    { _id: "cust3", customerName: "Alice Johnson" },
  ]);
  const [nextReceivableId, setNextReceivableId] = useState("003");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const [showZero, setShowZero] = useState(true);

  // Filter customers based on radio button
  const filteredCustomers = showZero
    ? receivables
    : receivables.filter((c) => c.balance !== 0);

  // Simulate fetching receivables
  const fetchReceivables = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/customer-ledger/receivables?withZero=${showZero}`
      );
      // console.log("Fetched receivables:", response.data);
      setReceivables(response.data || []); // ✅ assign data
    } catch (error) {
      console.error("Failed to fetch receivables", error);
      setReceivables([]);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, [showZero]);

  useEffect(() => {
    fetchReceivables();
  }, [fetchReceivables]);

  // ✅ FIXED VERSION
  useEffect(() => {
    if (!searchTerm || !searchTerm.startsWith("REC-")) {
      fetchReceivables();
      return;
    }

    const delayDebounce = setTimeout(() => {
      try {
        setLoading(true);
        setReceivables((prev) =>
          prev.filter((receivable) =>
            receivable.receivableId
              .toUpperCase()
              .includes(searchTerm.toUpperCase())
          )
        );
      } catch (error) {
        console.error("Search receivables failed:", error);
        setReceivables([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]); // ✅ only depend on searchTerm

  // Generate next receivable ID
  useEffect(() => {
    if (receivables.length > 0) {
      const maxNo = Math.max(
        ...receivables.map((r) => {
          const match = r.receivableId?.match(/REC-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextReceivableId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextReceivableId("001");
    }
  }, [receivables]);

  // Reset form fields
  const resetForm = () => {
    setReceivableId("");
    setCustomerName("");
    setInvoiceNumber("");
    setInvoiceDate("");
    setDueDate("");
    setAmount("");
    setStatus("");
    setNotes("");
    setEditingReceivable(null);
    setErrors({});
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedReceivableId = receivableId.trim();
    const trimmedCustomerName = customerName.trim();
    const trimmedInvoiceNumber = invoiceNumber.trim();
    const trimmedInvoiceDate = invoiceDate.trim();
    const trimmedDueDate = dueDate.trim();
    const trimmedAmount = amount.trim();
    const trimmedStatus = status.trim();
    const parsedAmount = parseFloat(amount);

    if (!trimmedReceivableId)
      newErrors.receivableId = "Receivable ID is required";
    if (!trimmedCustomerName)
      newErrors.customerName = "Customer Name is required";
    if (!trimmedInvoiceNumber)
      newErrors.invoiceNumber = "Invoice Number is required";
    if (!trimmedInvoiceDate) newErrors.invoiceDate = "Invoice Date is required";
    if (!trimmedDueDate) newErrors.dueDate = "Due Date is required";
    if (!trimmedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }
    if (!trimmedStatus) newErrors.status = "Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers for form and table actions
  const handleAddReceivable = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (receivable) => {
    setEditingReceivable(receivable);
    setReceivableId(receivable.receivableId || "");
    setCustomerName(receivable.customerName || "");
    setInvoiceNumber(receivable.invoiceNumber || "");
    setInvoiceDate(receivable.invoiceDate || "");
    setDueDate(receivable.dueDate || "");
    setAmount(receivable.amount || "");
    setStatus(receivable.status || "");
    setNotes(receivable.notes || "");
    setErrors({});
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newReceivable = {
      receivableId: editingReceivable
        ? receivableId
        : `REC-${nextReceivableId}`,
      customerName: customerName.trim(),
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate: invoiceDate.trim(),
      dueDate: dueDate.trim(),
      amount: parseFloat(amount),
      status: status.trim(),
      notes: notes.trim(),
    };

    try {
      if (editingReceivable) {
        setReceivables((prev) =>
          prev.map((r) =>
            r._id === editingReceivable._id
              ? { ...r, ...newReceivable, _id: r._id }
              : r
          )
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Receivable updated successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        setReceivables((prev) => [
          ...prev,
          { ...newReceivable, _id: `temp-${Date.now()}` },
        ]);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Receivable added successfully.",
          confirmButtonColor: "#3085d6",
        });
      }
      fetchReceivables();
      resetForm();
    } catch (error) {
      console.error("Error saving receivable:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to save receivable.",
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
            setReceivables((prev) => prev.filter((r) => r._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Receivable deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete receivable.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Receivable is safe 🙂",
            "error"
          );
        }
      });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = receivables.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(receivables.length / recordsPerPage);

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
              Receivable Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter Receivable ID eg: REC-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
            {/* Radio Buttons */}
            <div className="flex gap-4 mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="balanceFilter"
                  value="withZero"
                  checked={showZero}
                  onChange={() => setShowZero(true)}
                  className="w-4 h-4"
                />
                With Zero
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="balanceFilter"
                  value="withoutZero"
                  checked={!showZero}
                  onChange={() => setShowZero(false)}
                  className="w-4 h-4"
                />
                Without Zero
              </label>
            </div>

            {/* Customer Table */}
            <div className="overflow-y-auto lg:overflow-x-auto max-h-[600px] rounded-xl">
              <div className="min-w-[600px]">
                <div className="hidden lg:grid grid-cols-3 gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                  <div>SR</div>
                  <div>Customer</div>
                  <div>Balance</div>
                </div>

                <div className="flex flex-col divide-y divide-gray-100">
                  {filteredCustomers.map((cust, index) => (
                    <div
                      key={cust._id || cust.SR || index}
                      className="grid grid-cols-1 lg:grid-cols-3 items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">{index + 1}</div>
                      <div className="text-gray-600">{cust.Customer}</div>
                      <div className="text-gray-600">{cust.Balance}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between my-4 px-10">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, filteredCustomers.length)} of{" "}
                {filteredCustomers.length} records
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
                  {editingReceivable
                    ? "Update Receivable"
                    : "Add a New Receivable"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading
                    ? "Saving..."
                    : editingReceivable
                    ? "Update Receivable"
                    : "Save Receivable"}
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

export default DateWisePurchase;
