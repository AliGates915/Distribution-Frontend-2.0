import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";

import { api } from "../../../../context/ApiService";
import ViewModal from "../../../../helper/ViewModel";

const ProductwiseOrders = () => {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState([]);
  const [salesmanList, setSalesmanList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isView, setIsView] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = salesmanList.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(salesmanList.length / recordsPerPage);

  // ✅ Fetch product list
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/item-details/reports");
      setProductName(response);
    } catch (error) {
      console.error("Failed to fetch product list", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // ✅ Fetch product-wise data
  const fetchProductList = useCallback(async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/sales-report/productwise/${id}`);
      setSalesmanList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch product data", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductList(selectedProduct);
    }
  }, [selectedProduct, fetchProductList]);


  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProduct]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />

      <div className="px-6 mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-newPrimary">
            Product Order Details
          </h1>
        </div>

        {/* Product Dropdown */}
        <div className="flex gap-6">
          <div className="w-[400px]">
            <label className="block text-gray-700 font-medium mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
              required
            >
              <option value="">Select Product</option>
              {productName?.map((cust) => (
                <option key={cust._id} value={cust._id}>
                  {cust.itemName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl shadow border border-gray-200 overflow-hidden mt-6">
          {selectedProduct ? (
            <div className="overflow-y-auto lg:overflow-x-auto max-h-screen">
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

                {/* Table Body */}
                <div className="flex flex-col divide-y divide-gray-100">
                  {loading ? (
                    <TableSkeleton
                      rows={salesmanList.length || 5}
                      cols={8}
                      className="lg:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                    />
                  ) : salesmanList.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No records found for this product.
                    </div>
                  ) : (
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
                        <div>{entry?.totalAmount || 0}</div>
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
                  )}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstRecord + 1} to{" "}
                      {Math.min(indexOfLastRecord, salesmanList.length)} of{" "}
                      {salesmanList.length} records
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
            <div className="text-center py-6 text-gray-500 bg-white rounded-lg mt-6">
              Please select a product to view product entries.
            </div>
          )}
        </div>

        {/* ✅ View Modal Integration */}
        {isView && selectedOrder && (
          <ViewModal
            type="productwise"
            data={selectedOrder}
            onClose={() => setIsView(false)}
          />
        )}

        {/* Custom Scrollbar */}
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

export default ProductwiseOrders;
