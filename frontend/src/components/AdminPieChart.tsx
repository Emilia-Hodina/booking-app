import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  confirmed: "#4CAF50",
  canceled: "#F44336",
};

type BookingStatusData = {
  _id: string;
  count: number;
};

const AdminPieChart = ({ data }: { data?: BookingStatusData[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center text-gray-500">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Booking Status Breakdown
        </h2>
        <p>No booking status data available.</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
    color: COLORS[item._id as keyof typeof COLORS] || "#8884d8",
  }));

  return (
    <div className="w-full col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Booking Status Breakdown
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {chartData.map(({ color }, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminPieChart;
