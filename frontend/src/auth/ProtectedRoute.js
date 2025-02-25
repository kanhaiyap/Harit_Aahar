import { Navigate } from "react-router-dom";
import { isStaffUser } from "./AuthUtils";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    isStaffUser().then(setAllowed);
  }, []);

  return allowed ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
