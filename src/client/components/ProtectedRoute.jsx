import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { CurrentUserContext } from "../contexts/CurrentUserContext";

// gate routes that need login
const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useContext(CurrentUserContext);
  const location = useLocation();
  if (isLoading) return null;
  if (!currentUser)
    return <Navigate to="/" replace state={{ from: location }} />;
  return children;
};

export default ProtectedRoute;
