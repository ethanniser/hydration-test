"use client";

import React, { useEffect, useRef, useState } from "react";

interface PreArgs {
  listenUntilHydrated: (
    element: HTMLElement,
    event: string,
    callback: (e: Event) => void
  ) => void;
}

declare const $useState: typeof useState;
declare const $useRef: typeof useRef;
declare const $pre: (fn: (args: PreArgs) => void) => void;

export default function Client() {
  return (
    <>
      <Clock />
      <Input />
    </>
  );
}

// a way to define a initial server state
// a way to define a fn for deriving before interactive state on the client
// a way to set the elements that depend on that state
// a way for react to gracefully initialize with the state on the client

function Clock() {
  "use before interactive";

  const [time, setTime] = $useState(new Date());
  const secondHand = $useRef<SVGLineElement>(null);

  const secondRotation = time.getSeconds() * 6 + time.getMilliseconds() * 0.006;

  $pre(() => {
    if (secondHand.current) {
      secondHand.current.setAttribute(
        "transform",
        `rotate(${secondRotation}, 50, 50)`
      );
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 10);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <svg width="200" height="200" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="white"
          stroke="black"
          strokeWidth="2"
        />

        <circle cx="50" cy="50" r="2" fill="black" />

        <line
          x1="50"
          y1="50"
          x2="50"
          y2="10"
          stroke="red"
          strokeWidth="1"
          transform={`rotate(${secondRotation}, 50, 50)`}
          style={{ transition: "transform 0.1s linear" }}
          ref={secondHand}
        />
      </svg>
    </div>
  );
}

function Input() {
  "use before interactive";

  const [value, setValue] = $useState(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      return url.searchParams.get("value") ?? "";
    }
    return "";
  });

  const updateUrl = (value: string) => {
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?value=${value}`
    );
  };

  const input = $useRef<HTMLInputElement>(null);

  $pre(({ listenUntilHydrated }) => {
    if (input.current) {
      const i = input.current;
      i.value = value;
      listenUntilHydrated(input.current, "input", () => {
        updateUrl(i.value);
        setValue(i.value);
      });
      i.focus();
    }
  });

  return (
    <div>
      <input
        ref={input}
        value={value}
        onChange={(e) => {
          updateUrl(e.target.value);
          setValue(e.target.value);
        }}
      />
    </div>
  );
}
