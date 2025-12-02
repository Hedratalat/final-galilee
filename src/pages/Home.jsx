import { lazy, Suspense } from "react";

// Lazy load Navbar
const Navbar = lazy(() => import("../components/Navbar/Navbar"));
const HeroSection = lazy(() => import("../components/HeroSection/HeroSection"));

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
        <HeroSection />
      </Suspense>
    </>
  );
}
