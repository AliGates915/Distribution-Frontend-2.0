import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import axios from "axios";

// Helper to get week number in the month
function getWeekOfMonth(date) {
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  return Math.ceil((d.getDate() + firstDay.getDay()) / 7);
}

// Transform transactions to chart data
function getChartData(transactions) {
  // Prepare 5 weeks (some months have 5 weeks)
  const weeks = [
    { name: "Week 1", Orders: 0, Revenue: 0 },
    { name: "Week 2", Orders: 0, Revenue: 0 },
    { name: "Week 3", Orders: 0, Revenue: 0 },
    { name: "Week 4", Orders: 0, Revenue: 0 },
    { name: "Week 5", Orders: 0, Revenue: 0 },
  ];

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  transactions.forEach(txn => {
    const txnDate = new Date(txn.createdAt);
    if (txnDate.getMonth() === thisMonth && txnDate.getFullYear() === thisYear) {
      const week = getWeekOfMonth(txnDate) - 1; // 0-based index
      weeks[week].Orders += 1;
      weeks[week].Revenue += txn.totalAmount || 0;
    }
  });

  return weeks;
}

const DynamicBarChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      // const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/transactions`);
      const transactions = res.data.data || [];
      setChartData(getChartData(transactions));
    };
    fetchTransactions();
  }, []);

  return (
    <div className="w-full h-full text-sm">
      <div className="bg-white rounded shadow p-2 h-full w-full flex flex-col">
        <h2 className="text-xl font-semibold mb-2">
          Orders & Revenue (This Month)
        </h2>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" hide />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="Orders" fill="#8884d8" name="Orders" />
              <Bar yAxisId="right" dataKey="Revenue" fill="#82ca9d" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DynamicBarChart;