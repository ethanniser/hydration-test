"use client";

import React, { useEffect, useRef, useState } from "react";

interface PreArgs {
  whenAvailable<T>(ref: React.RefObject<T | null>, fn: (el: T) => void): void;
}

declare const $useState: typeof useState;
declare const $useRef: typeof useRef;
declare const $useEffect: typeof useEffect;
/**
 * Inside $pre, you can:
 * - read or write to $state's
 * - read or write to $refs
 * - do anything to the DOM
 */
declare const $pre: {
  (fn: (args: PreArgs) => void): void;
  effect: (fn: () => void | (() => void), deps?: unknown[]) => void;
};

export default function Client() {
  return (
    <>
      <Clock />
      <Input />
    </>
  );
}

function Clock() {
  "use before interactive";

  const [time, setTime] = $useState(new Date());
  const secondHand = $useRef<SVGLineElement>(null);

  const secondRotation = time.getSeconds() * 6 + time.getMilliseconds() * 0.006;

  $pre(({ whenAvailable }) => {
    whenAvailable(secondHand, (hand) => {
      $pre.effect(() => {
        hand.setAttribute("transform", `rotate(${secondRotation}, 50, 50)`);
      }, [time]);
    });
  });

  $useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 100);
    return () => clearInterval(timer);
  }, [setTime]);

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

  $pre(({ whenAvailable }) => {
    whenAvailable(input, (i) => {
      // initialize value before paint
      i.value = value;
      // keep URL and handoff state in sync until hydration, then auto-cleanup
      $pre.effect(() => {
        const onInput = () => {
          updateUrl(i.value);
          setValue(i.value);
        };
        i.addEventListener("input", onInput);
        return () => i.removeEventListener("input", onInput);
      });
      i.focus();
    });
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
