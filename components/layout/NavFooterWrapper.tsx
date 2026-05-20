"use client";

import { usePathname } from "next/navigation";
import Nav from "./Nav";
import Footer from "./Footer";

export function NavFooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth      = pathname.startsWith("/auth");
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin     = pathname.startsWith("/admin");

  if (isAuth || isDashboard || isAdmin) return <>{children}</>;

  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}
