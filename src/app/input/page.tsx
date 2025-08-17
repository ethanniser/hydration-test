"use client";

import React, { useEffect, useState } from "react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-row items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">Broken</h1>
          <Input />
        </div>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">Fixed</h1>
          <Input initValueFromDOM />
        </div>
      </div>
      <HydrationIndicator />
      <script src="/api/slow.js"></script>
    </div>
  );
}

function Input({ initValueFromDOM }: { initValueFromDOM?: boolean }) {
  const [value, setValue] = useState(() => {
    if (initValueFromDOM && typeof window !== "undefined") {
      const input = document.getElementById("input");
      if (input && input instanceof HTMLInputElement) {
        return input.value;
      }
    }
    return "";
  });

  useIsHydrated(); // idk why this is needed- react is weird

  return (
    <input
      id={initValueFromDOM ? "input" : undefined}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="border-2 border-gray-300 rounded-md p-2 text-lg"
    />
  );
}

function useIsHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  return hasHydrated;
}

function HydrationIndicator() {
  const hasHydrated = useIsHydrated();
  if (!hasHydrated) {
    return (
      <div className="bg-red-600 text-white p-2 rounded-md">
        HTML from server, not yet hydrated
      </div>
    );
  }
  return (
    <div className="bg-green-600 text-white p-2 rounded-md">React hydrated</div>
  );
}
