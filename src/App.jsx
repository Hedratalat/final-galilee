import { Suspense, lazy } from "react";
import "./App.css";
import "./index.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Lazy load الصفحات
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Cart = lazy(() => import("./pages/Cart"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const WelcomePopup = lazy(() =>
  import("./components/WelcomePopup/WelcomePopup")
);
const Contact = lazy(() => import("./pages/Contact"));
const ProtectedRoute = lazy(() => import("./pages/ProtectedRoute"));
const Overview = lazy(() => import("./pages/Overview"));
const AddProducts = lazy(() => import("./pages/AddProducts"));
const ManageProducts = lazy(() => import("./pages/ManageProducts"));
const DashBoardLayout = lazy(() =>
  import("./components/DashboardLayout/DashboardLayout")
);
const FeedbackDash = lazy(() => import("./pages/FeedbackDash"));
const Checkout = lazy(() => import("./pages/Checkout"));
const MessageDash = lazy(() => import("./pages/MessageDash"));
const OrdersDash = lazy(() => import("./pages/OrdersDash"));
const WelcomePopUPDash = lazy(() => import("./pages/WelcomePopUpDash"));
const ButtonScroll = lazy(() =>
  import("./components/ButtonScroll/ButtonScroll")
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

function ConditionalWelcomePopup() {
  const location = useLocation();

  const excludedPaths = ["/dashboard", "/login", "/signup", "/verify-email"];

  const shouldShowPopup = !excludedPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return shouldShowPopup ? <WelcomePopup /> : null;
}
function App() {
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <ConditionalWelcomePopup />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/myorders" element={<MyOrders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            {/* //dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashBoardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="addProducts" replace />} />
              <Route path="addProducts" element={<AddProducts />} />
              <Route path="productsManagement" element={<ManageProducts />} />
              <Route path="Feedback" element={<FeedbackDash />} />
              <Route path="message" element={<MessageDash />} />
              <Route path="ordersDah" element={<OrdersDash />} />
              <Route path="welcomePopUp" element={<WelcomePopUPDash />} />

              {/* <Route path="userDash" element={<UserDash />} />
              <Route path="feedback" element={<FeedbackDash />} /> */}
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ButtonScroll />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
