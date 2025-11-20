import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUserCircle, FaBars, FaTimes, FaSignInAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "../context/authSlice";
import axios from "axios";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const desktopDropdownRef = useRef();
  const mobileDropdownRef = useRef();
  const mobileMenuRef = useRef();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem("userInfo")));
  const [cartCount, setCartCount] = useState(0);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch cart count
  useEffect(() => {
    const fetchCart = async () => {
      const user = JSON.parse(localStorage.getItem("userInfo"));
      const userId = user?.id;
      if (!userId) return;

      try {
        const response = await axios.get(`${API_URL}/cart/${userId}`);
        const cart = response.data;
        const count =
          cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartCount(count);
      } catch (error) {
        setCartCount(0);
      }
    };

    fetchCart();
    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cartUpdated", handleCartUpdate);
    const interval = setInterval(fetchCart, 20000);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      clearInterval(interval);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
   
    try {
      dispatch(logout());
      localStorage.removeItem("userInfo");
      localStorage.removeItem("lastTokenCheck");
      setUserInfo(null);
      setShowDropdown(false);
      setIsMobileMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { path: "/products", text: "Products" },
    { path: "/apps", text: "Apps" },
    { path: "/return-policy", text: "Return Policy" },
    { path: "/disclaimer", text: "Disclaimer" },
    { path: "/about", text: "About" },
    { path: "/contact", text: "Contact" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between px-5 md:px-20 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <img
            src="/images/logo.webp"
            alt="Wahid Foods Logo"
            className="h-14 w-auto"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden 900:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-black hover:text-newPrimary font-medium transition-colors duration-300"
            >
              {link.text}
            </Link>
          ))}
          <Link to="/cart" className="relative">
            <FaShoppingCart className="text-xl text-newPrimary" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-newPrimary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {!userInfo ? (
            <Link to="/login" className="flex items-center text-newPrimary gap-1">
              <FaSignInAlt className="text-xl" />
              <span>Sign In</span>
            </Link>
          ) : (
            <div className="relative" ref={desktopDropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-2"
                type="button"
              >
                <FaUserCircle className="text-xl text-newPrimary" />
                <span className="text-newPrimary font-medium">
                  {userInfo.username || userInfo.name || userInfo.email}
                </span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg py-2 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-newPrimary hover:bg-newPrimary hover:text-white"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-newPrimary hover:bg-newPrimary hover:text-white"
                    onClick={() => setShowDropdown(false)}
                  >
                    Orders
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-newPrimary hover:bg-newPrimary hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Section */}
        <div className="900:hidden flex items-center space-x-4">
          <Link to="/cart" className="relative">
            <FaShoppingCart className="text-xl text-newPrimary" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-newPrimary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            className="mobile-menu-button text-newPrimary"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            type="button"
          >
            {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="900:hidden bg-white shadow-lg py-4 px-5 z-40">
          <div className="flex flex-col space-y-4 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-newPrimary hover:bg-newPrimary hover:text-white font-medium py-2 px-2 w-full text-center rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.text}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 w-full text-center" ref={mobileDropdownRef}>
              {userInfo ? (
                <>
                  <Link
                    to="/profile"
                    className="block text-newPrimary hover:bg-newPrimary hover:text-white py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block text-newPrimary hover:bg-newPrimary hover:text-white py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <button
                    type="button"
                    className="w-full text-newPrimary hover:bg-newPrimary hover:text-white py-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block text-newPrimary hover:bg-newPrimary hover:text-white py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
