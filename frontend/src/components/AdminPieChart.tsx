import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { getAdminDashboard } from "../api-client";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF5E78",
];

type PieData = {
  name: string;
  value: number;
};

type LabelRenderProps = {
  name: string;
  percent: number;
};

const AdminPieChart = () => {
  const [data, setData] = useState<PieData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await getAdminDashboard();
        const pieData = [
          { name: "Bookings", value: dashboardData.stats.bookings },
          { name: "Users", value: dashboardData.stats.users },
          { name: "Hotels", value: dashboardData.stats.hotels },
        ];
        setData(pieData);
      } catch (error) {
        console.error("Failed to fetch pie chart data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full md:max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Platform Overview
        </h2>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ percent }: LabelRenderProps) =>
              ` ${(percent * 100).toFixed(0)}% `
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value}`, name]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminPieChart;
