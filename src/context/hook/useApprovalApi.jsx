import { useState, useEffect, useCallback } from "react";
import { api } from "../ApiService";

export const useApprovals = (searchTerm = "") => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);

      let data;
      if (searchTerm && searchTerm.trim().length > 0) {
        const res = await api.get(
          `/requisitions/demandItem/${searchTerm.toUpperCase()}`
        );
        data = Array.isArray(res) ? res : [res];
      } else {
        data = await api.get("/requisitions");
      }

      setApprovals(data);
    } catch (error) {
      console.error("Failed to fetch approvals", error);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    // ✅ debounce logic here
    const delayDebounce = setTimeout(() => {
      fetchApprovals();
    }, 500); // wait 500ms after user stops typing

    return () => clearTimeout(delayDebounce);
  }, [fetchApprovals]);

  return { approvals, setApprovals, loading, refetch: fetchApprovals };
};
