import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, Loader, SquarePen, Trash2 } from "lucide-react";
import axios from "axios";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import ViewModel from "../../../../helper/ViewModel";
import { ScaleLoader } from "react-spinners";

const Loadsheet = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [loads, setLoads] = useState([]);
  const [salesmenOptions, setSalesmenOptions] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadNo, setLoadNo] = useState("");
  const [loadDate, setLoadDate] = useState("");
  const [salesman, setSalesman] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleNoList, setVehicleNoList] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [totalQty, setTotalQty] = useState(0);
  const [prevBalance, setPrevBalance] = useState();
  const [amount, setAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isEnable, setIsEnable] = useState(true);
  const [isView, setIsView] = useState(false);
  const [editingLoad, setEditingLoad] = useState(null);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const sliderRef = useRef(null);
  const [nextLoadNo, setNextLoadNo] = useState("001");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
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
      setSalesmenOptions(res.data.length ? res.data : staticSalesmen);
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

  // Fetch loads
  const fetchLoads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/load-sheets`
      );

      // ✅ Extract array properly
      const loadsData = res.data?.data || [];
      setLoads(loadsData);
    } catch (error) {
      console.error("Failed to fetch loadsheets:", error);
      setTimeout(() => {
        toast.error("Failed to fetch loadsheets.");
      }, 2000);
      // fallback if API fails
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchLoads();
  }, [fetchLoads]);

  //  fetchVechiles
  const fetchVechiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/vehicles/load`
      );

      // ✅ Extract array properly
      const loadsData = res.data.data || [];
      setVehicleNoList(loadsData);
    } catch (error) {
      console.error("Failed to fetch Vehicles:", error);
      setTimeout(() => {
        toast.error("Failed to fetch Vehicles.");
      }, 2000);

      // fallback if API fails
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchVechiles();
  }, [fetchVechiles]);

  // Next Load No
  useEffect(() => {
    if (loads.length > 0) {
      const maxNo = Math.max(
        ...loads.map((l) => {
          const match = l.loadNo?.match(/LOAD-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextLoadNo((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextLoadNo("001");
    }
  }, [loads]);

  // Handlers for form and table actions
  const handleAddClick = () => {
    setEditingLoad(null);
    setLoadNo("");
    setLoadDate("");
    setSalesman("");
    setVehicleNo("");
    setItemsList([]);
    setTotalQty(0);
    setPrevBalance();
    setAmount(0);
    setTotalAmount(0);
    setIsEnable(true);
    setLoadDate(new Date().toISOString().split("T")[0]);
    setIsSliderOpen(true);
  };

  const handleEditClick = (load) => {
    console.log({ load });
    setEditingLoad(load);
    setLoadNo(load.loadNo);
    setLoadDate(formatDate(load.loadDate));

    // ✅ Correctly match the salesman by _id
    const selectedSalesman = salesmenOptions.find(
      (sm) => sm._id === load.salesmanId?._id
    );
    setSalesman(selectedSalesman?._id || "");

    // ✅ Set vehicle
    setVehicleNo(load.vehicleNo || "");

    // ✅ Map products correctly (qty instead of issues)
    setItemsList(
      (load.products || []).map((it, idx) => ({
        sr: idx + 1,
        category: it.category,
        item: it.item,
        pack: it.pack,
        issues: it.qty, // frontend uses this field name
        price: it.price || 0, // if your backend includes it
        amount: it.amount,
      }))
    );

    // ✅ Totals
    setTotalQty(load.totalQty || 0);
    const newPrevBalance = load.salesmanId.preBalance;
    const newAmount =
      load.products?.reduce((sum, it) => sum + (it.amount || 0), 0) || 0;

    setPrevBalance(newPrevBalance);
    setAmount(newAmount);
    setTotalAmount(newPrevBalance + newAmount);
    setIsEnable(load.isEnable ?? true);
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loadDate || !salesman || !vehicleNo) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "⚠️ Please fill in Load Date, Salesman, and Vehicle No.",
        confirmButtonColor: "#d33",
      });
      return;
    }
    setIsSaving(true);
    const newLoad = {
      loadNo: editingLoad ? loadNo : `LOAD-${nextLoadNo}`,
      loadDate,
      salesmanId: salesman, // backend expects ID
      vehicleNo,
      products: itemsList.map((item) => ({
        category: item.category,
        item: item.item,
        pack: item.pack,
        qty: item.issues || 0,
        amount: item.amount || 0,
      })),
      totalQty,
      totalAmount,
    };

    try {
      if (editingLoad) {
        // Update existing loadsheet
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/load-sheets/${editingLoad._id}`,
          newLoad,
          { headers }
        );
        Swal.fire("Updated!", "Loadsheet updated successfully.", "success");
      } else {
        // Create new loadsheet
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/load-sheets`,
          newLoad,
          { headers }
        );
        Swal.fire("Added!", "Loadsheet added successfully.", "success");
      }

      // Refresh list
      fetchLoads();
      setIsSliderOpen(false);
      setItemsList([]);
    } catch (error) {
      console.error("Error saving loadsheet:", error);
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
              `${import.meta.env.VITE_API_BASE_URL}/load-sheets/${id}`,
              { headers }
            );
            setLoads(loads.filter((l) => l._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Loadsheet deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete loadsheet.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Loadsheet is safe 🙂",
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
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/order-taker/products/${selectedId}`
      );
      const products = res.data?.data || [];

      setItemsList(
        products.map((p, idx) => ({
          sr: idx + 1,
          category: p.categoryName,
          item: p.itemName,
          pack: p.itemUnit,
          issues: p.qty,
          price: p.rate,
          amount: p.totalAmount,
        }))
      );

      // ✅ Add these lines
      const newTotalQty = products.reduce((sum, p) => sum + (p.qty || 0), 0);
      const newAmount = products.reduce(
        (sum, p) => sum + (p.totalAmount || 0),
        0
      );
      setTotalQty(newTotalQty);
      setAmount(newAmount);
      setTotalAmount((selectedSalesman?.preBalance || 0) + newAmount);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load items.");
    } finally {
      setItemsLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = loads.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(loads.length / recordsPerPage);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              Loadsheet Details
            </h1>
          </div>
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
            onClick={handleAddClick}
          >
            + Add Loadsheet
          </button>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-screen overflow-y-auto custom-scrollbar">
              <div className="inline-block min-w-[1200px] w-full align-middle">
                <div className="hidden lg:grid grid-cols-[20px_1fr_1fr_1fr_1fr_1fr_1fr] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                  <div>SR#</div>
                  <div>Load No</div>
                  <div>Salesman</div>
                  <div>Pre-Balance</div>
                  <div>Load Date</div>
                  <div>Vehicle No</div>
                  <div className={`${loading ? "" : "text-right"}`}>
                    Actions
                  </div>
                </div>

                <div className="flex flex-col divide-y divide-gray-100">
                  {loading ? (
                    <TableSkeleton
                      rows={loads.length > 0 ? loads.length : 5}
                      cols={7}
                      className="lg:grid-cols-[20px_1fr_1fr_1fr_1fr_1fr_1fr]"
                    />
                  ) : loads.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No loadsheets found.
                    </div>
                  ) : (
                    currentRecords.map((load, idx) => (
                      <div
                        key={load._id}
                        className="grid grid-cols-1 lg:grid-cols-[20px_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                        <div className="text-gray-600">{idx + 1}</div>
                        <div className="text-gray-600 ">{load.loadNo}</div>
                        <div className="text-gray-600">
                          {load.salesmanId?.employeeName || "N/A"}
                        </div>
                        <div className="text-gray-600">
                          {load.salesmanId?.preBalance ?? 0}
                        </div>
                        <div className="text-gray-600">
                          {new Date(load.loadDate).toLocaleDateString("en-GB")}
                        </div>
                        <div className="text-gray-600">
                          {load.vehicleNo || "N/A"}
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEditClick(load)}
                            className="py-1 text-sm rounded text-blue-600"
                            title="Edit"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(load._id)}
                            className="py-1 text-sm text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLoad(load);
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
                {/* ✅ Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 bg-white border-t">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstRecord + 1} to{" "}
                      {Math.min(indexOfLastRecord, loads.length)} of{" "}
                      {loads.length} records
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
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
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
                  {editingLoad ? "Update Loadsheet" : "Add a New Loadsheet"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setLoadNo("");
                    setLoadDate("");
                    setSalesman("");
                    setVehicleNo("");
                    setItemsList([]);
                    setTotalQty(0);
                    setPrevBalance(0);
                    setAmount(0);
                    setTotalAmount(0);
                    setIsEnable(true);
                    setEditingLoad(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                <div className=" flex gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Load No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingLoad ? loadNo : `LOAD-${nextLoadNo}`}
                      onChange={(e) => setLoadNo(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      placeholder="Enter Load No."
                      readOnly={!!editingLoad}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Load Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={loadDate}
                      onChange={(e) => setLoadDate(e.target.value)}
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
                  <div className="flex-1 min-w-0">
                    <label className="block text-gray-700 font-medium mb-2">
                      Vehicle No. <span className="text-red-500">*</span>
                    </label>
                    <select
                      readOnly
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary bg-white"
                    >
                      <option value="">Select Vehicle No.</option>
                      {vehicleNoList.map((vec) => (
                        <option value={vec.vehicleNo}>{vec.vehicleNo}</option>
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
                      Loading items...
                    </span>
                  </div>
                ) : (
                  itemsList.length > 0 && (
                    <div className="space-y-4 ">
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
                                  Item
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Pack
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Issues
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
                                    {item.category}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    {item.item}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    {item.pack}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    {item.issues}
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
                  <div className="flex flex-col text-gray-800 font-medium text-lg w-full ml-auto">
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
                    : editingLoad
                    ? "Update Loadsheet"
                    : "Save Loadsheet"}
                </button>
              </form>
            </div>
          </div>
        )}

        {isView && selectedLoad && (
          <ViewModel
            data={selectedLoad}
            type="loadsheet"
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

export default Loadsheet;
