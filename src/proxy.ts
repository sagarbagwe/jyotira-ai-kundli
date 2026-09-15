export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/new-kundli/:path*",
    "/reports/:path*",
    "/charts/:path*",
    "/predictions/:path*",
    "/compatibility/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};