const { SitemapStream, streamToPromise } = require("sitemap");
const { Readable } = require("stream");
const fs = require("fs");
const path = require("path");

// حط هنا كل الـ routes
const routes = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/about", changefreq: "monthly", priority: 0.8 },
  { url: "/products", changefreq: "daily", priority: 0.9 },
  { url: "/contact", changefreq: "monthly", priority: 0.7 },
  { url: "/favorites", changefreq: "weekly", priority: 0.6 },
  { url: "/cart", changefreq: "weekly", priority: 0.5 },
  { url: "/myorders", changefreq: "weekly", priority: 0.6 },
  { url: "/checkout", changefreq: "weekly", priority: 0.5 },
  { url: "/order-success", changefreq: "monthly", priority: 0.4 },
  { url: "/login", changefreq: "monthly", priority: 0.5 },
  { url: "/signup", changefreq: "monthly", priority: 0.5 },
  { url: "/verify-email", changefreq: "monthly", priority: 0.4 },
];

// الدومين بتاعك (شفت إنه galilee-eg.com)
const hostname = "https://galilee-eg.com";

// إنشاء الـ sitemap
const stream = new SitemapStream({ hostname });

streamToPromise(Readable.from(routes).pipe(stream))
  .then((data) => {
    const sitemapPath = path.resolve(__dirname, "public", "sitemap.xml");
    fs.writeFileSync(sitemapPath, data.toString());
    console.log("✅ Sitemap created successfully at:", sitemapPath);
  })
  .catch((err) => {
    console.error("❌ Error creating sitemap:", err);
  });
