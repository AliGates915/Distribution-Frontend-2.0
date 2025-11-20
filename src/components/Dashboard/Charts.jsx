// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react'
import DynamicBarChart from './DynamicBarChart'
import DonutChart from './DonutChart'
import { FaArrowUp } from "react-icons/fa6";
import ProgressBar from './ProgressBar';
import axios from 'axios';

function Charts() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [transactionsRes] = await Promise.all([
          // axios.get(`${import.meta.env.VITE_API_BASE_URL}/transactions`),
        ]);
        setTransactions(transactionsRes.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col md:flex-row w-full gap-4">
      <div className="flex-1 my-2 bg-white px-2 py-2 text-black h-72 md:h-[20rem] shadow-xl flex flex-col">
        <span className="font-semibold">Sales</span>
        <div className="pt-2 text-xs flex justify-between items-end">
          <div className="flex flex-col justify-start">
            <span className="font-bold">{transactions.length}</span>
            <span className="flex justify-items-start">Sales over Time</span>
          </div>
          <div className="flex flex-col">
            <span className="flex items-center">
              <FaArrowUp size={15} color="green" />33.1%
            </span>
            <span className="flex justify-items-end">Sales this month</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <DynamicBarChart />
        </div>
      </div>
      <div className="flex-1 my-2 bg-[rgb(53,58,64)] px-2 py-4 h-72 md:h-[20rem] shadow-xl flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <DonutChart />
        </div>
      </div>
      <div className="flex-1 my-2 bg-[#353a40] px-2 py-4 h-72 md:h-[20rem] shadow-xl flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <ProgressBar />
        </div>
      </div>
    </div>
  )
}

export default Charts