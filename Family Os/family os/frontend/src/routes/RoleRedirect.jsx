import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RoleRedirect = () => {
  const { user, role } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "parent") {
    return <Navigate to="/parent/dashboard" replace />;
  }

  if (role === "child") {
    return <Navigate to="/child/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RoleRedirect;
