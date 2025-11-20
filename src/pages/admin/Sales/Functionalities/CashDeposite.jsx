import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2, CheckCircle, XCircle } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";
import { api } from "../../../../context/ApiService";

const CashDeposite = () => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [deliveryChallans, setDeliveryChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dcNo, setDcNo] = useState("");
  const [date, setDate] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [orderDetails, setOrderDetails] = useState({
    customer: "",
    person: "",
    phone: "",
    address: "",
    orderType: "",
    mode: "",
    deliveryAddress: "",
    deliveryDate: "",
    totalWeight: "",
  });
  const [vehicleDetails, setVehicleDetails] = useState({
    truckNo: "",
    driverName: "",
    father: "",
    cnic: "",
    mobileNo: "",
    containerNo1: "",
    batchNo1: "",
    forLocation1: "",
    containerNo2: "",
    batchNo2: "",
    forLocation2: "",
    firstWeight: "",
    weightBridgeName: "",
    weightBridgeSlipNo: "",
  });
  const [remarks, setRemarks] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [status, setStatus] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingChallan, setEditingChallan] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("orderDetails");
  const [nextDcNo, setNextDcNo] = useState("003");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const [editingVoucher, setEditingVoucher] = useState(null); // Fixed: was editingReceipt
  const [nextReceiptId, setNextReceiptId] = useState("001");
  const [cashData, setCashData] = useState({
    receiptId: "",
    date: "",
    customer: "", // store customer _id (not name)
    amountReceived: 0,
    newBalance: 0,
    remarks: "",
  });
  const [customersCash, setCustomersCash] = useState([]);

  // ✅ Static data fallback (mocked delivery challans)
  const fetchDeliveryChallan = useCallback(() => {
    setLoading(true);

    // Simulate async delay like API
    setTimeout(() => {
      const mockData = [
        {
          _id: "1",
          dcNo: "DC-001",
          date: "2025-10-18",
          orderNo: "ORD-001",
          orderDate: "2025-10-17",
          orderDetails: {
            customer: "Ali Enterprises",
            person: "Ali Khan",
            phone: "+923001234567",
            address: "Lahore, Pakistan",
            orderType: "Standard",
            mode: "Truck",
            deliveryAddress: "Gulberg, Lahore",
            deliveryDate: "2025-10-19",
            totalWeight: 1500,
          },
          vehicleDetails: {
            truckNo: "TRK-567",
            driverName: "Ahmed",
            father: "Rashid",
            cnic: "35201-1234567-9",
            mobileNo: "03001234567",
            containerNo1: "CN-111",
            batchNo1: "B001",
            forLocation1: "Karachi",
            containerNo2: "CN-112",
            batchNo2: "B002",
            forLocation2: "Multan",
            firstWeight: 1200,
            weightBridgeName: "Lahore Weighbridge",
            weightBridgeSlipNo: "SLIP-0023",
          },
          remarks: "Deliver ASAP",
          approvalRemarks: "Checked and verified",
          status: "Pending",
        },
        {
          _id: "2",
          dcNo: "DC-002",
          date: "2025-10-19",
          orderNo: "ORD-002",
          orderDate: "2025-10-18",
          orderDetails: {
            customer: "Galaxy Distributors",
            person: "Umer Shah",
            phone: "+923334567890",
            address: "Karachi, Pakistan",
            orderType: "Express",
            mode: "Van",
            deliveryAddress: "Clifton, Karachi",
            deliveryDate: "2025-10-20",
            totalWeight: 850,
          },
          vehicleDetails: {
            truckNo: "VAN-890",
            driverName: "Naveed",
            father: "Hassan",
            cnic: "42201-9876543-2",
            mobileNo: "03211234567",
            containerNo1: "CN-210",
            batchNo1: "B010",
            forLocation1: "Hyderabad",
            containerNo2: "",
            batchNo2: "",
            forLocation2: "",
            firstWeight: 900,
            weightBridgeName: "Karachi Weighbridge",
            weightBridgeSlipNo: "SLIP-0045",
          },
          remarks: "Urgent Delivery",
          approvalRemarks: "",
          status: "Approved",
        },
      ];

      setDeliveryChallans(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Delivery challan search
  useEffect(() => {
    if (!searchTerm || !searchTerm.startsWith("DC-")) {
      fetchDeliveryChallan();
      return;
    }

    const delayDebounce = setTimeout(() => {
      try {
        setLoading(true);
        const filtered = deliveryChallans.filter((challan) =>
          challan.dcNo.toUpperCase().includes(searchTerm.toUpperCase())
        );
        setDeliveryChallans(filtered);
      } catch (error) {
        console.error("Search delivery challan failed:", error);
        setDeliveryChallans([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchDeliveryChallan]);

  // Generate next DC No

  // Reset form fields
  const resetForm = () => {
    setDcNo("");
    setDate("");
    setOrderNo("");
    setOrderDate("");
    setOrderDetails({
      customer: "",
      person: "",
      phone: "",
      address: "",
      orderType: "",
      mode: "",
      deliveryAddress: "",
      deliveryDate: "",
      totalWeight: "",
    });
    setVehicleDetails({
      truckNo: "",
      driverName: "",
      father: "",
      cnic: "",
      mobileNo: "",
      containerNo1: "",
      batchNo1: "",
      forLocation1: "",
      containerNo2: "",
      batchNo2: "",
      forLocation2: "",
      firstWeight: "",
      weightBridgeName: "",
      weightBridgeSlipNo: "",
    });
    setRemarks("");
    setApprovalRemarks("");
    setStatus("Pending");
    setEditingChallan(null);
    setErrors({});
    setActiveTab("orderDetails");
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedDcNo = dcNo.trim();
    const trimmedDate = date.trim();
    const trimmedOrderNo = orderNo.trim();
    const trimmedOrderDate = orderDate.trim();
    const {
      customer,
      person,
      phone,
      address,
      orderType,
      mode,
      deliveryAddress,
      deliveryDate,
      totalWeight,
    } = orderDetails;
    const {
      truckNo,
      driverName,
      cnic,
      mobileNo,
      containerNo1,
      batchNo1,
      forLocation1,
      firstWeight,
      weightBridgeName,
      weightBridgeSlipNo,
    } = vehicleDetails;

    if (!trimmedDcNo) newErrors.dcNo = "DC No is required";
    if (!trimmedDate) newErrors.date = "Date is required";
    if (!trimmedOrderNo) newErrors.orderNo = "Order No is required";
    if (!trimmedOrderDate) newErrors.orderDate = "Order Date is required";

    if (!customer.trim()) newErrors.customer = "Customer is required";
    if (!person.trim()) newErrors.person = "Person is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!orderType.trim()) newErrors.orderType = "Order Type is required";
    if (!mode.trim()) newErrors.mode = "Mode is required";
    if (!deliveryAddress.trim())
      newErrors.deliveryAddress = "Delivery Address is required";
    if (!deliveryDate.trim())
      newErrors.deliveryDate = "Delivery Date is required";
    if (!totalWeight || isNaN(totalWeight) || totalWeight <= 0) {
      newErrors.totalWeight = "Total Weight must be a positive number";
    }

    if (!truckNo.trim()) newErrors.truckNo = "Truck No is required";
    if (!driverName.trim()) newErrors.driverName = "Driver Name is required";
    if (!cnic.trim()) newErrors.cnic = "CNIC is required";
    if (!mobileNo.trim()) newErrors.mobileNo = "Mobile No is required";
    if (!containerNo1.trim())
      newErrors.containerNo1 = "Container No 1 is required";
    if (!batchNo1.trim()) newErrors.batchNo1 = "Batch No 1 is required";
    if (!forLocation1.trim())
      newErrors.forLocation1 = "For Location 1 is required";
    if (!firstWeight || isNaN(firstWeight) || firstWeight <= 0) {
      newErrors.firstWeight = "First Weight must be a positive number";
    }
    if (!weightBridgeName.trim())
      newErrors.weightBridgeName = "Weight Bridge Name is required";
    if (!weightBridgeSlipNo.trim())
      newErrors.weightBridgeSlipNo = "Weight Bridge Slip No is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers for form and table actions
  const handleAddChallan = () => {
    resetForm();
    setIsSliderOpen(true);
  };

  const handleEditClick = (challan) => {
    setEditingChallan(challan);
    setDcNo(challan.dcNo || "");
    setDate(challan.date || "");
    setOrderNo(challan.orderNo || "");
    setOrderDate(challan.orderDate || "");
    setOrderDetails(challan.orderDetails || {});
    setVehicleDetails(challan.vehicleDetails || {});
    setRemarks(challan.remarks || "");
    setApprovalRemarks(challan.approvalRemarks || "");
    setStatus(challan.status || "Pending");
    setErrors({});
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newChallan = {
      dcNo: editingChallan ? dcNo : `DC-${nextDcNo}`,
      date: date.trim(),
      orderNo: orderNo.trim(),
      orderDate: orderDate.trim(),
      orderDetails: {
        ...orderDetails,
        totalWeight: parseFloat(orderDetails.totalWeight),
      },
      vehicleDetails: {
        ...vehicleDetails,
        firstWeight: parseFloat(vehicleDetails.firstWeight),
      },
      remarks: remarks.trim(),
      approvalRemarks: approvalRemarks.trim(),
      status,
    };

    try {
      if (editingChallan) {
        setDeliveryChallans((prev) =>
          prev.map((c) =>
            c._id === editingChallan._id
              ? { ...c, ...newChallan, _id: c._id }
              : c
          )
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Delivery Challan updated successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        setDeliveryChallans((prev) => [
          ...prev,
          { ...newChallan, _id: `temp-${Date.now()}` },
        ]);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Delivery Challan added successfully.",
          confirmButtonColor: "#3085d6",
        });
      }
      fetchDeliveryChallans();
      resetForm();
    } catch (error) {
      console.error("Error saving delivery challan:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to save delivery challan.",
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
            setDeliveryChallans((prev) => prev.filter((c) => c._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Delivery Challan deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete delivery challan.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Delivery Challan is safe 🙂",
            "error"
          );
        }
      });
  };

  const handleStatusChange = (id, newStatus) => {
    setDeliveryChallans((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
    );
    Swal.fire({
      icon: "success",
      title: `${newStatus}!`,
      text: `Delivery Challan ${newStatus.toLowerCase()} successfully.`,
      confirmButtonColor: "#3085d6",
    });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = deliveryChallans.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(deliveryChallans.length / recordsPerPage);

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
              Cash Deposit Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter DC No eg: DC-001"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddChallan}
            >
              + Add Payment
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
            <div className="min-w-[1400px]">
              <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>DC No</div>
                <div>Date</div>
                <div>Order No</div>
                <div>Customer</div>
                <div>Delivery Date</div>
                <div>Total Weight</div>
                <div>Truck No</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={recordsPerPage}
                    cols={10}
                    className="lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No delivery challans found.
                  </div>
                ) : (
                  currentRecords.map((challan) => (
                    <div
                      key={challan._id}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">{challan.dcNo}</div>
                      <div className="text-gray-600">{challan.date}</div>
                      <div className="text-gray-600">{challan.orderNo}</div>
                      <div className="text-gray-600">
                        {challan.orderDetails.customer}
                      </div>
                      <div className="text-gray-600">
                        {challan.orderDetails.deliveryDate}
                      </div>
                      <div className="text-gray-600">
                        {challan.orderDetails.totalWeight}
                      </div>
                      <div className="text-gray-600">
                        {challan.vehicleDetails.truckNo}
                      </div>
                      <div className="text-gray-600">{challan.status}</div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(challan)}
                          className="py-1 text-sm rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(challan._id)}
                          className="py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(challan._id, "Approved")
                          }
                          className="py-1 text-sm rounded text-green-600 hover:bg-green-50 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(challan._id, "Rejected")
                          }
                          className="py-1 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between my-4 px-10">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, deliveryChallans.length)} of{" "}
                {deliveryChallans.length} records
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
                {/* Cash Form */}

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
                        Amount Received <span className="text-red-500">*</span>
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

export default CashDeposite;
