import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bell, X, Sun, Cloud, Moon, UserRoundPen, LogOut } from "lucide-react";
import { FiUser } from "react-icons/fi";
import * as Popover from "@radix-ui/react-popover";
import { Link, useNavigate } from "react-router-dom";
// icons

const CommanHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sales, setSales] = useState(0);
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("Admin");
  const [revenue, setRevenue] = useState(0);
  const [bookingPending, setBookingPending] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
const navigate=useNavigate()
  const dropdownRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const base = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  // ✅ Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Fetch dashboard header data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ notifRes] = await Promise.all([
        
          axios.get(`${base}/notifications`, {
            headers: { Authorization: `Bearer ${userInfo?.token}` },
          }),
        ]);

   
        setNotifications(notifRes.data || []);
      } catch (err) {
        console.error("Header data fetch failed:", err);
      } finally {
        setTimeout(() => setLoading(false), 800); // small delay for smooth skeleton
      }
    };

    fetchData();
  }, [base, userInfo?.token]);

  // ✅ Clear one notification
  const clearNotification = async (id) => {
    try {
      await axios.put(`${base}/notifications/${id}/read`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Clear failed:", err);
    }
  };

  // ✅ Clear all notifications
  const clearAll = async () => {
    try {
      await axios.put(`${base}/notifications/mark-all`, null, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      setNotifications([]);
    } catch (err) {
      console.error("Clear all failed:", err);
    }
  };

  // ✅ Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helpers
  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };
  const getGreetingIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return <Sun className="text-amber-500" size={24} />;
    if (hour < 17) return <Cloud className="text-blue-400" size={24} />;
    return <Moon className="text-indigo-500" size={24} />;
  };
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("lastTokenCheck");
    navigate("/");
  };

  return (
    <div className="flex flex-row justify-between items-center mb-6">
      {/* Greeting */}
      <div className="mb-4 md:mb-0">
        <div className="flex items-center gap-2 mb-2">
          {getGreetingIcon()}
          <h1 className="text-2xl font-bold text-newPrimary">
            {getGreeting()}, {userInfo?.name || "Admin"}!
          </h1>
        </div>
        <p className="text-gray-600">
          {formatDate(currentTime)} • {formatTime(currentTime)}
        </p>
      </div>
  
      {/* Quick Stats + Notifications */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-gradient-to-r  p-4 rounded-xl">
     

        {/* Notifications */}
        <div className="">
          <div className="relative flex  flex-row gap-3" ref={dropdownRef}>
            <button
              className="relative p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 "
              onClick={() => setOpen(!open)}
            >
              <Bell size={20} className="" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="flex justify-between items-center p-2 border-b">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">
                      No new notifications
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className="flex justify-between items-start p-3 border-b hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-sm">{notif.title}</p>
                          <p className="text-xs text-gray-600">
                            {notif.message}
                          </p>
                        </div>
                        <button
                          onClick={() => clearNotification(notif._id)}
                          className="ml-2 text-gray-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {/* User Profile */}

            <Popover.Root>
              <Popover.Trigger asChild>
                {/* Profile Trigger */}
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="relative">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white">
                      <UserRoundPen size={16} />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                  </div>
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium capitalize">
                      {userName}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {userRole}
                    </div>
                  </div>
                </div>
              </Popover.Trigger>

              <Popover.Content
                sideOffset={8}
                className="w-40 bg-white rounded-lg shadow-lg border-none p-2 z-50"
              >
                <Link to={'/admin/profile'} className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 focus:outline-none focus:ring-0">
                  <UserRoundPen size={16} />
                  Profile
                </Link>

                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-gray-100 text-red-600 focus:outline-none focus:ring-0">
                  <LogOut size={16} />
                  Logout
                </button>
              </Popover.Content>
            </Popover.Root>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommanHeader;
