import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, Loader, Printer, SquarePen } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import { InvoiceTemplate } from "../../../../helper/InvoiceTemplate";
import axios from "axios";
import { use } from "react";
import { api } from "../../../../context/ApiService";
import { handleSaleInvoicePrint } from "../../../../helper/SalesPrintView";

const SalesInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSalesman, setSelectedSalesman] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [isSaving, setIsSaving] = useState(false);
  const today = new Date().toLocaleDateString("en-CA");
  const [date, setDate] = useState(today);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [salesman, setSalesman] = useState("");
  const [salesmanList, setSalesmanList] = useState([]);
  const [previousBalance, setPreviousBalance] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState("");
  const [receivable, setReceivable] = useState("");
  const [received, setReceived] = useState("");
  const [balance, setBalance] = useState("");
  const [receivingDate, setReceivingDate] = useState("");
  const [isView, setIsView] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const invoiceRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const headers = {
    headers: {
      Authorization: `Bearer ${userInfo?.token}`,
    },
  };

  // ✅ Fetch all or filtered pending orders
  async function fetchSalesInvoiceList() {
    try {
      setLoading(true);

      let url = `${import.meta.env.VITE_API_BASE_URL}/order-taker/pending`;
      let params = {}; // ✅ declare params first

      // If salesman is selected, apply filter query
      if (selectedSalesman) {
        params = {
          date: date,
          salesmanId: selectedSalesman,
        };
      }

      // ✅ include params only if needed
      const res = await axios.get(url, { params });

      // ✅ Handle response
      setInvoices(res.data?.data || []);
      // console.log("✅ Pending Orders Response:", res.data);
    } catch (error) {
      console.error("❌ Failed to fetch SalesInvoice:", error);
      setTimeout(() => {
        toast.error("Failed to fetch pending orders");
      }, 2000);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  // 🔹 Load all data initially
  useEffect(() => {
    fetchSalesInvoiceList();
  }, []);

  // 🔹 Re-fetch when date or salesman changes
  useEffect(() => {
    if (selectedSalesman || date) {
      fetchSalesInvoiceList();
    }
  }, [selectedSalesman, date]);

  // salesmanList
  const fetchSaleman = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/employees/salesman`);

      setSalesmanList(response.employees);
    } catch (error) {
      console.error(" Failed to fetch customers by salesman:", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };
  useEffect(() => {
    fetchSaleman();
  }, []);

  // ✅ Format date
  const formDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // ✅ Edit handler
  // ✅ Edit handler (safe version)
  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setInvoiceId(invoice.orderId || "");
    setInvoiceDate(invoice.date || "");

    // Safely access nested data
    setCustomer(invoice.customerId?.customerName || "N/A");
    setSalesman(invoice.salesmanId?.employeeName || "N/A");
    setPreviousBalance(invoice.customerId?.salesBalance || 0);
    setDeliveryDate(new Date().toISOString().split("T")[0]); // current date

    // map products correctly
    const mappedItems = (invoice.products || []).map((p) => ({
      item: p.itemName || "",
      rate: p.rate || 0,
      qty: p.qty || 0,
      total: p.totalAmount || 0,
    }));
    setItems(mappedItems);

    setTotalPrice(invoice.totalAmount || 0);
    setDiscountAmount("");
    setReceivable(invoice.totalAmount || 0);
    setReceived("");
    setBalance(invoice.totalAmount || 0);

    // ✅ handle missing agingDate
    let agingDate = invoice.customerId?.timeLimit;
    if (!agingDate) {
      const delivery = new Date();
      delivery.setDate(delivery.getDate() + 30); // add 30 days
      agingDate = delivery.toISOString().split("T")[0];
    } else {
      agingDate = agingDate.split("T")[0];
    }

    setReceivingDate(agingDate);
    setIsSliderOpen(true);
  };

  // ✅ Total recalculation
  useEffect(() => {
    const total = items.reduce((acc, item) => acc + item.total, 0);
    setTotalPrice(total);
    const discount = parseFloat(discountAmount) || 0;
    const receivableAmt = total - discount;
    setReceivable(receivableAmt);
    const bal = receivableAmt - (parseFloat(received) || 0);
    setBalance(bal);
  }, [items, discountAmount, received]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      const payload = {
        invoiceNo: invoiceId,
        invoiceDate: new Date().toISOString().split("T")[0],
        customerId: editingInvoice.customerId._id,
        salesmanId: editingInvoice.salesmanId._id,
        orderTakingId: editingInvoice._id,
        products: items.map((item) => ({
          itemName: item.item,
          rate: item.rate,
          qty: item.qty,
          totalAmount: item.total,
        })),
        totalAmount: receivable,
        receivable: receivable,
        received: parseFloat(received) || 0,
        deliveryDate: deliveryDate,
        agingDate: receivingDate,
        status: "Pending", // default
      };
      // console.log("🧾 Payload to send:", payload);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/sales-invoice`,
        payload,
        headers
      );

      Swal.fire({
        icon: "success",
        title: "Invoice Created!",
        text: "Invoice posted successfully to server.",
        confirmButtonColor: "#3085d6",
      });

      setIsSliderOpen(false);
      fetchSalesInvoiceList();
    } catch (error) {
      console.error(" Invoice post error:", error);
      toast.error(error.response?.data?.message || "Failed to post invoice");
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const orderId = invoice.orderId?.toLowerCase() || "";
    const customerName = invoice.customerId?.customerName?.toLowerCase() || "";
    const salesmanName = invoice.salesmanId?.employeeName?.toLowerCase() || "";

    return (
      orderId.includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase()) ||
      salesmanName.includes(searchTerm.toLowerCase())
    );
  });

  // 🔢 Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredInvoices.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredInvoices.length / recordsPerPage);
  // console.log({currentRecords});

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      {loading ? (
        <div className="w-full flex justify-center items-center h-screen">
          <Loader size={70} color="#1E93AB" className=" animate-spin" />
        </div>
      ) : (
        <div className="px-6 mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-newPrimary">
              Pending Orders
            </h1>
            {currentRecords.length > 0 && (
              <button
                onClick={() => handleSaleInvoicePrint(currentRecords)}
                className="flex items-center gap-2 bg-newPrimary text-white px-4 py-2 rounded-md hover:bg-newPrimary/80"
              >
                <Printer size={18} />
              </button>
            )}
          </div>

          {/* 🔹 Filter Fields */}
          <div className="flex flex-wrap justify-between items-start gap-8 w-full mt-4 mb-1">
            {/* Date + Invoice in left column */}
            <div className="flex flex-wrap justify-between items-center gap-8 w-full mt-4 mb-5">
              {/* Left: Date + Salesman */}
              <div className="flex gap-8 flex-wrap">
                <div className="flex items-center gap-6">
                  <label className="text-gray-700 font-medium w-24">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    max={today}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-[250px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="text-gray-700 font-medium w-24">
                    Salesman <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSalesman}
                    onChange={(e) => setSelectedSalesman(e.target.value)}
                    className="w-[250px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  >
                    <option value="">Select Salesman</option>
                    {salesmanList.map((cust) => (
                      <option key={cust._id} value={cust._id}>
                        {cust.employeeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right: Search Bar */}
              <div className="ml-auto flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by Customer, Salesman..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // reset to first page on search
                  }}
                  className="w-64 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                />
                {currentRecords.length > 0 && (
                  <button
                    onClick={() => handleSaleInvoicePrint(currentRecords)}
                    className="flex items-center gap-2 bg-newPrimary text-white px-4 py-2 rounded-md hover:bg-newPrimary/80"
                  >
                    <Printer size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Table */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-y-auto lg:overflow-x-auto max-h-[800px]">
              <div className="min-w-[1000px]">
                <div className="hidden lg:grid grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                  <div>SR</div>
                  <div>Order ID</div>
                  <div>Order Date</div>
                  <div>Salesman</div>
                  <div>Customer</div>
                  <div>Amount</div>
                  <div>Action</div>
                </div>

                <div className="flex flex-col divide-y divide-gray-100">
                  {loading ? (
                    <TableSkeleton
                      rows={invoices.length > 0 ? invoices.length : 5}
                      cols={7} // SR, Order ID, Date, Salesman, Customer, Phone, Actions
                      className="lg:grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                    />
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No Sales Invoice Found
                    </div>
                  ) : (
                    currentRecords.map((invoice, index) => (
                      <div
                        key={invoice._id}
                        className="grid grid-cols-1 lg:grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                        <div>{indexOfFirstRecord + index + 1}</div>
                        <div>{invoice.orderId || "-"}</div>
                        <div>{formDate(invoice.date) || "-"}</div>
                        <div>{invoice.salesmanId?.employeeName || "-"}</div>
                        <div>{invoice.customerId?.customerName || "-"}</div>
                        <div>{invoice.customerId?.salesBalance ?? "-"}</div>
                        <div className="flex gap-3 justify-start">
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="text-blue-600 hover:bg-blue-50 rounded p-1 transition-colors"
                            title="Edit"
                          >
                            <SquarePen size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 bg-white border-t">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstRecord + 1} to{" "}
                      {Math.min(indexOfLastRecord, invoices.length)} of{" "}
                      {invoices.length} invoices
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

          {/* ✅ Form slider */}
          {isSliderOpen && (
            <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
              <div className="relative w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[85vh] md:max-h-[90vh]">
                {isSaving && (
                  <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[60]">
                    <ScaleLoader color="#1E93AB" size={60} />
                  </div>
                )}
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                  <h2 className="text-xl font-bold text-newPrimary">
                    Edit Pending Orders
                  </h2>
                  <button
                    className="text-2xl text-gray-500 hover:text-gray-700"
                    onClick={() => setIsSliderOpen(false)}
                  >
                    ×
                  </button>
                </div>

                {/* ✅ Form (same styling preserved) */}
                <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 border p-4 rounded-lg">
                    <div className="flex gap-3">
                      <label className="block text-gray-700 font-medium">
                        Order No. :
                      </label>
                      <p>{invoiceId}</p>
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Order Date :
                      </label>
                      <p>{formDate(invoiceDate)}</p>
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Customer :
                      </label>
                      <p>{customer}</p>
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Salesman :
                      </label>
                      <p>{salesman}</p>
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Previous Balance :
                      </label>
                      <p>{previousBalance}</p>
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Delivery Date :
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>
                  </div>

                  {/* ✅ Items table */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Items
                    </h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-[60px_2fr_1fr_1fr_1fr] bg-gray-200 text-gray-600 text-sm font-semibold uppercase border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300">
                          SR#
                        </div>
                        <div className="px-4 py-2 border-r border-gray-300">
                          Item
                        </div>
                        <div className="px-4 py-2 border-r border-gray-300">
                          Rate
                        </div>
                        <div className="px-4 py-2 border-r border-gray-300">
                          Qty
                        </div>
                        <div className="px-4 py-2">Total</div>
                      </div>

                      {items.map((item, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[60px_2fr_1fr_1fr_1fr] text-sm text-gray-700 bg-gray-100 even:bg-white border-t border-gray-300"
                        >
                          <div className="px-4 py-2 border-r border-gray-300">
                            {i + 1}
                          </div>
                          <div className="px-4 py-2 border-r border-gray-300">
                            {item.item}
                          </div>
                          <div className="px-4 py-2 border-r border-gray-300">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => {
                                const rate = parseFloat(e.target.value) || 0;
                                setItems((prev) =>
                                  prev.map((it, idx) =>
                                    idx === i
                                      ? { ...it, rate, total: rate * it.qty }
                                      : it
                                  )
                                );
                              }}
                              className="w-20 p-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-newPrimary"
                            />
                          </div>
                          <div className="px-4 py-2 border-r border-gray-300">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => {
                                const newQty = parseFloat(e.target.value) || 1;

                                setItems((prev) =>
                                  prev.map((it, idx) => {
                                    if (idx === i) {
                                      // 🧠 Store original qty (first time only)
                                      if (!it.originalQty)
                                        it.originalQty = it.qty;

                                      // 🧩 Allow only between 1 and originalQty
                                      const updatedQty = Math.min(
                                        Math.max(newQty, 1),
                                        it.originalQty
                                      );

                                      return {
                                        ...it,
                                        qty: updatedQty,
                                        total: updatedQty * it.rate,
                                      };
                                    }
                                    return it;
                                  })
                                );
                              }}
                              className="w-20 p-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-newPrimary"
                            />
                          </div>
                          <div className="px-4 py-2">{item.total}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ✅ Totals */}
                  <div className="flex flex-col w-full items-end gap-4 mt-4">
                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Total Price :
                      </label>
                      <input
                        type="number"
                        value={totalPrice}
                        disabled
                        readOnly
                        className="w-[150px] cursor-not-allowed bg-gray-100  h-[40px] p-3 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Discount :
                      </label>
                      <input
                        type="number"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        className="w-[150px]  h-[40px] p-3 border border-gray-300 rounded-md"
                        placeholder="Enter Discount"
                      />
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Receivable :
                      </label>
                      <input
                        type="number"
                        value={receivable}
                        disabled
                        readOnly
                        className="w-[150px] cursor-not-allowed bg-gray-100  h-[40px] p-3 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Received :
                      </label>
                      <input
                        type="number"
                        value={received}
                        onChange={(e) => setReceived(e.target.value)}
                        className="w-[150px]  h-[40px] p-3 border border-gray-300 rounded-md"
                        placeholder="Enter Recived"
                      />
                    </div>

                    <div className="flex w-full  ">
                      <div className="flex-1 gap-2 flex min-w-0">
                        <label className="block text-gray-700 font-medium mb-1">
                          Aging Date :
                        </label>
                        <input
                          type="date"
                          value={receivingDate}
                          onChange={(e) => setReceivingDate(e.target.value)}
                          className="w-[150px]  h-[40px] px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        />
                      </div>

                      <div className="flex gap-2">
                        <label className="block text-gray-700 font-medium mb-2">
                          Balance :
                        </label>
                        <input
                          type="number"
                          value={balance}
                          disabled
                          readOnly
                          className="w-[150px] cursor-not-allowed  h-[40px] bg-gray-100 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          placeholder="Balance amount"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors"
                  >
                    Update Pending Orders
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesInvoice;
