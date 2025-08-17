"use client";

import React from "react";
import { useEffect, useState } from "react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Broken</h1>
      <Clock />
      <h1 className="text-2xl font-bold">Fixed</h1>
      <Clock lineId="second-hand" />
      <InlineScript />
    </div>
  );
}

function Clock({ lineId }: { lineId?: string }) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 10);
    return () => clearInterval(timer);
  }, []);

  const secondRotation = time.getSeconds() * 6 + time.getMilliseconds() * 0.006;

  return (
    <div>
      <svg width="200" height="200" viewBox="0 0 100 100">
        {/* Clock face */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="white"
          stroke="black"
          strokeWidth="2"
        />

        {/* Center dot */}
        <circle cx="50" cy="50" r="2" fill="black" />

        {/* Second hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="10"
          stroke="red"
          strokeWidth="1"
          transform={`rotate(${secondRotation}, 50, 50)`}
          style={{ transition: "transform 0.1s linear" }}
          id={lineId}
          suppressHydrationWarning
        />
      </svg>
    </div>
  );
}

function InlineScript() {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `(${(() => {
          const secondHand = document.getElementById("second-hand");
          if (!secondHand) {
            console.error("Second hand not found");
            return;
          }
          const time = new Date();
          const secondRotation =
            time.getSeconds() * 6 + time.getMilliseconds() * 0.006;
          secondHand.setAttribute(
            "transform",
            `rotate(${secondRotation}, 50, 50)`
          );
        }).toString()})()`,
      }}
    />
  );
}
