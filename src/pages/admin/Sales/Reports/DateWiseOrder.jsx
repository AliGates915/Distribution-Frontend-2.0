import React, { useState, useEffect } from "react";
import { api } from "../../../../context/ApiService";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import ViewModal from "../../../../helper/ViewModel";
import { Eye } from "lucide-react";

const DatewiseOrder = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isView, setIsView] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  // ✅ Fetch without filter
  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sales-report/datewise");
      setReports(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  // ✅ Fetch with filter
  const fetchFilteredReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/sales-report/datewise?fromDate=${dateFrom}&toDate=${dateTo}`
      );
      setReports(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error fetching filtered reports:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  // ✅ Auto-fetch
  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchFilteredReports();
    } else {
      fetchAllReports();
    }
  }, [dateFrom, dateTo]);
  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = reports.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(reports.length / recordsPerPage);

 useEffect(() => {
  if (dateFrom && dateTo) {
    fetchFilteredReports();
  } else {
    fetchAllReports();
  }
  setCurrentPage(1); // reset page
}, [dateFrom, dateTo]);


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-newPrimary">
            Datewise Sales Report
          </h1>
        </div>

        {/* Date Filters */}
        <div className="flex gap-5 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="p-3 border rounded-md w-48"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="p-3 border rounded-md w-48"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[800px]">
            <div className="min-w-[1000px]">
              {/* Header */}
              <div className="hidden lg:grid grid-cols-[20px_1fr_1fr_1fr_1.5fr_1fr_1fr_80px] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Sr</div>
                <div>Invoice No</div>
                <div>Invoice Date</div>
                <div>Order ID</div>
                <div>Customer</div>
                <div>Salesman</div>
                <div>Total Amount</div>
                <div>View</div>
              </div>

              {/* Body */}
              <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
                {loading ? (
                  <TableSkeleton
                    rows={reports.length || 5}
                    cols={8}
                    className="lg:grid-cols-[20px_1fr_1fr_1fr_1.5fr_1fr_1fr_80px]"
                  />
                ) : reports.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No records found.
                  </div>
                ) : (
                  currentRecords.map((entry, i) => (
                    <div
                      key={entry._id || i}
                      className="grid grid-cols-1 lg:grid-cols-[20px_1fr_1fr_1fr_1.5fr_1fr_1fr_80px] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div>{i + 1}</div>
                      <div>{entry.invoiceNo}</div>
                      <div>
                        {new Date(entry.invoiceDate).toLocaleDateString()}
                      </div>
                      <div>{entry?.orderTakingId?.orderId}</div>
                      <div>
                        {entry?.orderTakingId?.customerId?.customerName}
                      </div>
                      <div>{entry?.salesmanId?.employeeName}</div>
                      <div>{entry?.totalAmount}</div>
                      <div>
                        <button
                          onClick={() => {
                            setSelectedInvoice(entry);
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
              {/* ✅ Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1} to{" "}
                    {Math.min(indexOfLastRecord, reports.length)} of{" "}
                    {reports.length} records
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
      </div>
      {isView && selectedInvoice && (
        <ViewModal
          type="DateWise-Sales"
          data={selectedInvoice}
          onClose={() => setIsView(false)}
        />
      )}
    </div>
  );
};

export default DatewiseOrder;
