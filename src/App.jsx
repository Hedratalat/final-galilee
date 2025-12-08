import { Suspense, lazy } from "react";
import "./App.css";
import "./index.css";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Lazy load الصفحات
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Cart = lazy(() => import("./pages/Cart"));
const Contact = lazy(() => import("./pages/Contact"));
const Overview = lazy(() => import("./pages/Overview"));
const AddProducts = lazy(() => import("./pages/AddProducts"));
const ManageProducts = lazy(() => import("./pages/ManageProducts"));
const DashBoardLayout = lazy(() =>
  import("./components/DashboardLayout/DashboardLayout")
);

// Spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div
      className="w-16 h-16 border-4 border-t-darkBlue border-b-darkBlue border-l-gray-300 border-r-gray-300 
      rounded-full animate-spin"
    ></div>
  </div>
);
function App() {
  return (
    <>
      <HashRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            {/* //dashboard */}
            <Route
              path="/dashboard"
              element={
                // <ProtectedRoute>
                <DashBoardLayout />
                // </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="Overview" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="addProducts" element={<AddProducts />} />
              <Route path="productsManagement" element={<ManageProducts />} />
              {/* <Route path="userDash" element={<UserDash />} />
              <Route path="ordersDah" element={<OrdersDah />} />
              <Route path="feedback" element={<FeedbackDash />} /> */}
              {/* <Route path="message" element={<MessageDash />} /> */}
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
