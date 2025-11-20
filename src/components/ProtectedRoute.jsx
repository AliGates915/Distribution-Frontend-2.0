import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const [isValid, setIsValid] = useState(null);
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const checkToken = async () => {
      if (!user?.token) {
        setIsValid(false);
        return;
      }

      const lastCheck = localStorage.getItem("lastTokenCheck");
      if (lastCheck && Date.now() - parseInt(lastCheck, 10) < 5 * 60 * 1000) {
        // ✅ Within 5 minutes, skip recheck
        setIsValid(true);
        return;
      }

      try {
        const { data } = await axios.get(`${API_URL}/token/check`, {
          headers: { Authorization: `Bearer ${user.token}` },
          timeout: 7000,
        });

        if (data?.success === false) {
          localStorage.clear();
          setIsValid(false);
        } else {
          // ✅ Store timestamp when token validated
       
localStorage.setItem("lastTokenCheck", Date.now().toString());

          setIsValid(true);
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.warn("🚫 Token expired or invalid — redirecting...");
          localStorage.clear();
          setIsValid(false);
        } else {
          console.warn("⚠️ Token validation failed:", error.message);
          // Optional fallback
          setIsValid(true);
        }
      }
    };

    checkToken();
  }, []);

  if (isValid === null) return null;
  if (!user || !isValid) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
