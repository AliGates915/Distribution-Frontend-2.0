import { useState, useEffect } from "react";
import { api } from "../ApiService";


// 🔹 Hook for Departments
export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const data = await api.get("/departments");
        setDepartments(data);
      } catch (error) {
        console.error("Failed to fetch Department", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchDepartments();
  }, []);

  return { departments, loading, setDepartments };
};

// 🔹 Hook for Employees
export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await api.get("/employees");
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch Employees", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchEmployees();
  }, []);

  return { employees, loading, setEmployees };
};

// 🔹 Hook for Categories
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await api.get("/categories");
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch Categories", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, setCategories };
};

// in useRequisitionApi.js
export const useRequisitions = (searchTerm) => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      if (searchTerm && searchTerm.startsWith("req-")) {
        const data = await api.get(`/requisitions/search/${searchTerm.toUpperCase()}`);
        setRequisitions(Array.isArray(data) ? data : [data]);
      } else {
        const data = await api.get("/requisitions");
        setRequisitions(data);
      }
    } catch (error) {
      console.error("Failed to fetch Requisitions", error);
      setRequisitions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchRequisitions, 500); // debounce search
    return () => clearTimeout(delay);
  }, [searchTerm]);

  return { requisitions, loading, setRequisitions, refetch: fetchRequisitions };
};

