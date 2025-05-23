import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import { useEffect, useState } from "react";
import { getAdminMonthlyBookings } from "../api-client";

const MonthlyBookingsChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdminMonthlyBookings();
        // Expected format: [{ month: 'Jan', bookings: 45, revenue: 12000 }, ...]
        setData(response);
      } catch (error) {
        console.error("Failed to fetch monthly bookings data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Bookings & Revenue by Month
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="bookings"
            fill="#4F46E5"
            name="Bookings"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="#A0AEC0"
            name="Revenue"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBookingsChart;
