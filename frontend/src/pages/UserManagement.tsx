import { useEffect, useState } from "react";
import { UseAppContext } from "../contexts/AppContext";
import { getAllUsers, deleteUser } from "../api-client";
import { UserType } from "../../../backend/src/shared/types";
import { FaTrash } from "react-icons/fa";

const UserManagement = () => {
  const { showToast } = UseAppContext();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers.filter((user: UserType) => user.role !== "admin"));
      } catch (err) {
        showToast({ message: "Failed to fetch users", type: "ERROR" });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [showToast]);

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      showToast({ message: "User deleted", type: "SUCCESS" });
    } catch (err) {
      console.error(err);
      showToast({ message: "Failed to delete user", type: "ERROR" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-700">Loading users...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return <p>No users found.</p>;
  }

  const search = searchTerm.toLowerCase().trim();
  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().startsWith(search) ||
      user.lastName.toLowerCase().startsWith(search) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().startsWith(search)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-1 rounded-md text-sm w-64"
        />
      </div>

      <div className="overflow-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-700 text-left text-sm uppercase">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Country</th>
              <th className="p-3">Phone</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                className="text-sm bg-white hover:bg-gray-100 border-b"
              >
                <td className="p-3 whitespace-nowrap">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-3 whitespace-nowrap">{user.email}</td>
                <td className="p-3 whitespace-nowrap">{user.country}</td>
                <td className="p-3 whitespace-nowrap">{user.phoneNumber}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
