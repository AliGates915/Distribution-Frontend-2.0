import { SaveIcon, Search } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import TableSkeleton from "../admin/Components/Skeleton";
import CommanHeader from "../admin/Components/CommanHeader";
import axios from "axios";

const OpeningBalance = () => {

  const [itemCategory, setItemCategory] = useState("");
  const [itemType, setItemType] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [itemNameList, setItemNameList] = useState([]);
  const [itemTypeList, setItemTypeList] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [loading, setLoading] = useState(true);



  const [form, setForm] = useState({
    category: "",
    itemType: "",
    itemSearch: "",
  });

  // Refresh the Page called api
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/item-details`
        );
        setItemNameList(res.data);
      
      } catch (error) {
        console.error("Failed to fetch all items", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  // CategoryList Fetch
  const fetchCategoryList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/categories`
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

  // Fetch itemTypes when category changes
  useEffect(() => {
    if (!itemCategory) return; // only call when category selected

    const fetchItemTypes = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/item-type/category/${itemCategory}`
        );
        setItemTypeList(res.data);
      

      } catch (error) {
        console.error("Failed to fetch item types", error);
      }
    };

    fetchItemTypes();
  }, [itemCategory]);

  // when itemType Select then Table repaint according api response 
  useEffect(() => {
    if (!itemType) return;

  


    const fetchItems = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/item-details/item-type/${itemType}`
        );
       
        setItemNameList(res.data);
       

      } catch (error) {
        console.error("Failed to fetch items", error);
      }
    };

    fetchItems();
  }, [itemType]);








  // Static 25 Records
  const [records, setRecords] = useState(
    Array.from({ length: 25 }, (_, i) => ({
      sr: i + 1,
      code: `ITM${String(i + 1).padStart(3, "0")}`,
      type: i % 2 === 0 ? "Type 1" : "Type 2",
      item: i % 2 === 0 ? `Nike Shoes ${i + 1}` : `Adidas Shoes ${i + 1}`,
      purchase: 5 + i,
      sales: 2 + (i % 5),
      stock: 20 + i,
    }))
  );

  // Track editing state per cell
  const [editing, setEditing] = useState({});

  const handleChange = (index, field, value) => {
    const updated = [...records];
    updated[index][field] = value;
    setRecords(updated);
  };

  const handleBlur = (index, field) => {
    setEditing((prev) => ({ ...prev, [`${index}-${field}`]: false }));
  };

  const handleFocus = (index, field) => {
    setEditing((prev) => ({ ...prev, [`${index}-${field}`]: true }));
  };

  // ✅ Filtered records according to search text
  const filteredRecords = records.filter((rec) =>
    rec.item.toLowerCase().includes(form.itemSearch.toLowerCase())
  );
  setTimeout(() => {
    setLoading(false)
  }, 2000);
  return (
    <div className="p-6 space-y-6">
      {/* Heading */}
      {/* Common Header */}
      <CommanHeader />
      <h1 className="text-2xl font-bold text-newPrimary">Opening Balance</h1>

      {/* Form */}
      <div className="border rounded-lg shadow bg-white p-6 w-full">
        <div className="grid grid-cols-3 gap-6 items-end w-full">
          {/* Category */}
          <div className="w-full">
            <label className="block text-gray-700 font-medium mb-1">
              Category
            </label>
            <select
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
            >
              <option value="">Select Category</option>
              {categoryList.map((cat, idx) => (
                <option key={cat._id} value={cat.categoryName}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Item Type */}
          <div className="w-full">
            <label className="block text-gray-700 font-medium mb-1">
              Item Type
            </label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              disabled={!itemCategory}  // ✅ disable when itemCategory is null/undefined/empty
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200 
      ${!itemCategory ? "bg-gray-100 cursor-not-allowed" : ""}`} // ✅ add style when disabled
            >
              <option value="">Select Item Type</option>
              {itemTypeList.map((type) => (
                <option key={type._id} value={type.itemTypeName}>
                  {type.itemTypeName}
                </option>
              ))}
            </select>
          </div>





          {/* Search bar with icon (no label) */}

          {itemNameList.length > 10 &&
            <div className="w-full">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </span>
                <input
                  type="text"
                  value={form.itemSearch}
                  onChange={(e) =>
                    setForm({ ...form, itemSearch: e.target.value })
                  }
                  placeholder="Search Item..."
                  aria-label="Search Item"
                  className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                 placeholder:text-gray-400"
                />
              </div>
            </div>
          }
        </div>
      </div>

      {/* Table */}

      {/* TABLE / CARDS */}



      <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="w-full min-w-full text-sm">
            {/* ✅ Table Header (Desktop Only) */}
            <div className="hidden lg:grid grid-cols-[0.5fr_1fr_1fr_2fr_1fr_1fr_1fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>Sr</div>
              <div>Category</div>
              <div>Type</div>
              <div>Item</div>
              <div>Purchase</div>
              <div>Sales</div>
              <div>Stock</div>
              <div className="text-right">Action</div>
            </div>

            {/* ✅ Table Body */}
            <div className="max-h-screen overflow-y-auto divide-y divide-gray-100">
              {loading ? (
                <TableSkeleton
                  rows={itemNameList.length > 0 ? itemNameList.length : 5}
                  cols={8}
                  className="lg:grid-cols-[0.5fr_1fr_1fr_2fr_1fr_1fr_1fr_auto]"
                />
              ) : itemNameList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No items found.
                </div>
              ) : (
                itemNameList.map((rec, index) => (
                  <>
                    {/* ✅ Desktop Grid */}
                    <div
                      key={rec.code}
                      className="hidden lg:grid grid-cols-[0.5fr_1fr_1fr_2fr_1fr_1fr_1fr_auto] gap-6 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-700">{index + 1}</div>
                      <div className="text-gray-600">{rec?.itemCategory?.categoryName}</div>
                      <div className="text-gray-600">{rec?.itemType?.itemTypeName}</div>
                      <div className="font-medium text-gray-900">
                        {rec.itemName}
                      </div>

                      {/* Editable Purchase */}
                      <div className="text-gray-600">
                        {editing[`${index}-purchase`] ? (
                          <input
                            type="number"
                            value={rec.purchase}
                            onChange={(e) =>
                              handleChange(index, "purchase", e.target.value)
                            }
                            onBlur={() => handleBlur(index, "purchase")}
                            autoFocus
                            className="w-20 border rounded p-1"
                          />
                        ) : (
                          <span
                            onClick={() => handleFocus(index, "purchase")}
                            className="cursor-pointer"
                          >
                            {rec.purchase}
                          </span>
                        )}
                      </div>

                      {/* Editable Sales */}
                      <div className="text-gray-600">
                        {editing[`${index}-sales`] ? (
                          <input
                            type="number"
                            value={rec.price}
                            onChange={(e) =>
                              handleChange(index, "sales", e.target.value)
                            }
                            onBlur={() => handleBlur(index, "sales")}
                            autoFocus
                            className="w-20 border rounded p-1"
                          />
                        ) : (
                          <span
                            onClick={() => handleFocus(index, "sales")}
                            className="cursor-pointer"
                          >
                            {rec.price}
                          </span>
                        )}
                      </div>

                      {/* Editable Stock */}
                      <div className="text-gray-600">
                        {editing[`${index}-stock`] ? (
                          <input
                            type="number"
                            value={rec.stock}
                            onChange={(e) =>
                              handleChange(index, "stock", e.target.value)
                            }
                            onBlur={() => handleBlur(index, "stock")}
                            autoFocus
                            className="w-20 border rounded p-1"
                          />
                        ) : (
                          <span
                            onClick={() => handleFocus(index, "stock")}
                            className="cursor-pointer"
                          >
                            {rec.stock}
                          </span>
                        )}
                      </div>

                      {/* Action */}
                      <div className="flex justify-end">
                        <button className="px-3 py-1 hover:bg-green-50 text-newPrimary rounded">
                          <SaveIcon size={18} />
                        </button>
                      </div>
                    </div>

                    {/* ✅ Mobile Card */}
                    <div
                      key={`mobile-${rec.code}`}
                      className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {rec.item}
                        </span>
                        <span className="text-xs text-gray-500">
                          {rec.code}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Type: {rec.type}
                      </div>
                      <div className="text-sm text-gray-600">
                        Purchase: {rec.purchase}
                      </div>
                      <div className="text-sm text-gray-600">
                        Sales: {rec.sales}
                      </div>
                      <div className="text-sm text-gray-600">
                        Stock: {rec.stock}
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button className="px-3 py-1 hover:bg-green-50 text-newPrimary rounded">
                          <SaveIcon size={18} />
                        </button>
                      </div>
                    </div>
                  </>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OpeningBalance;
