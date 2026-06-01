import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { usePermissions } from "../../hooks/usePermissions";

const ProtectedRoute = ({ children, permission }) => {
  const token = Cookies.get("access_token");
  const { can } = usePermissions();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
