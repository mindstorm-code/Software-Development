import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ChildRoute = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading your family dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "child") {
    return <Navigate to="/parent/dashboard" replace />;
  }

  return <Outlet />;
};

export default ChildRoute;
