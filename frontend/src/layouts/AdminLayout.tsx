import { Outlet, Link, useNavigate } from "react-router-dom";
import { signOut } from "../api-client";
import { UseAppContext } from "../contexts/AppContext";
import {
  FaClipboardList,
  FaHotel,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUser,
} from "react-icons/fa";

const AdminLayout = () => {
  const { showToast, setIsLoggedIn, setUserRole } = UseAppContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      setUserRole(null); // ✅ Clear role after logout
      showToast({ message: "Logged out successfully", type: "SUCCESS" });
      navigate("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      showToast({ message: "Logout failed", type: "ERROR" });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>

          <nav className="flex flex-col space-y-4 text-gray-700 font-medium text-base">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <FaTachometerAlt />
              Dashboard
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <FaUser />
              User Management
            </Link>
            <Link
              to="/admin/hotels"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <FaHotel />
              Hotel Management
            </Link>
            <Link
              to="/admin/bookings"
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <FaClipboardList />
              Booking Status
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-700 font-medium text-base hover:text-red-600"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
