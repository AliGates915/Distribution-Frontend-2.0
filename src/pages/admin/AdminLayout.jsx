// src/pages/admin/AdminLayout.jsx
import React from "react";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => (
  <div className="flex max-w-full min-h-screen">
    <AdminSidebar />
    <main className="flex-1 bg-gray-50 w-0 overflow-x-auto">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
