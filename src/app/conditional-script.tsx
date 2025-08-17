"use client";

import { usePathname } from "next/navigation";

export function ConditionalBlockHydrationScript() {
  const pathname = usePathname();

  const routesWithDelayedHydration = ["/input", "/auth"];

  if (!routesWithDelayedHydration.includes(pathname)) {
    return null;
  }

  return <script src="/api/slow.js" />;
}
