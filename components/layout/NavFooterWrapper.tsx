"use client";

import { usePathname } from "next/navigation";
import Nav from "./Nav";
import Footer from "./Footer";

export function NavFooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin     = pathname.startsWith("/admin");
  const isAuth      = pathname.startsWith("/auth");
  const isDashboard = pathname.startsWith("/dashboard");

  if (isAdmin || isAuth || isDashboard) return <>{children}</>;

  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}
