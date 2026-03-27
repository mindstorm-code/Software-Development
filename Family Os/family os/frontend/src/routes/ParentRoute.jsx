import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ParentRoute = () => {
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

  if (role !== "parent") {
    return <Navigate to="/child/dashboard" replace />;
  }

  return <Outlet />;
};

export default ParentRoute;
