import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { HashLoader, ScaleLoader } from "react-spinners";
import gsap from "gsap";

import Swal from "sweetalert2";

import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../../Components/Skeleton";
import CommanHeader from "../../Components/CommanHeader";
import toast from "react-hot-toast";

const ManufactureList = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [manufacturerList, setManufacturerList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [manufacturerId, setManufacturerId] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [personName, setPersonName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/manufacturers`;

  // GSAP Animation for Modal
  useEffect(() => {
    if (isSliderOpen) {
      if (sliderRef.current) {
        sliderRef.current.style.display = "block"; // ensure visible before animation
      }
      gsap.fromTo(
        sliderRef.current,
        { scale: 0.7, opacity: 0, y: -50 }, // start smaller & slightly above
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    } else {
      gsap.to(sliderRef.current, {
        scale: 0.7,
        opacity: 0,
        y: -50,
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => {
          if (sliderRef.current) {
            sliderRef.current.style.display = "none";
          }
        },
      });
    }
  }, [isSliderOpen]);

  const fetchManufacturersList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/manufacturers`
      );
      setManufacturerList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchManufacturersList();
  }, [fetchManufacturersList]);

  const handleAddManufacturer = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setManufacturerId("");
    setManufacturerName("");
    setAddress("");
    setPhoneNumber("");
    setPersonName("");
    setMobileNumber("");
    setDesignation("");
    setEmail("");
    setStatus(true);
  };

  const handleSave = async () => {
 
    if (!manufacturerName) {
      return toast.error("Please enter Manufacturer Name");
    }
 
    setIsSaving(true);
    const formData = {
      manufacturerName: manufacturerName,
      address,
      phoneNumber,
      personName,
      email,
      status,
    };

    try {
      const { token } = userInfo || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (isEdit && editId) {
        // 🔄 Update existing category
        const res = await axios.put(`${API_URL}/${editId}`, formData, {
          headers,
        });

        toast.success(" Manufacturer updated successfully");
      } else {
        const res = await axios.post(API_URL, formData, {
          headers,
        });

        toast.success(" Manufacturer added successfully");
      }

      setManufacturerId("");
      setManufacturerName("");
      setAddress("");
      setPhoneNumber("");
      setPersonName("");
      setMobileNumber("");
      setDesignation("");
      setEmail("");
      setStatus(true);
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
      fetchManufacturersList();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (manufacturer) => {
    setIsEdit(true);
    setEditId(manufacturer._id);
    setManufacturerId(manufacturer._id);
    setManufacturerName(manufacturer.manufacturerName);
    setAddress(manufacturer.address);
    setPhoneNumber(manufacturer.phoneNumber);
    setPersonName(manufacturer.personName);
    setMobileNumber(manufacturer.mobileNumber);
    setDesignation(manufacturer.designation);
    setEmail(manufacturer.email);
    setStatus(manufacturer.status);
    setIsSliderOpen(true);
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
            await axios.delete(`${API_URL}/${id}`, {
              headers: {
                Authorization: `Bearer ${userInfo?.token}`,
              },
            });

            setManufacturerList(manufacturerList.filter((m) => m._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Manufacturer deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete manufacturer.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Manufacturer is safe 🙂",
            "error"
          );
        }
      });
  };

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = manufacturerList.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(manufacturerList.length / recordsPerPage);

  // ✅ Reset page to 1 when list updates
  useEffect(() => {
    setCurrentPage(1);
  }, [manufacturerList]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Coomon header */}
      <CommanHeader />
      {isSaving && (
              <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[9999]">
                <ScaleLoader color="#1E93AB" size={60} />
              </div>
            )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">
            Manufacturers List
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your manufacturer details
          </p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
          onClick={handleAddManufacturer}
        >
          + Add Manufacturer
        </button>
      </div>

      {/* Manufacturer Table */}

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* ✅ Table Header (desktop only) */}
            <div className="hidden lg:grid grid-cols-[0.2fr_1.5fr_1fr_1.5fr_2fr_1fr_1fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>SR</div>
              <div>Name</div>
              <div>Contact</div>
              <div>Email</div>
              <div>Address</div>
              <div>Phone</div>
              <div>Status</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* ✅ Table Body */}
            <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
              {loading ? (
                <TableSkeleton
                  rows={
                    manufacturerList.length > 0 ? manufacturerList.length : 5
                  }
                  cols={userInfo?.isAdmin ? 8 : 6}
                  className="lg:grid-cols-[0.2fr_1.5fr_1fr_1.5fr_2fr_1fr_1fr_auto]"
                />
              ) : manufacturerList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No manufacturers found.
                </div>
              ) : (
                currentRecords.map((m, index) => (
                  <>
                    {/* ✅ Desktop Row */}
                    <div
                      key={m._id}
                      className="hidden lg:grid grid-cols-[0.2fr_1.5fr_1fr_1.5fr_2fr_1fr_1fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">
                        {indexOfFirstRecord + index + 1}
                      </div>

                      <div className="text-gray-900">{m.manufacturerName}</div>
                      <div className="text-gray-600">{m.personName || "—"}</div>
                      <div className="text-gray-600">{m.email || "—"}</div>
                      <div className="text-gray-600 truncate">{m.address || "—"}</div>
                      <div className="text-gray-600">{m.phoneNumber || "—"}</div>
                      <div className="font-semibold">
                        {m.status ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )}
                      </div>
                      {userInfo?.isAdmin && (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(m)}
                            className="text-blue-600 hover:underline"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="text-red-600 hover:underline"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ✅ Mobile Card */}
                    <div
                      key={`mobile-${m._id}`}
                      className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                    >
                      <h3 className="font-semibold text-gray-800">
                        {m.manufacturerName}
                      </h3>
                      <p className="text-sm text-gray-600">{m.personName}</p>
                      <p className="text-sm text-gray-600">{m.email || "—"}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {m.address}
                      </p>
                      <p className="text-sm text-gray-600">{m.phoneNumber}</p>
                      <p
                        className={`text-sm font-semibold ${
                          m.status ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {m.status ? "Active" : "Inactive"}
                      </p>

                      {userInfo?.isAdmin && (
                        <div className="mt-3 flex justify-end gap-3">
                          <button
                            className="text-blue-500"
                            onClick={() => handleEdit(m)}
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            className="text-red-500"
                            onClick={() => handleDelete(m._id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstRecord + 1} to{" "}
                  {Math.min(indexOfLastRecord, manufacturerList.length)} of{" "}
                  {manufacturerList.length} records
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

      {/* Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="relative w-full md:w-[500px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
          
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Manufacturer" : "Add a New Manufacturer"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setManufacturerId("");
                  setManufacturerName("");
                  setAddress("");
                  setPhoneNumber("");
                  setPersonName("");
                  setMobileNumber("");
                  setDesignation("");

                  setEmail("");
                  setStatus(true);
                }}
              >
                ×
              </button>
            </div>
            <div className="space-y-4 p-4 md:p-6">
              <div>
                <label className="block text-gray-700 font-medium">
                  Manufacturer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manufacturerName}
                  required
                  onChange={(e) => setManufacturerName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Address 
                </label>
                <input
                  type="text"
                  value={address}
                  required
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
             <div className="">
                <label className="block text-gray-700 font-medium">
                  Phone No
                </label>
              <input
                type="text"
                value={phoneNumber}
                required
                onChange={(e) => {
                  const value = e.target.value;
                  // ✅ Allow only digits and '+' sign at start
                  if (/^[0-9+]*$/.test(value)) {
                    setPhoneNumber(value);
                  }
                }}
                className="w-full p-2 border rounded"
                placeholder="e.g. +923001234567"
              />
        </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Email Address 
                </label>
                <input
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium">
                  Contact Person 
                </label>
                <input
                  type="text"
                  value={personName}
                  required
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">Status</label>
                <button
                  type="button"
                  onClick={() => setStatus(!status)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    status ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      status ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
                <span>{status ? "Active" : "Inactive"}</span>
              </div>
              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                {isEdit ? "Update Manufacturer" : "Save Manufacturer"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .table-container {
          max-width: 100%;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #a0aec0 #edf2f7;
        }
        .table-container::-webkit-scrollbar {
          height: 6px;
        }
        .table-container::-webkit-scrollbar-track {
          background: #edf2f7;
          border-radius: 4px;
        }
        .table-container::-webkit-scrollbar-thumb {
          background: #a0aec0;
          border-radius: 4px;
        }
        .table-container::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
        @media (max-width: 1024px) {
          .min-w-\[1000px\] {
            min-width: 800px;
          }
          .grid-cols-\[90px_90px_180px_110px_110px_110px_110px_110px_110px_70px_70px\] {
            grid-template-columns: 80px 80px 150px 100px 100px 100px 100px 100px 100px 60px 60px;
          }
        }
        @media (max-width: 640px) {
          .min-w-\[1000px\] {
            min-width: 600px;
          }
          .grid-cols-\[90px_90px_180px_110px_110px_110px_110px_110px_110px_70px_70px\] {
            grid-template-columns: 70px 70px 120px 90px 90px 90px 90px 90px 90px 50px 50px;
          }
        }
      `}</style>
    </div>
  );
};

export default ManufactureList;
