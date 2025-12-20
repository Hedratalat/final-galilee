import { lazy, Suspense } from "react";

// Lazy load Navbar
const Navbar = lazy(() => import("../components/Navbar/Navbar"));
const HeroSection = lazy(() => import("../components/HeroSection/HeroSection"));
const CategoriesSection = lazy(() =>
  import("../components/CategoriesSection/CategoriesSection")
);
const HomeProduct = lazy(() => import("../components/HomeProduct/HomeProduct"));
const Feedback = lazy(() => import("../components/Feedback/Feedback"));
const Footer = lazy(() => import("../components/Footer/Footer"));

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
        <HeroSection />
        <CategoriesSection />
        <HomeProduct />
        <Feedback />
        <Footer />
      </Suspense>
    </>
  );
}
