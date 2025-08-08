"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    __PH__?: Record<string, unknown>;
    __PREHYD__?: boolean;
  }
}

function readHandoff<T>(key: string, fallback: () => T): T {
  if (typeof window !== "undefined") {
    const s = (window.__PH__ ||= {});
    if (key in s) {
      const v = s[key] as T;
      delete s[key];
      return v;
    }
  }
  return fallback();
}

export default function ClientOut() {
  return (
    <>
      <ClockOut />
      <InputOut />
    </>
  );
}

const CLOCK_TIME_KEY = "Clock:0:state:time";
const CLOCK_SECOND_HAND_ID = "ph-clock-second-hand-0";

function ClockOut() {
  const secondHand = useRef<SVGLineElement>(null);
  const [time, setTime] = useState(() =>
    readHandoff(CLOCK_TIME_KEY, () => new Date())
  );

  const rotation = time.getSeconds() * 6 + time.getMilliseconds() * 0.006;

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 100);
    return () => clearInterval(id);
  }, [setTime]);

  const inline = `(${(() => {
    const handoffKey = "Clock:0:state:time"; // todo dont hardcode
    const refId = "ph-clock-second-hand-0"; // todo dont hardcode
    const now = new Date();
    window.__PH__ ||= {};
    window.__PH__[handoffKey] = now;
    const secondHandEl = document.querySelector(
      '[data-pre-id="' + refId + '"]'
    );
    if (secondHandEl) {
      const initialRotation =
        now.getSeconds() * 6 + now.getMilliseconds() * 0.006;
      secondHandEl.setAttribute(
        "transform",
        "rotate(" + initialRotation + ", 50, 50)"
      );
    }
  }).toString()})()`;

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
          transform={`rotate(${rotation}, 50, 50)`}
          style={{ transition: "transform 0.1s linear" }}
          ref={secondHand}
          data-pre-id={CLOCK_SECOND_HAND_ID}
        />
      </svg>
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: inline }}
      />
    </div>
  );
}

const INPUT_VALUE_KEY = "Input:0:state:value";
const INPUT_ID = "ph-input-0";

function InputOut() {
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(() =>
    readHandoff(INPUT_VALUE_KEY, () => {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        return url.searchParams.get("value") ?? "";
      }
      return "";
    })
  );

  const updateUrl = (val: string) => {
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?value=${val}`
    );
  };

  const inline = `(${(() => {
    const handoffKey = "Input:0:state:value"; // todo dont hardcode
    const refId = "ph-input-0"; // todo dont hardcode
    window.__PH__ ||= {};
    if (!(handoffKey in window.__PH__)) {
      try {
        const url = new URL(window.location.href);
        window.__PH__[handoffKey] = url.searchParams.get("value") ?? "";
      } catch {}
    }
    const selector = '[data-pre-id="' + refId + '"]';
    const inputEl = document.querySelector(selector) as HTMLInputElement | null;
    if (!inputEl) return;
    const initialValue = window.__PH__[handoffKey] as string;
    inputEl.value = initialValue;
    const handleInput = () => {
      const newValue = inputEl.value;
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("value", newValue);
      history.pushState(
        {},
        "",
        currentUrl.pathname + "?" + currentUrl.searchParams.toString()
      );
      if (!window.__PH__) return;
      window.__PH__[handoffKey] = newValue as string;
    };
    inputEl.addEventListener("input", handleInput);
    const cleanup = () => inputEl.removeEventListener("input", handleInput);
    if (window.__PREHYD__) {
      cleanup();
    } else {
      const onHydrated = () => {
        cleanup();
        window.removeEventListener("prehyd:hydrated", onHydrated);
      };
      window.addEventListener("prehyd:hydrated", onHydrated);
    }
    inputEl.focus();
  }).toString()})()`;

  return (
    <div>
      <input
        ref={input}
        value={value}
        onChange={(e) => {
          updateUrl(e.target.value);
          setValue(e.target.value);
        }}
        data-pre-id={INPUT_ID}
      />
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: inline }}
      />
    </div>
  );
}
