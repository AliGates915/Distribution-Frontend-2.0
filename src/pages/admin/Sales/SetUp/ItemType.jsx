import React, { useState, useCallback, useEffect, useRef } from "react";
import { HashLoader, ScaleLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import Swal from "sweetalert2";

import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import toast from "react-hot-toast";

const ItemType = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [itemTypeList, setItemTypeList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [manufacturerName, setManufacturerName] = useState("");
  const [address, setAddress] = useState("");
  const [productsSupplied, setProductsSupplied] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(true); // true for Active, false for Inactive
  const [gstNumber, setGstNumber] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

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

  // Static Data for Manufacturers

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/item-type`;

  // Handlers
  const handleAddManufacturer = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setManufacturerName("");
    setAddress("");
    setProductsSupplied("");
    setEmail("");
    setGstNumber("");
    setStatus(true);
    setItemCategory("");
  };

  const fetchItemtypeList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setItemTypeList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);
  useEffect(() => {
    fetchItemtypeList();
  }, [fetchItemtypeList]);

  // CategoryList Fetch

  const fetchCategoryList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/categories/list`
      );
      setCategoryList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  // Save or Update Manufacturer
  const handleSave = async () => {
    setIsSaving(true);
    const formData = {
      categoryId: itemCategory,
      itemTypeName: manufacturerName,
    };

    try {
      const { token } = userInfo || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (isEdit && editId) {
        // Simulate API update
        const res = await axios.put(`${API_URL}/${editId}`, formData, {
          headers,
        });

        fetchItemtypeList();
        toast.success("Item Type updated successfully");
      } else {
        // Simulate API create
        const res = await axios.post(API_URL, formData, {
          headers,
        });
        setItemTypeList([...itemTypeList, res.data]);
        toast.success("Item Type added successfully");
      }

      // Reset form
      setManufacturerName("");
      setAddress("");
      setProductsSupplied("");
      setEmail("");
      setGstNumber("");
      setStatus(true);
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
      fetchItemtypeList();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Edit Manufacturer
  const handleEdit = (itemType) => {
    setIsEdit(true);
    setEditId(itemType._id);
    setItemCategory(itemType.category?._id || "");
    setManufacturerName(itemType.itemTypeName);
    setStatus(itemType.isEnable);
    setIsSliderOpen(true);
  };

  // Delete Manufacturer
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
              "Content-Type": "application/json",
            };
            await axios.delete(`${API_URL}/${id}`, { headers });
            setItemTypeList(itemTypeList.filter((m) => m._id !== id));

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

  // ✅ Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // ✅ Filtered Item Types (for search)
  const filteredItemTypes = itemTypeList.filter(
    (item) =>
      item.itemTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.category?.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Derived Pagination Data
  const totalPages = Math.ceil(filteredItemTypes.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredItemTypes.slice(indexOfFirstRecord, indexOfLastRecord);

  // ✅ Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  // ✅ Reset to page 1 whenever list updates
  useEffect(() => {
    setCurrentPage(1);
  }, [itemTypeList]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Common Header */}
      <CommanHeader />
      {isSaving && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[9999]">
          <ScaleLoader color="#1E93AB" size={60} />
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Item Type</h1>
          <p className="text-gray-500 text-sm">Manage your Item Type details</p>
        </div>

        <div className="flex gap-4">
          {/* 🔍 Search Bar */}
          <input
            type="text"
            placeholder="Search Item Type..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 w-full md:w-[280px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
          />

          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-primaryDark"
            onClick={handleAddManufacturer}
          >
            + Add Item Type
          </button>
        </div>
      </div>


      {/* Item Type Table */}
      {/* Item Type Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* ✅ Table Header (Desktop Only) */}
            <div className="hidden lg:grid grid-cols-[0.1fr_1fr_1fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>SR</div>
              <div>Category</div>
              <div>Item Type</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            {/* ✅ Table Body */}
            <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
              {loading ? (
                <TableSkeleton
                  rows={itemTypeList.length > 0 ? itemTypeList.length : 5}
                  cols={userInfo?.isAdmin ? 4 : 2}
                  className="lg:grid-cols-[0.1fr_1fr_1fr_auto]"
                />
              ) : itemTypeList?.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No item types found.
                </div>
              ) : (
                currentRecords.map((item, index) => (
                  <>
                    {/* ✅ Desktop Grid */}
                    <div
                      key={item._id}
                      className="hidden lg:grid grid-cols-[0.1fr_1fr_1fr_auto] gap-6 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-600">
                        {indexOfFirstRecord + index + 1}
                      </div>

                      <div className="text-gray-900">
                        {item?.category?.categoryName || "-"}
                      </div>
                      <div className="text-gray-600">{item.itemTypeName || "-"}</div>
                      {userInfo?.isAdmin && (
                        <div className="flex justify-end gap-4">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:underline"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:underline"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ✅ Mobile Card */}
                    <div
                      key={`mobile-${item._id}`}
                      className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {item.itemTypeName || "-"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item?.category?.categoryName || "-"}
                        </span>
                      </div>

                      {userInfo?.isAdmin && (
                        <div className="mt-3 flex justify-end gap-3">
                          <button
                            className="text-blue-500"
                            onClick={() => handleEdit(item)}
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            className="text-red-500"
                            onClick={() => handleDelete(item._id)}
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
                  {Math.min(indexOfLastRecord, itemTypeList.length)} of{" "}
                  {itemTypeList.length} records
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${currentPage === 1
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
                    className={`px-3 py-1 rounded-md ${currentPage === totalPages
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

      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className=" relative w-full md:w-[500px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >

            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Item Type" : "Add a New Item Type"}
              </h2>

              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => setIsSliderOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="p-4 md:p-6 bg-white rounded-xl shadow-md space-y-4">
              {/* Item Category */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Item Category Id <span className="text-red-500">*</span>
                </label>
                <select
                  value={itemCategory}
                  required
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  {categoryList.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit Name */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Item Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manufacturerName}
                  required
                  onChange={(e) => setManufacturerName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Save Button */}
              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                {isSaving
                  ? isEdit
                    ? "Updating..."
                    : "Saving..."
                  : isEdit
                    ? "Update Item Type"
                    : "Save Item Type"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemType;
