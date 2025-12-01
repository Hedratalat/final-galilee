import { lazy, Suspense } from "react";

// Lazy load Navbar
const Navbar = lazy(() => import("../components/Navbar/Navbar"));

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
    </>
  );
}
