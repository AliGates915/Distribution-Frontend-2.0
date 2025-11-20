import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader, ScaleLoader } from "react-spinners";
import gsap from "gsap";
import Swal from "sweetalert2";
import axios from "axios";

import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import toast from "react-hot-toast";


const ShelveLocationList = () => {
     const [isSaving, setIsSaving] = useState(false);
  const [shelveLocationList, setShelveLocationList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [shelfName, setShelfName] = useState("");
  const [section, setSection] = useState("");
  // const [currentStockCount, setCurrentStockCount] = useState("");
  const [description, setDescription] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/shelves`;

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

  const fetchLocation = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setShelveLocationList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Handlers
  const handleAddShelveLocation = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setShelfName("");
    // setSection("");
    // setCurrentStockCount("");
    setDescription("");
  };

  // Save or Update Shelve Location
 const handleSave = async () => {
    setIsSaving(true);
  const formData = {
    shelfNameCode: shelfName,
    description,
  };

  try {
    const { token } = userInfo || {};
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (isEdit && editId) {
      await axios.put(`${API_URL}/${editId}`, formData, { headers });
      toast.success("Shelve Location updated successfully");
    } else {
      await axios.post(API_URL, formData, { headers });
      toast.success("Shelve Location added successfully");
    }

    // ✅ Only close after successful response
    fetchLocation();
    setShelfName("");
    setDescription("");
    setIsSliderOpen(false);
    setIsEdit(false);
    setEditId(null);
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Something went wrong!");
    
  }finally{
    setIsSaving(false);
  }
};


  // Edit Shelve Location
  const handleEdit = (shelveLocation) => {
    console.log({ shelveLocation });

    setIsEdit(true);
    setEditId(shelveLocation._id);
    setShelfName(shelveLocation.shelfNameCode);
    // setSection(shelveLocation.section);
    // setCurrentStockCount(shelveLocation.currentStockCount.toString());
    setDescription(shelveLocation.description);
    setIsSliderOpen(true);
  };

  // Delete Shelve Location
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
            setShelveLocationList(
              shelveLocationList.filter((s) => s._id !== id)
            );
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Shelve Location deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete shelve location.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Shelve Location is safe 🙂",
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
const currentRecords = shelveLocationList.slice(indexOfFirstRecord, indexOfLastRecord);
const totalPages = Math.ceil(shelveLocationList.length / recordsPerPage);

// ✅ Reset to first page whenever list updates
useEffect(() => {
  setCurrentPage(1);
}, [shelveLocationList]);


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
            Shelve Locations List
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your shelve location details
          </p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
          onClick={handleAddShelveLocation}
        >
          + Add Shelve Location
        </button>
      </div>

      {/* Shelve Location Table */}

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* ✅ Table Header (desktop only) */}
            <div className="hidden lg:grid grid-cols-[0.2fr_1fr_2fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>SR</div>
              <div>Shelf Code</div>
              <div>Description</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* ✅ Table Body */}
            <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
              {loading ? (
                <TableSkeleton
                  rows={
                    shelveLocationList.length > 0
                      ? shelveLocationList.length
                      : 5
                  }
                  cols={userInfo?.isAdmin ? 4 : 2}
                  className="lg:grid-cols-[0.2fr_1fr_2fr_auto]"
                />
              ) : shelveLocationList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No shelves found.
                </div>
              ) : (
                currentRecords.map((s, index) => (
                  <>
                    {/* ✅ Desktop Row */}
                    <div
                      key={s._id}
                      className="hidden lg:grid grid-cols-[0.2fr_1fr_2fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                     <div className="text-gray-600">{indexOfFirstRecord + index + 1}</div>
                      <div className="text-gray-900">{s.shelfNameCode || "-"}</div>
                      <div className="text-gray-600">{s.description || "-"}</div>
                      {userInfo?.isAdmin && (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(s)}
                            className="text-blue-600"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(s._id)}
                            className="text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ✅ Mobile Card */}
                    <div
                      key={`mobile-${s._id}`}
                      className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                    >
                      <h3 className="font-semibold text-gray-800">
                        {s.shelfNameCode || "-"}
                      </h3>
                      <p className="text-sm text-gray-600">{s.description || "-"}</p>

                      {userInfo?.isAdmin && (
                        <div className="mt-3 flex justify-end gap-3">
                          <button
                            className="text-blue-500"
                            onClick={() => handleEdit(s)}
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            className="text-red-500"
                            onClick={() => handleDelete(s._id)}
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
          </div>
        </div>
        {totalPages > 1 && (
  <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
    <p className="text-sm text-gray-600">
      Showing {indexOfFirstRecord + 1} to{" "}
      {Math.min(indexOfLastRecord, shelveLocationList.length)} of{" "}
      {shelveLocationList.length} records
    </p>

    <div className="flex gap-2">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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


      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className=" relative w-full md:w-[500px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
           
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Shelve Location" : "Add a New Shelve Location"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="p-4 md:p-6 bg-white rounded-xl shadow-md space-y-4">
              {/* Shelf Name / Code */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Shelf Name / Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shelfName}
                  required
                  onChange={(e) => setShelfName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Section */}
              {/* <div>
                <label className="block text-gray-700 font-medium">
                  Section <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="text"
                  value={section}
                  required
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div> */}

              {/* Current Stock Count */}
              {/* <div>
                <label className="block text-gray-700 font-medium">
                  Current Stock Count <span className="text-newPrimary">*</span>
                </label>
                <input
                  type="number"
                  value={currentStockCount}
                  required
                  onChange={(e) => setCurrentStockCount(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div> */}

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={description}
                  required
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Save Button */}
             
              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving
                  ? isEdit
                    ? "Updating..."
                    : "Saving..."
                  : isEdit
                  ? "Update Shelve Location"
                  : "Save Shelve Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelveLocationList;
