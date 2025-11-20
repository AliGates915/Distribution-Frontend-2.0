import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import { api } from "../../../../context/ApiService";
import ViewModal from "../../../../helper/ViewModel";

const CustomerwiseOrders = () => {
  const [customerName, setCustomerName] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // 👁️ View modal state
  const [isView, setIsView] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  // Fetch customers
  const fetchCustomerName = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/customers/reports");
      setCustomerName(response);
    } catch (error) {
      console.error("Failed to fetch customer list", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchCustomerName();
  }, [fetchCustomerName]);

  // Fetch invoices by customer
  const fetchCustomerList = useCallback(async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/sales-report/customerwise/${id}`);
      setProductList(response.data);
    } catch (error) {
      console.error("Failed to fetch customerwise data", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    if (selectedCustomer) fetchCustomerList(selectedCustomer);
  }, [selectedCustomer, fetchCustomerList]);

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const totalPages = Math.ceil(productList.length / recordsPerPage);
  const currentRecords = productList.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCustomer]);
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-newPrimary">
            Customerwise Order Details
          </h1>
        </div>

        {/* Dropdown */}
        <div className="w-[400px] mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
          >
            <option value="">Select Customer</option>
            {customerName?.map((cust) => (
              <option key={cust._id} value={cust._id}>
                {cust.customerName}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          {selectedCustomer ? (
            <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
              <div className="min-w-full custom-scrollbar">
                {/* Table Header */}
                <div className="hidden lg:grid grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                  <div>SR</div>
                  <div>Invoice No</div>
                  <div>Invoice Date</div>
                  <div>Order ID</div>
                  <div>Customer Name</div>
                  <div>Salesman</div>
                  <div>Total Amount</div>
                  <div>View</div>
                </div>

                {/* Table Rows */}
                <div className="flex flex-col divide-y divide-gray-100">
                  {loading ? (
                    <TableSkeleton
                      rows={5}
                      cols={8}
                      className="lg:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                    />
                  ) : currentRecords.length > 0 ? (
                    currentRecords.map((entry, index) => (
                      <div
                        key={entry._id}
                        className="grid grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                       <div>{indexOfFirstRecord + index + 1}</div>
                        <div>{entry.invoiceNo}</div>
                        <div>
                          {new Date(entry.invoiceDate).toLocaleDateString()}
                        </div>
                        <div>{entry?.orderTakingId?.orderId || "N/A"}</div>
                        <div>
                          {entry?.orderTakingId?.customerId?.customerName ||
                            "N/A"}
                        </div>
                        <div>{entry?.salesmanId?.employeeName || "N/A"}</div>
                        <div>{entry?.totalAmount}</div>
                        <div>
                          <button
                            onClick={() => {
                              setSelectedOrder(entry);
                              setIsView(true);
                            }}
                            className="text-amber-600 hover:bg-amber-50 rounded p-1"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No records found for this customer.
                    </div>
                  )}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstRecord + 1} to{" "}
                      {Math.min(indexOfLastRecord, productList.length)} of{" "}
                      {productList.length} records
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
          ) : (
            <div className="text-center py-6 text-gray-500 bg-white rounded-lg">
              Please select a customer to view entries.
            </div>
          )}
        </div>

        {/* 👁️ View Modal */}
        {isView && selectedOrder && (
          <ViewModal
            type="customerwise"
            data={selectedOrder}
            onClose={() => setIsView(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerwiseOrders;
