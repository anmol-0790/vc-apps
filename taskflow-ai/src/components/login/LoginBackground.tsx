"use client";

import { useEffect, useState, type CSSProperties, type PointerEvent } from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

type LoginBackgroundProps = {
  cursor: { x: number; y: number };
  hovering: boolean;
};

export function LoginBackground({ cursor, hovering }: LoginBackgroundProps) {
  const reducedMotion = usePrefersReducedMotion();
  const active = hovering && !reducedMotion;

  const mask = `radial-gradient(circle at ${cursor.x}px ${cursor.y}px, #000 72px, transparent 120px)`;

  const dotsStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at center, rgba(99,155,255,0.35) 1.2px, transparent 1.4px)",
    backgroundPosition: "center",
    backgroundSize: "22px 22px",
  };

  const dotsHoverStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at center, rgba(99,155,255,0.5) 2.16px, transparent 2.36px)",
    backgroundPosition: "center",
    backgroundSize: "22px 22px",
    opacity: active ? 1 : 0,
    maskImage: mask,
    WebkitMaskImage: mask,
    transition: reducedMotion ? undefined : "opacity 0.25s ease",
    pointerEvents: "none",
  };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div style={dotsStyle} />
      <div style={dotsHoverStyle} />
      <div
        className="absolute top-[-10%] left-1/2 h-[min(500px,70vw)] w-[min(700px,120vw)] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,130,255,0.12) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

export function useLoginCanvasPointer() {
  const [hovering, setHovering] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  function onPointerEnter() {
    setHovering(true);
  }

  function onPointerLeave() {
    setHovering(false);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setCursor({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  return {
    hovering,
    cursor,
    canvasHandlers: {
      onPointerEnter,
      onPointerLeave,
      onPointerMove,
    },
  };
}
