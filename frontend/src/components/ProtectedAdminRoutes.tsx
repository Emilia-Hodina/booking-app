// src/components/ProtectedAdminRoute.tsx
import { Navigate } from "react-router-dom";
import { UseAppContext } from "../contexts/AppContext";

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, userRole } = UseAppContext();

  if (!isLoggedIn || userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
