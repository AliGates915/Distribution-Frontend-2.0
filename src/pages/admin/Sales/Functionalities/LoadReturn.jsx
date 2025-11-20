import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, Loader, SquarePen, Trash2 } from "lucide-react";
import axios from "axios";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import ViewModel from "../../../../helper/ViewModel";
import { ScaleLoader } from "react-spinners";

const LoadReturn = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [loadReturns, setLoadReturns] = useState([]);
  const [salesmenOptions, setSalesmenOptions] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadNo, setLoadNo] = useState("");
  const [loadDate, setLoadDate] = useState("");
  const [salesman, setSalesman] = useState("");
  const [itemsList, setItemsList] = useState([]);
  const [totalQty, setTotalQty] = useState(0);
  const [prevBalance, setPrevBalance] = useState();
  const [amount, setAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isEnable, setIsEnable] = useState(true);
  const [isView, setIsView] = useState(false);
  const [editingLoadReturn, setEditingLoadReturn] = useState(null);
  const [selectedLoadReturn, setSelectedLoadReturn] = useState(null);
  const sliderRef = useRef(null);
  const [nextLoadNo, setNextLoadNo] = useState("001");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const { token } = userInfo || {};
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch salesmen options
  const fetchSalesmenOptions = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/employees/orders`
      );
      setSalesmenOptions( res.data );
    } catch (error) {
      console.error("Failed to fetch salesmen:", error);
      setTimeout(() => {
        toast.error("Failed to fetch salesmen. Using static data.");
      }, 2000);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchSalesmenOptions();
  }, [fetchSalesmenOptions]);

  // Fetch load returns
  const fetchLoadReturns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/load-sheets`
      );

      // ✅ Extract array properly
      const loadReturnsData = res.data?.data || [];
      setLoadReturns(loadReturnsData);
    } catch (error) {
      console.error("Failed to fetch load returns:", error);
      setTimeout(() => {
        toast.error("Failed to fetch load returns.");
      }, 2000);
      // fallback if API fails
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchLoadReturns();
  }, [fetchLoadReturns]);

  // Next Load Return No
  useEffect(() => {
    if (loadReturns.length > 0) {
      const maxNo = Math.max(
        ...loadReturns.map((lr) => {
          const match = lr.loadReturnNo?.match(/LR-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextLoadNo((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextLoadNo("001");
    }
  }, [loadReturns]);

  // Handlers for form and table actions
  const handleAddClick = () => {
    setEditingLoadReturn(null);
    setLoadNo("");
    setLoadDate("");
    setSalesman("");
    setItemsList([]);
    setTotalQty(0);
    setPrevBalance();
    setAmount(0);
    setTotalAmount(0);
    setIsEnable(true);
    setLoadDate(new Date().toISOString().split("T")[0]);
    setIsSliderOpen(true);
  };

  const handleEditClick = (loadReturn) => {
    console.log({ loadReturn });
    setEditingLoadReturn(loadReturn);
    setLoadNo(loadReturn.loadReturnNo);
    setLoadDate(formatDate(loadReturn.loadDate));

    // ✅ Correctly match the salesman by _id
    const selectedSalesman = salesmenOptions.find(
      (sm) => sm._id === loadReturn.salesmanId?._id
    );
    setSalesman(selectedSalesman?._id || "");

    // ✅ Map products correctly (qty instead of issues)
    setItemsList(
      (loadReturn.invoices || []).map((inv, idx) => ({
        sr: idx + 1,
        invoiceNo: inv.invoiceNo,
        invoiceDate: inv.invoiceDate,
        orderId: inv.orderId,
        customerName: inv.customerName,
        qty: inv.qty || 0,
        amount: inv.amount || 0,
      }))
    );

    // ✅ Totals
    setTotalQty(loadReturn.totalQty || 0);
    const newPrevBalance = loadReturn.salesmanId.preBalance;
    const newAmount =
      loadReturn.invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

    setPrevBalance(newPrevBalance);
    setAmount(newAmount);
    setTotalAmount(newPrevBalance + newAmount);
    setIsEnable(loadReturn.isEnable ?? true);
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loadDate || !salesman) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "⚠️ Please fill in Load Return Date and Salesman.",
        confirmButtonColor: "#d33",
      });
      return;
    }
    setIsSaving(true);
    const newLoadReturn = {
      loadReturnNo: editingLoadReturn ? loadReturnNo : `LR-${nextLoadNo}`,
      loadDate,
      salesmanId: salesman, // backend expects ID
      invoices: itemsList.map((item) => ({
        invoiceNo: item.invoiceNo,
        invoiceDate: item.invoiceDate,
        orderId: item.orderId,
        customerName: item.customerName,
        qty: item.qty || 0,
        amount: item.amount || 0,
      })),
      totalQty,
      totalAmount,
    };

    try {
      if (editingLoadReturn) {
        // Update existing load return
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/load-returns/${editingLoadReturn._id}`,
          newLoadReturn,
          { headers }
        );
        Swal.fire("Updated!", "Load Return updated successfully.", "success");
      } else {
        // Create new load return
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/load-returns`,
          newLoadReturn,
          { headers }
        );
        Swal.fire("Added!", "Load Return added successfully.", "success");
      }

      // Refresh list
      fetchLoadReturns();
      setIsSliderOpen(false);
      setItemsList([]);
    } catch (error) {
      console.error("Error saving load return:", error);
      Swal.fire("Error!", "Something went wrong while saving.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "Invalid Date";
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();
    return `${year}-${month}-${day}`;
  };

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
            const { token } = userInfo || {};
            const headers = {
              Authorization: `Bearer ${token}`,
            };
            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/load-returns/${id}`,
              { headers }
            );
            setLoadReturns(loadReturns.filter((lr) => lr._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Load Return deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete load return.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Load Return is safe 🙂",
            "error"
          );
        }
      });
  };

const handleSalesmanChange = async (e) => {
  const selectedId = e.target.value;
  setSalesman(selectedId);

  const selectedSalesman = salesmenOptions.find(
    (sm) => sm._id === selectedId
  );
  setPrevBalance(selectedSalesman?.preBalance || 0);

  if (!selectedId) return;

  try {
    setItemsLoading(true);

    // ✅ Correct API endpoint (removed hardcoded ID)
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/sales-invoice/salesman/${selectedId}`
    );

    const invoices = res.data?.data || [];


    // ✅ Flatten and map invoice + product details
    const formattedItems = invoices.flatMap((inv, idx) =>
      inv.products.map((prod, pIdx) => ({
        sr: `${idx + 1}`,
        invoiceNo: inv.invoiceNo,
        invoiceDate: new Date(inv.invoiceDate).toLocaleDateString(),
        orderId: inv.orderTakingId?.orderId || "N/A",
        customerName: inv.orderTakingId?.customerId?.customerName || "N/A",
        itemName: prod.itemName,
        categoryName: prod.categoryName || "-",
        unit: prod.itemUnit,
        issue: prod.issue,
        sold: prod.sold,
        returned: prod.return,
        rate: prod.rate,
        totalAmount: prod.totalAmount,
      }))
    );

    setItemsList(formattedItems);

    // ✅ Calculate total sold quantity and amount
    const totalQty = formattedItems.reduce(
      (sum, item) => sum + (item.sold || 0),
      0
    );
    const totalAmount = formattedItems.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );

    setTotalQty(totalQty);
    setAmount(totalAmount);
    setTotalAmount((selectedSalesman?.preBalance || 0) + totalAmount);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    toast.error("Failed to load invoices.");
  } finally {
    setItemsLoading(false);
  }
};


  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              Load Return Details
            </h1>
          </div>
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
            onClick={handleAddClick}
          >
            + Add Load Return
          </button>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="inline-block min-w-[1200px] w-full align-middle">
                <div className="hidden lg:grid grid-cols-[20px_1fr_1fr_1fr_1fr_1fr] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                  <div>SR#</div>
                  <div>Load Return No.</div>
                  <div>Salesman</div>
                  <div>Invoice No</div>
                  <div>Load Return Date</div>
                  <div className={`${loading ? "" : "text-right"}`}>
                    Actions
                  </div>
                </div>

                <div className="flex flex-col divide-y divide-gray-100">
                  {loading ? (
                    <TableSkeleton
                      rows={loadReturns.length > 0 ? loadReturns.length : 5}
                      cols={6}
                      className="lg:grid-cols-[20px_1fr_1fr_1fr_1fr_1fr]"
                    />
                  ) : loadReturns.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No load returns found.
                    </div>
                  ) : (
                    loadReturns.map((loadReturn, idx) => (
                      <div
                        key={loadReturn._id}
                        className="grid grid-cols-1 lg:grid-cols-[20px_1fr_1fr_1fr_1fr_1fr] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                        <div className="text-gray-600">{idx + 1}</div>
                        <div className="text-gray-600">{loadReturn.loadNo}</div>
                        <div className="text-gray-600">
                          {loadReturn.salesmanId?.employeeName || "N/A"}
                        </div>
                        <div className="text-gray-600">
                          {loadReturn.loadNo || "N/A"}
                        </div>
                        <div className="text-gray-600">
                          {new Date(loadReturn.loadDate).toLocaleDateString("en-GB")}
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEditClick(loadReturn)}
                            className="py-1 text-sm rounded text-blue-600"
                            title="Edit"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(loadReturn._id)}
                            className="py-1 text-sm text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLoadReturn(loadReturn);
                              setIsView(true);
                            }}
                            className="text-amber-600 hover:bg-amber-50 rounded"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div
              ref={sliderRef}
              className="relative w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              {isSaving && (
                <div className="absolute top-0 left-0 w-full h-full bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-50">
                  <ScaleLoader color="#1E93AB" size={60} />
                </div>
              )}
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingLoadReturn ? "Update Load Return" : "Add a New Load Return"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setLoadNo("");
                    setLoadDate("");
                    setSalesman("");
                    setItemsList([]);
                    setTotalQty(0);
                    setPrevBalance(0);
                    setAmount(0);
                    setTotalAmount(0);
                    setIsEnable(true);
                    setEditingLoadReturn(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Load Return No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingLoadReturn ? loadNo : `LR-${nextLoadNo}`}
                      onChange={(e) => setLoadNo(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      placeholder="Enter Load Return No."
                      readOnly={!!editingLoadReturn}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Load Return Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={loadDate}
                      onChange={(e) => setloadDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Salesman <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={salesman}
                      onChange={handleSalesmanChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      required
                    >
                      <option value="">Select Salesman</option>
                      {salesmenOptions.map((sm) => (
                        <option key={sm._id} value={sm._id}>
                          {sm.employeeName || "N/A"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {itemsLoading ? (
                  <div className="flex justify-center items-center py-6 text-gray-500">
                    <span className="animate-spin">
                      <Loader size={22} />
                    </span>
                    <span className="ml-2 text-newPrimary">
                      Loading invoices...
                    </span>
                  </div>
                ) : (
                  itemsList.length > 0 && (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full border-collapse">
                            <thead className="bg-gray-100 text-gray-600 text-sm">
                              <tr>
                                <th className="px-4 py-2 border border-gray-300">
                                  Sr #
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Category
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Item Name
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Pack
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Issue
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Sold
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Return
                                </th>
                                 <th className="px-4 py-2 border border-gray-300">
                                  Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody className="text-gray-700 text-sm">
                              {itemsList.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-gray-50 text-center"
                                >
                                  <td className="px-4 py-2 border border-gray-300 text-center">
                                    {item.sr}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    {item.categoryName}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    {item.itemName}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    {item.unit}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    {item.issue}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    {item.sold}
                                  </td>
                                   <td className="px-4 py-2 border border-gray-300">
                                    {item.returned}
                                  </td>
                                   <td className="px-4 py-2 border border-gray-300">
                                    {item.totalAmount}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )
                )}

                <div className="grid grid-cols-2 gap-80 items-start">
                  {/* Left side — Prev Balance box */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Prev Balance
                    </label>
                    <input
                      type="number"
                      value={prevBalance}
                      readOnly
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary bg-gray-100"
                      placeholder="Prev Balance"
                    />
                  </div>

                  {/* Right side — Text labels only */}
                  <div className="flex flex-col text-gray-800 font-medium text-lg w-44 ml-auto">
                    <div className="flex justify-between">
                      <p>Total Qty:</p>
                      <span className="font-semibold">{totalQty}</span>
                    </div>
                    <div className="flex justify-between">
                      <p>Amount:</p>
                      <span className="font-semibold">{amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <p>Total Amount:</p>
                      <span className="font-semibold">{totalAmount}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                  {loading
                    ? "Saving..."
                    : editingLoadReturn
                    ? "Update Load Return"
                    : "Save Load Return"}
                </button>
              </form>
            </div>
          </div>
        )}

        {isView && selectedLoadReturn && (
          <ViewModel
            data={selectedLoadReturn}
            type="loadreturn"
            onClose={() => setIsView(false)}
          />
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

export default LoadReturn;