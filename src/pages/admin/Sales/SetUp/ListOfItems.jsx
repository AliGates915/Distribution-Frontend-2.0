import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";

import Swal from "sweetalert2";
import { ScaleLoader } from "react-spinners";
import axios from "axios";
import Barcode from "react-barcode";
import { SquarePen, Trash2 } from "lucide-react";

import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import toast from "react-hot-toast";

const ListOfItems = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [nextItemCategoryId, setNextItemCategoryId] = useState("001");
  const [itemUnitList, setItemUnitList] = useState([]);
  const [manufacturerList, setManufacturerList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [shelvesList, setShelvesList] = useState([]);
  const [expiryOption, setExpiryOption] = useState("NoExpiry");
  const [expiryDay, setExpiryDay] = useState("");
  const [itemTypeName, setItemTypeName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemList, setItemList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [itemCategory, setItemCategory] = useState({ id: "", name: "" });
  const [itemKind, setItemKind] = useState("Finished Goods");
  const [itemType, setItemType] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [primaryBarcode, setPrimaryBarcode] = useState("");
  const [details, setDetails] = useState("");
  const [manufacture, setManufacture] = useState("");
  const [supplier, setSupplier] = useState("");
  const [shelveLocation, setShelveLocation] = useState("");
  const [itemUnit, setItemUnit] = useState("");
  const [perUnit, setPerUnit] = useState("");
  const [purchase, setPurchase] = useState("");
  const [sales, setSales] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [reorder, setReorder] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [itemTypeList, setItemTypeList] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Utility to generate random barcode string
  const generateRandomBarcode = () => {
    const prefix = "PBC"; // you can change prefix
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    return `${prefix}-${randomPart}`;
  };

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

  // Item Detals Fetch
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-details`
      );
      setItemList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch item details", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // next gass pass id creation
  useEffect(() => {
    if (Array.isArray(itemList)) {
      const nextNo = (itemList.length + 1).toString().padStart(3, "0");
      setNextItemCategoryId(`${nextNo}`);
    } else {
      setNextItemCategoryId("ITEM-001");
    }
  }, [itemList]);

  // CategoryList Fetch
  const fetchCategoryList = useCallback(async () => {
    try {
      setIsSaving(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/categories`
      );
      setCategoryList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);
  // item Unit
  const fetchItemUnitList = useCallback(async () => {
    try {
      setIsSaving(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/categories`
      );
      setCategoryList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchItemUnitList();
  }, [fetchItemUnitList]);

  // Fetch itemTypes when category changes
  useEffect(() => {
    if (!itemCategory) return; // only call when category selected

    const fetchItemTypes = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/item-type/category/${itemCategory.name
          }`
        );
        setItemTypeList(res.data);
      } catch (error) {
        console.error("Failed to fetch item types", error);
      }
    };

    fetchItemTypes();
  }, [itemCategory]);

  // Item Unit List Fetch
  const fetchItemUnitsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-unit`
      );
      setItemUnitList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch item unit", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchItemUnitsList();
  }, [fetchItemUnitsList]);

  // console.log({ itemUnitList });

  // Manufacturer List Fetch
  const fetchManufacturerList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/manufacturers/list`
      );
      setManufacturerList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Manufacturer", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchManufacturerList();
  }, [fetchManufacturerList]);

  // Supplier List Fetch
  const fetchSupplierList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers/list`
      );
      setSupplierList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchSupplierList();
  }, [fetchSupplierList]);

  // Shelves List Fetch
  const fetchShelvesList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/shelves`
      );
      setShelvesList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Shelves", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchShelvesList();
  }, [fetchShelvesList]);

  // Handlers
  const handleAddItem = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setItemCategory("");
    setItemType("");
    setItemName("");
    setDetails("");
    setManufacture("");
    setSupplier("");
    setShelveLocation("");
    setItemUnit("");
    setPerUnit("");
    // setPurchase("");
    // setSales("");
    // setStock("");
    setPrice("");
    setBarcode("");
    setReorder("");
    setEnabled(true);
    setImage(null);
    setImagePreview(null);
    setExpiryOption("NoExpiry");
    setExpiryDay("");
    setPrimaryBarcode(generateRandomBarcode());
  };
  // form validation

  const validateForm = () => {
    let errors = [];

    if (!itemCategory.id) errors.push("Item Category is required");
    if (!itemType) errors.push("Item Type is required");
    if (!itemKind) errors.push("Item Kind is required");
    if (!itemName) errors.push("Item Name is required");
    if (!itemUnit) errors.push("Item Unit is required");
    if (!perUnit) errors.push("Per Unit is required");
    // if (!purchase) errors.push("Purchase is required");
    // if (!sales) errors.push("Sales is required");
    // if (!stock) errors.push("Stock is required");
    if (!image && !imagePreview) errors.push("Product image is required");

    // expiry ke liye special case
    if (expiryOption === "HasExpiry" && !expiryDay) {
      errors.push("Expiry day is required when Has Expiry is selected");
    }

    return errors;
  };
  // console.log("Item Kind ", itemKind);

  // Save or Update Item
  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        html: errors.join("<br/>"),
      });
      return;
    }
    setIsSaving(true);
    const formData = new FormData();

    formData.append(
      "itemId",
      editId ? itemCategoryId : `ITEM-${nextItemCategoryId}`
    );
    formData.append("itemName", itemName);
    formData.append("itemCategory", itemCategory.id);
    // formData.append("manufacturer", manufacture);
    formData.append("supplier", supplier);
    // formData.append("purchase", parseFloat(purchase) || 0);
    formData.append("itemType", itemType);
    // formData.append("stock", parseInt(stock) || 0);
    // formData.append("price", parseFloat(sales) || 0);
    formData.append("shelveLocation", shelveLocation);
    formData.append("itemUnit", itemUnit);
    formData.append("perUnit", parseInt(perUnit) || 0);
    formData.append("reorder", parseInt(reorder) || 0);
    formData.append("isEnable", enabled);
    formData.append("primaryBarcode", primaryBarcode);
    formData.append("secondaryBarcode", barcode);
    formData.append("itemKind", itemKind);
    // ✅ expiry logic
    if (expiryOption === "HasExpiry") {
      formData.append("hasExpiry", parseInt(expiryDay) || 0);
      formData.append("noHasExpiray", false); // explicit
    } else {
      formData.append("noHasExpiray", true); // no expiry case
    }
    if (image) {
      formData.append("itemImage", image);
    }

    try {
      const headers = {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "multipart/form-data",
      };

      if (isEdit && editId) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/item-details/${editId}`,
          formData,
          { headers }
        );
        toast.success(" Item List updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/item-details`,
          formData,
          { headers }
        );
        toast.success(" Item List added successfully");
      }
      reState();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Set All States Null
  const reState = () => {
    setIsSliderOpen(false);
    setIsEdit(false);
    setEditId(null);
    setItemCategory("");
    setItemType("");
    setManufacture("");
    setItemName("");
    setDetails("");
    setSupplier("");
    setShelveLocation("");
    setItemUnit("");
    setPerUnit("");
    // setPurchase("");
    // setSales("");
    // setStock("");
    setPrice("");
    setBarcode("");
    setReorder("");
    setEnabled(false);
    setImagePreview("");
    setImage(null);
    setExpiryOption("NoExpiry");
    setExpiryDay("");
  };

  // Edit Item
  const handleEdit = (item) => {
    // console.log({ item });

    setIsEdit(true);
    setEditId(item._id);

    // Dropdowns
    setItemCategory({
      id: item?.itemCategory?._id || "",
      name: item?.itemCategory?.categoryName || "",
    });
    setManufacture(item?.manufacturer?._id || "");
    setSupplier(item?.supplier?._id || "");
    setShelveLocation(item?.shelveLocation?._id || "");
    setItemUnit(item?.itemUnit._id || "");
    setItemType(item?.itemType?._id || "");
    setItemCategoryId(item.itemId);
    // Normal fields
    setItemName(item.itemName || "");
    setPerUnit(item.perUnit ? item.perUnit.toString() : "");
    // setPurchase(item.purchase ? item.purchase.toString() : "");
    // setSales(item.price.toString() ?? "");
    // setStock(item.stock ? item.stock.toString() : "");
    setBarcode(item.secondaryBarcode || "");
    setReorder(item.reorder ? item.reorder.toString() : "");
    setItemKind(item.itemKind || "");
    setPrimaryBarcode(item.primaryBarcode || generateRandomBarcode());

    // ✅ Expiry fields
    if (item.noHasExpiray) {
      // case: No Expiry
      setExpiryOption("NoExpiry");
      setExpiryDay("");
    } else if (item.hasExpiray && item.hasExpiray > 0) {
      // case: Has Expiry
      setExpiryOption("HasExpiry");
      setExpiryDay(item.hasExpiray.toString());
    } else {
      // default safe fallback
      setExpiryOption("NoExpiry");
      setExpiryDay("");
    }

    // Enable/Disable
    setEnabled(item.isEnable !== undefined ? item.isEnable : true);

    // Image
    setImagePreview(item?.itemImage?.url || "");
    setImage(null);

    setIsSliderOpen(true);
  };

  // Delete Item
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
            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/item-details/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${userInfo.token}`, // if you’re using auth
                },
              }
            );
            setItemList(itemList.filter((item) => item._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Item deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete item.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire("Cancelled", "Item is safe 🙂", "error");
        }
      });
  };

  // Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove Image
  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };
  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const categoryObj = categoryList.find((c) => c._id === selectedId);
    setItemCategory({
      id: selectedId,
      name: categoryObj?.categoryName || "",
    });
  };

  const filteredItems = itemList.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.itemName?.toLowerCase().includes(term) ||
      item.itemType?.itemTypeName?.toLowerCase().includes(term)
    );
  });

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10; // you can change this

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredItems.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredItems.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Coomon header */}
      <CommanHeader />

      {isSaving && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[9999]">
          <ScaleLoader color="#1E93AB" size={60} />
        </div>
      )}

      <div className="flex justify-between items-center mt-6 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Items List</h1>
        </div>

        <div className="flex gap-4">
          {/* Search Bar */}
          <div className="mb-4 flex justify-end">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Item Name or Type..."
              className="px-3 py-2 w-full md:w-[280px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
          </div>

          {/* Add Item Button */}
          <button
            className="h-10 bg-newPrimary text-white px-4 rounded-lg hover:bg-primaryDark"
            onClick={handleAddItem}
          >
            + Add Item
          </button>
        </div>
      </div>


      {/* Item Table */}
      <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-screen overflow-y-auto custom-scrollbar">
            <div className="inline-block w-full align-middle">
              {/* Header */}
              <div className="hidden lg:grid grid-cols-[0.2fr_1fr_1fr_0.5fr] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Sr</div>
                <div>Item Category</div>
                <div>Item Name</div>
                {/* <div>Purchase</div> */}
                {/* <div>Sales</div>
                <div>Stock</div> */}
                {userInfo?.isAdmin && <div className="">Actions</div>}
              </div>

              {/* Body */}
              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={itemList.length || 5}
                    cols={userInfo?.isAdmin ? 4 : 6}
                    className="lg:grid-cols-[0.2fr_1fr_1fr_0.5fr]"
                  />
                ) : itemList.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No Items found.
                  </div>
                ) : (
                  currentRecords.map((item, index) => (
                    <div
                      key={item._id}
                      className="grid grid-cols-1 lg:grid-cols-[0.2fr_1fr_1fr_0.5fr] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      {indexOfFirstRecord + index + 1}
                      {/* Item Category (with icon) */}
                      <div className="flex items-center gap-3">
                        <img
                          src={item.itemImage?.url || item.itemImage}
                          alt="Product Icon"
                          className="w-7 h-7 object-cover rounded-full"
                        />
                        <span className="font-medium text-gray-900">
                          {item?.itemType?.itemTypeName || "-"}
                        </span>
                      </div>

                      {/* Item Name */}
                      <div className="text-gray-600">
                        {item.itemName || "-"}
                      </div>

                      {/* Purchase */}
                      {/* <div className="font-semibold text-gray-600">
                        {item.purchase || "-"}
                      </div> */}

                      {/* Sales */}
                      {/* <div className="font-semibold text-gray-600">
                        {item.price ?? "-"}
                      </div> */}

                      {/* Stock */}
                      {/* <div className="font-semibold text-gray-600">
                        {item.stock || "-"}
                      </div> */}

                      {/* Actions */}
                      {userInfo?.isAdmin && (
                        <div className="flex justify-start gap-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-500 hover:underline"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-500 hover:underline"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1} to{" "}
                    {Math.min(indexOfLastRecord, itemList.length)} of{" "}
                    {itemList.length} records
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
      </div>

      {/* Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="relative w-full md:w-[900px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Item" : "Add a New Item"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setItemCategory("");
                  setItemName("");
                  setDetails("");
                  setManufacture("");
                  setSupplier("");
                  setShelveLocation("");
                  setItemUnit("");
                  setPerUnit("");
                  // setPurchase("");
                  // setSales("");
                  // setStock("");
                  setPrice("");
                  setBarcode("");
                  setReorder("");
                  setEnabled(true);
                  setImage(null);
                  setImagePreview(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="p-4 md:p-6 bg-white rounded-xl shadow-md space-y-4">
              <div className="space-y-8">
                {/* Section 1 */}
                <div className="space-y-4">
                  <div className="flex gap-5">
                    {/* Item Category ID */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Item Category ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={
                          editId ? itemCategoryId : `ITEM-${nextItemCategoryId}`
                        }
                        onChange={(e) => setItemCategoryId(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                        placeholder="Enter Category ID"
                      />
                    </div>

                    {/* Primary Barcode */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Primary Barcode <span className="text-red-500">*</span>
                      </label>

                      {/* Show barcode preview only if entered */}
                      {primaryBarcode && (
                        <div className="">
                          <Barcode value={primaryBarcode} height={30} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Section 2 */}
                <div className="border px-4 py-8 rounded-lg bg-formBgGray space-y-4">
                  <div className="flex gap-5">
                    {/* Item Category */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Item Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={itemCategory.id}
                        required
                        onChange={handleCategoryChange}
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

                    {/* Item Type */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Item Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={itemType}
                        required
                        disabled={!itemCategory}
                        className={`w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200 
                    ${!itemCategory ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        onChange={(e) => setItemType(e.target.value)}
                      >
                        <option value="">Select Item Type</option>
                        {itemTypeList.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.itemTypeName}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Item Kind */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-400 font-medium">
                        Item Kind <span className="text-red-500">*</span>
                      </label>

                      <select
                        value={itemKind}
                        disabled
                        required
                        onChange={(e) => setItemKind(e.target.value)}
                        className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed text-gray-700"
                      >
                        <option value="Finished Goods">Finished Goods</option>
                      </select>

                      {/* Hidden input ensures value passes in form submission */}
                      <input type="hidden" name="itemKind" value={itemKind} />
                    </div>
                  </div>

                  <div className="flex gap-5">
                    {/* Manufacture */}
                    {/* <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Manufacture
                      </label>
                      <select
                        value={manufacture}
                        required
                        onChange={(e) => setManufacture(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Manufacture</option>
                        {manufacturerList.map((manufacture) => (
                          <option key={manufacture._id} value={manufacture._id}>
                            {manufacture.manufacturerName}
                          </option>
                        ))}
                      </select>
                    </div> */}
                    {/* Supplier */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Supplier
                      </label>
                      <select
                        value={supplier}
                        required
                        onChange={(e) => setSupplier(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Supplier</option>
                        {supplierList.map((supplier) => (
                          <option key={supplier._id} value={supplier._id}>
                            {supplier.supplierName}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Shelve Location */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-400 font-medium">
                        Shelve Location
                      </label>
                      <select
                        value={shelveLocation}
                        onChange={(e) => setShelveLocation(e.target.value)}
                        disabled
                        className="w-full p-2 border bg-gray-100 rounded"
                      >
                        <option value="">Select Location</option>
                        {shelvesList.map((shelves) => (
                          <option key={shelves._id} value={shelves._id}>
                            {shelves.shelfNameCode}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                {/* Item Name */}
                <div className="border px-4 py-6 rounded-lg bg-formBgGray space-y-4">
                  <div className="flex gap-5">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={itemName}
                        required
                        onChange={(e) => setItemName(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    {/* Item Unit */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Item Unit <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={itemUnit}
                        required
                        onChange={(e) => setItemUnit(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Unit</option>
                        {itemUnitList.map((unit) => (
                          <option key={unit._id} value={unit._id}>
                            {unit.unitName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Per Unit */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Per Unit <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={perUnit}
                        onChange={(e) => setPerUnit(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    {/* Purchase */}
                    {/* <div className="flex-1 block min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Purchase <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={purchase}
                        required
                        onChange={(e) => setPurchase(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div> */}
                  </div>

                  <div className="flex gap-5">
                    {/* Sales */}
                    {/* <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Sales <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={sales}
                        required
                        onChange={(e) => setSales(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div> */}

                    {/* Stock */}
                    {/* <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={stock}
                        required
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div> */}
                  </div>

                  <div className="flex gap-4">
                    {/* Reorder */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Reorder
                      </label>
                      <input
                        type="number"
                        value={reorder}
                        onChange={(e) => setReorder(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    {/* Secandory Barcode */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-400 font-medium">
                        Secondary Barcode
                      </label>
                      <input
                        type="text"
                        disabled
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="e.g. BAR1234567890"
                        minLength={5}
                        maxLength={14}
                        onBlur={(e) => setBarcode(e.target.value)} // update on blur
                      />

                      {/* Show barcode only if input is not empty */}
                      {barcode && (
                        <div className="mt-3">
                          <Barcode value={barcode} height={60} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-20">
                <div>
                  <label className="block text-gray-700 font-medium">
                    Expiry Day
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="NoExpiry"
                        checked={expiryOption === "NoExpiry"}
                        onChange={(e) => setExpiryOption(e.target.value)}
                        className="form-radio"
                      />
                      No Expiry days
                    </label>
                    {expiryOption === "HasExpiry" ? (
                      <div className="flex-1 min-w-0">
                        {expiryOption === "HasExpiry" && (
                          <fieldset className="relative mt-1 border-2 border-blue-600 rounded-md px-3">
                            <legend className="px-1 text-sm text-blue-700">
                              Has Expiry Days{" "}
                              <span className="text-red-500">*</span>
                            </legend>
                            <input
                              type="number"
                              id="expiryDays"
                              value={expiryDay}
                              required
                              onChange={(e) => setExpiryDay(e.target.value)}
                              placeholder="Enter expiry days"
                              className="w-full p-2 focus:outline-none focus:ring-0 py-2"
                            />
                          </fieldset>
                        )}
                      </div>
                    ) : (
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="HasExpiry"
                          checked={expiryOption === "HasExpiry"}
                          onChange={(e) => setExpiryOption(e.target.value)}
                          className="form-radio"
                        />
                        Has Expiry days
                      </label>
                    )}
                  </div>
                </div>
              </div>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Product Images <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-newPrimary hover:text-newPrimary focus-within:outline-none"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Uploaded Image
                    </h3>
                    <div className="relative group w-48 h-32">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md border border-gray-200"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Enable / Disable */}
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">
                  Enable / Disable
                </label>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${enabled ? "bg-green-500" : "bg-gray-300"
                    }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${enabled ? "translate-x-7" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>

              {/* Save Button */}
              <button
                className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                onClick={handleSave}
              >
                {isEdit ? "Update Item" : "Save Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOfItems;
