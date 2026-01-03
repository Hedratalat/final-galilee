import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const allowedEmails = [
  "hedratalat999@gmail.com",
  "minabahir353@gmail.com",
  "engyadel818@gmail.com",
  "galilee.contact@gmail.com",
  "kirolosguirguiswilliam@gmail.com",
];
export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;

  if (!user || !allowedEmails.includes(user.email)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
