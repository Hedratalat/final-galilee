import { Suspense, lazy } from "react";
import "./App.css";
import "./index.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import { Toaster } from "react-hot-toast";

// Lazy load الصفحات
const Home = lazy(() => import("./pages/Home"));

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
            <Route path="/products" element={<Products />} />
            <Route path="/Contact" element={<Contact />} />
          </Routes>
        </Suspense>
      </HashRouter>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
