import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UseAppContext } from "../contexts/AppContext";

const AutoRedirect = () => {
  const { isLoggedIn, userRole, loadingUser } = UseAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingUser) return;

    if (isLoggedIn && userRole === "admin") {
      navigate("/admin/dashboard");
    } else if (isLoggedIn && userRole === "user") {
      navigate("/my-hotels");
    } else {
      navigate("/");
    }
  }, [isLoggedIn, userRole, loadingUser, navigate]);

  return (
    <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
      Redirecting...
    </div>
  );
};

export default AutoRedirect;
