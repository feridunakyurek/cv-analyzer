import { Navigate } from "react-router-dom";

const isAuthenticated = () => {
  const token = localStorage.getItem("token");

  if (!token) return false;
  if (token.trim() === "" || token === "null" || token === "undefined")
    return false;

  return true;
};

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
