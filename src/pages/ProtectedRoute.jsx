import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;

  if (!user || user.email !== "hedratalat1717@gmail.com") {
    return <Navigate to="/" replace />;
  }

  return children;
}
