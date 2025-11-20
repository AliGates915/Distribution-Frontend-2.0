import React, { useEffect,useCallback, useState, useRef } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import axios from 'axios'
import { FiEdit, FiTrash } from "react-icons/fi";
import Swal from "sweetalert2";
import { PuffLoader } from "react-spinners";
import CommanHeader from "../admin/Components/CommanHeader";


const ProductsPage = () => {

  // State for slider
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsByMonths, setProductsByMonths] = useState([]);
  const [orders, setOrders] = useState([]);
  const [formState, setEditFormState] = useState({
    name: "",
    price: "",
    image: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null); 

  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const [image, setImage] = useState(null);           
  const [imagePreview, setImagePreview] = useState(null); 


  // Get User from the LocalStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
 


// slider styling 
  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { x: "100%", opacity: 0 },  // offscreen right
        {
          x: "0%",
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",          // smoother easing
        }
      );
    }
  }, [isSliderOpen]);



  // Handlers
  const handleAddProduct = () => {
    setIsSliderOpen(true);
  };



  // Fetch All Products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.token) {
        throw new Error("Token not found");
      }
  
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/products`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
  
      const result = await response.json();
     
  
      setProducts(result.data);
  
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Fetch products error:", err);
      toast.error("Failed to fetch products!");
    }
  }, []); // ✅ empty dependency array so it doesn't re-create every render
  
  // ✅ Only run on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);



  // Fetch All Product Add by Month
  const fetchProductsAddMonths = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.token) {
        throw new Error("Token not found");
      }
  
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/products/analytics/monthly`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch product analytics");
      }
  
      const result = await response.json();
     
  
      setProductsByMonths(result.data);
    } catch (err) {
      console.error("Fetch product analytics error:", err);
      toast.error("Failed to fetch product analytics!");
    }
  }, []); // no dependencies since nothing dynamic used
  
  useEffect(() => {
    fetchProductsAddMonths();
  }, [fetchProductsAddMonths]);

  
 // Delete Product
