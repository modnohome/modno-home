/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `pnpm build` writes plain HTML/CSS/JS to out/ for regular hosting
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
