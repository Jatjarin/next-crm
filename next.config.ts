import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    // เพิ่มส่วนนี้เพื่ออนุญาต Hostname ของ Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        // ใส่ Hostname ที่ได้จากข้อความ Error ที่นี่
        hostname: "bzwysgttfziejgznhhep.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