const handleDelete = async (id) => {
  const swalWithTailwindButtons = Swal.mixin({
    customClass: {
      actions: "space-x-2", // gap between buttons
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
          const token = userInfo?.token;
          if (!token) {
            toast.error("Authorization token missing!");
            return;
          }

          await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/products/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Update UI
          setProducts(products.filter((p) => p._id !== id));

          swalWithTailwindButtons.fire(
            "Deleted!",
            "Product deleted successfully.",
            "success"
          );
        } catch (error) {
          console.error("Delete error:", error);
          swalWithTailwindButtons.fire(
            "Error!",
            "Failed to delete product.",
            "error"
          );
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithTailwindButtons.fire(
          "Cancelled",
          "Product is safe 🙂",
          "error"
        );
      }
    });
};


  // Get Currently Month 
  const getCurrentMonth = () => {
    const date = new Date();
    return date.toLocaleString("default", { month: "long" });
  };
  const month = getCurrentMonth();

  // Fetch All Orders
  useEffect(() => {
    const fetchOrdersByMonth = async (month) => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/orders?month=${month}`,
        );

        const res = response.data.data;
        setOrders(res)
       
        // filtered order list
      } catch (error) {
        console.error("Error fetching orders by month:", error);
        return [];
      }
    };

    fetchOrdersByMonth(month);
  }, []);


  // Product Save
  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", formState.name);
    formData.append("price", formState.price);
  
    if (image) {
      formData.append("image", image); // New image if uploaded
    }
  
    try {
      const { token } = JSON.parse(localStorage.getItem("userInfo")) || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };
  
      let response;
  
      if (isEdit && editId) {
        // 🔁 Update Existing Product
        response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/products/${editId}`,
          formData,
          { headers }
        );
        toast.success("✅ Product updated successfully");
        fetchProducts();
        fetchProductsAddMonths()
      } else {
        // ➕ Add New Product
        response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/products`,
          formData,
          { headers }
        );
        toast.success("✅ Product added successfully");
        fetchProducts();
        fetchProductsAddMonths()
      }
  
      // Reset form and close slider
      setEditFormState({ name: "", price: "", image: "" });
      setImage(null);
      setImagePreview(null);
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
  
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${isEdit ? "Update" : "Add"} product failed`);
    }
  };
  

  // Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // For upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // For preview
      };
      reader.readAsDataURL(file);
    }
  };
  

  const removeImage = () => {
    setImagePreview("");
    setEditFormState({ ...formState, image: "" });
  };
  
  const parseCurrency = (value) => {
    if (value == null) return 0;
    return parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  };


  // Capital 1st letter 
  function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Open the edit modal and populate the form
  const handleEdit = (product) => {
    setIsEdit(true);
    setEditId(product._id); // save product ID
    setEditFormState({
      name: product.name || "",
      price: product.price || "",
      image: product.image?.[0]?.url || "",
    });
    setImagePreview(product.image?.[0]?.url || "");
    setIsSliderOpen(true);

    
  };
  


  // Show loading spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PuffLoader
            height="150"
            width="150"
            radius={1}
            color="#00809D"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Coomon header */}
      <CommanHeader/>
      {/* Page Header with Add Product Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Products List</h1>
          <p className="text-gray-500 text-sm">Manage your products inventory</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary transition-colors duration-200 flex items-center"
          onClick={handleAddProduct}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Main Content with Table and Cards */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Product List Table */}
        <div className="rounded-xl shadow p-6  border border-gray-100 w-full lg:w-2/3  overflow-hidden ">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="w-full">
              {/* Table Headers */}
              <div className="hidden lg:grid grid-cols-5 gap-20 bg-gray-50 py-3 px-6  text-xs font-medium text-gray-500 uppercase rounded-lg ">
                <div>Name</div>
                <div>Price</div>
                <div>Total Orders</div>
                <div>Total Sales</div>
                {userInfo?.isAdmin && <div className="text-right">Actions</div>}
              </div>

              {/* Product Rows */}
              <div className="mt-4 flex flex-col gap-[14px] pb-14">
                {products.map((product, index) => {
                  const price = parseCurrency(product.price);
                  const totalOrders = parseCurrency(product.totalOrders);
                  const totalSales = price * totalOrders;

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-5 items-center gap-20 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
                    >
                      {/* Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-[#f0d694] rounded-full">
                          <img
                            src={product.image[0]?.url}
                            alt="Product Icon"
                            className="w-7 h-7 object-cover rounded-full"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {capitalizeFirstLetter(product.name)}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="text-sm text-gray-500">${price.toLocaleString()}</div>

                      {/* Orders */}
                      <div className="text-sm text-gray-500">{totalOrders} Orders</div>

                      {/* Sales */}
                      <div className="text-sm font-semibold text-green-600">${totalSales.toLocaleString()}</div>

                      {/* Actions */}
                      {userInfo?.isAdmin &&
                        <div className="text-right relative group">
                          <button className="text-gray-400 hover:text-gray-600 text-xl">⋯</button>

                          {/* Dropdown */}
                          <div className="absolute right-0 top-6 w-28 h-20 bg-white border border-gray-200 rounded-md shadow-lg 
              opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
              transition-opacity duration-300 z-50 flex flex-col justify-between">
                            <button
                              onClick={() => handleEdit(product)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2">
                              <FiEdit className="text-base text-blue-400" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(product._id)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-500 flex items-center gap-2">
                              <FiTrash className="text-base text-red-400" />
                              Delete
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>



        {/* Cards Section */}
        <div className="flex flex-col gap-6 w-full lg:w-1/3">
          {/* Monthly Data */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Product Add by Month</h2>
            <div className="space-y-4">
              {productsByMonths.map((item, index) => {
                const count = item.count || 0;
                // First: Find the maximum count value across all months
                const maxCount = Math.max(...productsByMonths.map(item => item.count || 0));
                const percentage = maxCount ? (count / maxCount) * 100 : 0;

                return (
                  <div key={index} className="flex items-center">
                    <span className="w-16 text-gray-600 font-medium">{item.month}</span>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${index % 2 === 0
                          ? "bg-gradient-to-r from-[#FF8F6B] to-[#FF8F6B]"
                          : "bg-gradient-to-r from-blue-500 to-blue-600"
                          }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-20 text-right text-sm text-gray-700">{count}</span>
                  </div>
                );
              })}


            </div>
          </div>

          {/* Analytics with Circular Progress Bar */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Product Sales Analytics (This Month)</h2>

            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 mb-4">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  {/* Base Circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="3"
                  />

                  {/* Circle Segments */}
                  {(() => {
                    const totalConfirmed = orders.filter(o => o.orderStatus === "Confirmed").length;
                    const totalCanceled = orders.filter(o => o.orderStatus === "Canceled").length;
                    const total = totalConfirmed + totalCanceled;

                    const confirmedPercent = total ? (totalConfirmed / total) * 100 : 0;
                    const canceledPercent = total ? (totalCanceled / total) * 100 : 0;

                    return (
                      <>
                        {/* Confirmed */}
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          fill="none"
                          stroke="#4CAF50"
                          strokeWidth="3"
                          strokeDasharray={`${confirmedPercent} 100`}
                          strokeDashoffset="0"
                          transform="rotate(-90 18 18)"
                        />
                        {/* Canceled */}
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          fill="none"
                          stroke="#F44336"
                          strokeWidth="3"
                          strokeDasharray={`${canceledPercent} 100`}
                          strokeDashoffset={confirmedPercent}
                          transform="rotate(-90 18 18)"
                        />
                      </>
                    );
                  })()}

                  {/* Center Text: Total Sales */}
                  <text x="18" y="20" textAnchor="middle" fontSize="6" fill="#333" fontWeight="bold">
                    $
                    {orders.reduce((sum, order) => sum + (order.totalSales || 0), 0).toLocaleString()}
                  </text>
                </svg>
              </div>

              {/* Legend */}
              <ul className="w-full space-y-2 text-sm">
                {(() => {
                  const totalConfirmed = orders.filter(o => o.orderStatus === "Confirmed").length;
                  const totalCanceled = orders.filter(o => o.orderStatus === "Canceled").length;
                  const total = totalConfirmed + totalCanceled;

                  const confirmedPercent = total ? ((totalConfirmed / total) * 100).toFixed(1) : 0;
                  const canceledPercent = total ? ((totalCanceled / total) * 100).toFixed(1) : 0;

                  return (
                    <>
                      <li className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          <span className="text-gray-600">Confirmed Orders</span>
                        </div>
                        <span className="font-medium text-gray-700">{confirmedPercent}%</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                          <span className="text-gray-600">Canceled Orders</span>
                        </div>
                        <span className="font-medium text-gray-700">{canceledPercent}%</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                          <span className="text-gray-600">Total Orders</span>
                        </div>
                        <span className="font-medium text-gray-700">{total}</span>
                      </li>
                    </>
                  );
                })()}
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Enhanced Right-Side Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm z-50 transition-opacity duration-300">
          <div
            ref={sliderRef}
            className="absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-newPrimary"> {isEdit ? "Edit Product" : "Add New Product"}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setIsEdit(false);
                    setEditId(null);
                    setEditFormState({ name: "", price: "", image: "" });
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Product Name {}
                      <span className="text-newPrimary">*</span>
                    </label>
                    <input
                      type="text"
                      value={formState.name}
                      onChange={(e) =>
                        setEditFormState({ ...formState, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-newPrimary focus:border-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Price {}
                      <span className="text-newPrimary">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="text"
                        value={formState.price}
  onChange={(e) =>
    setEditFormState({ ...formState, price: e.target.value })
  }
                        className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Product Images {}
                      <span className="text-newPrimary">*</span>
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
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Image</h3>
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
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setIsEdit(false);
                    setEditId(null);
                    setEditFormState({ name: "", price: "", image: "" });
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-newPrimary hover:bg-newPrimary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleSave}
                >
                  {isEdit ? "Update Product" : "Save Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;