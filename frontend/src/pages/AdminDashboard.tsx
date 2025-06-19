import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAdminDashboard,
  getBookingStatusBreakdown,
  getTopHotels,
} from "../api-client";
import { UseAppContext } from "../contexts/AppContext";
import { FaCalendarCheck, FaHotel, FaUser } from "react-icons/fa";
import AdminPieChart from "../components/AdminPieChart";
import MonthlyBookingsChart from "../components/MonthlyBookingsChart";
import TopHotelsLeaderboard from "../components/TopHotelsLeaderbord";

const AdminDashboard = () => {
  type AdminDashboardData = {
    message: string;
    stats: {
      users: number;
      hotels: number;
      bookings: number;
    };
  };

  type Hotel = {
    name: string;
    bookings: number;
    averageRating: number;
    score: number;
  };

  type BookingStatus = {
    _id: string;
    count: number;
  };

  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [topHotels, setTopHotels] = useState<Hotel[]>([]);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus[]>([]);
  const { showToast, userRole, loadingUser } = UseAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = useCallback(async () => {
    try {
      const [dashboardData, topHotelsData, bookingStatusData] =
        await Promise.all([
          getAdminDashboard(),
          getTopHotels(),
          getBookingStatusBreakdown(),
        ]);

      setData(dashboardData);
      setTopHotels(topHotelsData);
      setBookingStatus(bookingStatusData);
    } catch (error) {
      showToast({
        message: "Failed to load dashboard data",
        type: "ERROR",
      });
      navigate("/");
      console.error("Error fetching dashboard data:", error);
    }
  }, [navigate, showToast]);

  useEffect(() => {
    if (loadingUser) return;

    if (userRole !== "admin") {
      showToast({ message: "Unauthorized access", type: "ERROR" });
      navigate("/");
      return;
    }

    fetchData();
  }, [location.key, loadingUser, userRole, fetchData, navigate, showToast]);

  if (loadingUser || !data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
      <p className="text-gray-600 mb-8">
        Here’s a quick overview of the platform stats:
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-lg">
            <FaUser className="text-blue-700" />
            <span>Total Users</span>
          </div>
          <p className="text-3xl font-bold text-blue-700">{data.stats.users}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-lg">
            <FaHotel className="text-green-600" />
            <span>Total Hotels</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {data.stats.hotels}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-lg">
            <FaCalendarCheck className="text-yellow-600" />
            <span>Total Bookings</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {data.stats.bookings}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="col-span-1">
          <AdminPieChart data={bookingStatus} />
        </div>
        <div className="col-span-2">
          <MonthlyBookingsChart />
        </div>
      </div>

      {/* Leaderboard Section */}
      {topHotels.length > 0 && (
        <div className="mt-6">
          <TopHotelsLeaderboard data={topHotels} />
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
