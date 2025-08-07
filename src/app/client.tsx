"use client";

import { useEffect, useState } from "react";

// Extend the Window interface to include our global variable
declare global {
  interface Window {
    __INITIAL_TIME__?: number;
  }
}

// Function to get the initial time from the global variable or fallback to current time
function getInitialTime() {
  if (typeof window !== "undefined" && window.__INITIAL_TIME__) {
    return new Date(window.__INITIAL_TIME__);
  }
  return new Date();
}

export default function Client() {
  const [time, setTime] = useState(getInitialTime);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 10);
    return () => clearInterval(timer);
  }, []);

  // Calculate rotation for second hand
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
          suppressHydrationWarning
        />
      </svg>
    </div>
  );
}
