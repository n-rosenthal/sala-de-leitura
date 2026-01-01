import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/livros",
  "/emprestimos",
  "/associados",
  "/dashboard",
  "/me",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasAccessToken = req.cookies.get("access_token");

  if (!hasAccessToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/livros/:path*",
    "/emprestimos/:path*",
    "/associados/:path*",
    "/dashboard/:path*",
    "/me/:path*",
  ],
};
