import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RoleRedirect = () => {
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

  if (role === "parent") {
    return <Navigate to="/parent/dashboard" replace />;
  }

  if (role === "child") {
    return <Navigate to="/child/dashboard" replace />;
  }

  return (
    <div className="app-loading">
      <p className="form-error">Authentication error. Please refresh.</p>
    </div>
  );
};

export default RoleRedirect;
