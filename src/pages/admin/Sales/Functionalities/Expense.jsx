import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { SquarePen, Trash2, X, Eye } from "lucide-react";
import gsap from "gsap";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const ExpensePage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const today = new Date().toLocaleDateString("en-CA");
  const [expenses, setExpenses] = useState([]);
  const [expenseDate, setExpenseDate] = useState(today);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedSalesman, setSelectedSalesman] = useState("");
  const [salesmanList, setSalesmanList] = useState([]);
  const [expenseItems, setExpenseItems] = useState([]);
  const [viewExpense, setViewExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10; // you can adjust page size

  const sliderRef = useRef(null);

  // ================= FETCH SALESMEN =================
  useEffect(() => {
    const fetchSalesmen = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/employees`);
        setSalesmanList(data);
      } catch (err) {
        toast.error("Failed to load salesmen");
      }
    };
    fetchSalesmen();
  }, []);

  // ================= FETCH EXPENSES =================
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/salesman-expense`);
        if (data.success) {
          setExpenses(
            data.data.map((exp) => ({
              id: exp._id,
              date: exp.date.split("T")[0],
              salesman: exp.salesmanId?.employeeName || "N/A",
              items: exp.expenses.map((e) => ({
                name: e.expenseName,
                amount: e.amount,
              })),
              totalAmount: exp.totalAmount,
            }))
          );
        }
      } catch (error) {
        toast.error("Failed to load expenses");
      } finally {
        setTimeout(() => setLoading(false), 2000);
      }
    };
    fetchExpenses();
  }, []);

  // ================= GSAP =================
  useEffect(() => {
    if (isSliderOpen) {
      if (sliderRef.current) sliderRef.current.style.display = "block";
      gsap.fromTo(
        sliderRef.current,
        { scale: 0.7, opacity: 0, y: -50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
      );
    } else {
      gsap.to(sliderRef.current, {
        scale: 0.7,
        opacity: 0,
        y: -50,
        duration: 0.3,
        ease: "power3.in",
        onComplete: () => {
          if (sliderRef.current) sliderRef.current.style.display = "none";
        },
      });
    }
  }, [isSliderOpen]);

  // ================= ADD ITEM =================
  const handleAddExpenseItem = () => {
    if (!expenseName || !amount) {
      toast.error("Please enter expense name and amount!");
      return;
    }
    setExpenseItems([
      ...expenseItems,
      { name: expenseName, amount: parseFloat(amount) },
    ]);
    setExpenseName("");
    setExpenseDate(today);
    setAmount("");
  };

  const handleRemoveItem = (index) => {
    setExpenseItems(expenseItems.filter((_, i) => i !== index));
  };

  // ================= SAVE / UPDATE EXPENSE =================
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseDate || expenseItems.length === 0) {
      toast.error("Please complete all fields!");
      return;
    }

    const payload = {
      date: expenseDate,
      // salesmanId: selectedSalesman,
      expenses: expenseItems.map((i) => ({
        expenseName: i.name,
        amount: i.amount,
      })),
    };

    try {
      setIsSaving(true);
      if (editingExpense) {
        // UPDATE
        await axios.put(
          `${API_BASE}/salesman-expense/${editingExpense.id}`,
          payload
        );
        toast.success("Expense updated successfully!");
      } else {
        // CREATE
        await axios.post(`${API_BASE}/salesman-expense`, payload);
        toast.success("Expense added successfully!");
      }

      // Refresh list
      const { data } = await axios.get(`${API_BASE}/salesman-expense`);
      if (data.success) {
        setExpenses(
          data.data.map((exp) => ({
            id: exp._id,
            date: exp.date.split("T")[0],
            salesman: exp.salesmanId?.employeeName || "N/A",
            items: exp.expenses.map((e) => ({
              name: e.expenseName,
              amount: e.amount,
            })),
            totalAmount: exp.totalAmount,
          }))
        );
      }

      setIsSliderOpen(false);
      setExpenseDate("");
      setSelectedSalesman("");
      setExpenseItems([]);
      setEditingExpense(null);
    } catch (err) {
      toast.error("Failed to save expense");
    } finally {
      setIsSaving(false);
    }
  };
  const formDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // ================= EDIT =================
  const handleEdit = (exp) => {
    const salesman = salesmanList.find((s) => s.employeeName === exp.salesman);
    setEditingExpense(exp);
    setExpenseDate(exp.date);
    setSelectedSalesman(salesman?._id || "");
    setExpenseItems(exp.items);
    setIsSliderOpen(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the expense record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        // 🔥 Delete from backend
        await axios.delete(`${API_BASE}/salesman-expense/${id}`);

        // ✅ Remove from local state
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));

        // ✅ Success alert
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Expense deleted successfully.",
          confirmButtonColor: "#3085d6",
        });
      } catch (error) {
        console.error("Error deleting expense:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete expense"
        );
      }
    }
  };

  // filtered array
  const filteredExpenses = expenses.filter((exp) => {
    const term = searchTerm.toLowerCase();
    const itemsNames = exp.items
      .map((i) => i.name)
      .join(", ")
      .toLowerCase();
    return (
      exp.salesman.toLowerCase().includes(term) ||
      itemsNames.includes(term) ||
      exp.date.toLowerCase().includes(term)
    );
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredExpenses.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredExpenses.length / recordsPerPage);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="px-6 mx-auto">
        <CommanHeader />

        {isSaving && (
          <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-[9999]">
            <ScaleLoader color="#1E93AB" size={60} />
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          {/* Left: Title */}
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              City Trader Expense
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your daily expense records
            </p>
          </div>

          {/* Right: Search + Add button */}
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by Expenses, Date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // reset to first page on search
              }}
              className="w-full md:w-64 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={() => setIsSliderOpen(true)}
            >
              + Add Expense
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="hidden lg:grid grid-cols-[80px_150px_1fr_150px_150px] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase border-b">
                <div>Sr</div>
                <div>Date</div>

                <div>Expenses</div>
                <div>Amount</div>
                <div className="text-center">Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {loading ? (
                  <TableSkeleton
                    rows={expenses.length || 5}
                    cols={5}
                    className="lg:grid-cols-[80px_150px_1fr_150px_150px]"
                  />
                ) : expenses.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No expenses found.
                  </div>
                ) : (
                  currentRecords.map((exp, index) => (
                    <div
                      key={exp.id}
                      className="grid grid-cols-1 lg:grid-cols-[80px_150px_1fr_150px_150px] gap-4 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div>{indexOfFirstRecord + index + 1}</div>
                      <div>{formDate(exp.date)}</div>

                      <div className="pl-6">
                        {exp.items.map((i) => i.name).join(", ")}
                      </div>
                      <div className="font-semibold text-blue-600">
                        {exp.totalAmount}
                      </div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setViewExpense(exp)}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(exp)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 bg-white border-t rounded-b-xl mt-2 shadow-sm">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1}–
                    {Math.min(indexOfLastRecord, expenses.length)} of{" "}
                    {expenses.length} expenses
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-newPrimary text-white hover:bg-newPrimary/80"
                      }`}
                    >
                      Previous
                    </button>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-300 cursor-not-allowed"
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
        </div>

        {/* SLIDER FORM */}
        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div
              ref={sliderRef}
              className="relative w-full md:w-[550px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingExpense ? "Update Expense" : "Add New Expense"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setEditingExpense(null);
                    setExpenseDate("");
                    setSelectedSalesman("");
                    setExpenseItems([]);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-4 p-6">
                {/* Date */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                  />
                </div>

                {/* Salesman */}
                {/* <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Salesman <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSalesman}
                    onChange={(e) => setSelectedSalesman(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                  >
                    <option value="">Select Salesman</option>
                    {salesmanList.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.employeeName}
                      </option>
                    ))}
                  </select>
                </div> */}

                {/* Expense Fields */}
                <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Expense Name"
                      value={expenseName}
                      onChange={(e) => setExpenseName(e.target.value)}
                      className="flex-1 p-2 border rounded"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-32 p-2 border rounded"
                    />
                    <button
                      type="button"
                      onClick={handleAddExpenseItem}
                      className="bg-newPrimary text-white px-3 py-2 rounded hover:bg-newPrimary/80"
                    >
                      Add
                    </button>
                  </div>

                  {/* Expense Table */}
                  {expenseItems.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-4 font-semibold text-gray-700 border-b pb-2">
                        <span>Sr</span>
                        <span>Expense</span>
                        <span>Amount</span>
                        <span className="text-center">Action</span>
                      </div>
                      {expenseItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm text-gray-700 py-2 border-b last:border-b-0"
                        >
                          <span className="w-1/12 text-left">{idx + 1}</span>
                          <span className="w-5/12 text-center">
                            {item.name}
                          </span>
                          <span className="w-3/12 text-left">
                            {item.amount}
                          </span>
                          <span className="w-3/12 flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-red-600 hover:bg-red-100 rounded-full transition"
                            >
                              <X size={18} />
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition"
                >
                  {editingExpense ? "Update Expense" : "Save Expense"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {viewExpense && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-newPrimary mb-4">
                Expense Details
              </h2>
              <p>
                <strong>Date:</strong> {viewExpense.date}
              </p>
              <p>
                <strong>Salesman:</strong> {viewExpense.salesman}
              </p>
              <div className="mt-3">
                <h3 className="font-semibold mb-2">Items:</h3>
                <ul className="space-y-1">
                  {viewExpense.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>{item.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 font-semibold text-blue-600">
                Total Amount: {viewExpense.totalAmount}
              </p>
              <button
                onClick={() => setViewExpense(null)}
                className="mt-6 w-full bg-newPrimary text-white py-2 rounded-lg hover:bg-newPrimary/80"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensePage;
