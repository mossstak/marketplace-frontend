'use client'

import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type Placement = "top" | "bottom";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export type PortalTooltipProps = {
  content: ReactNode;
  children: ReactNode;
  gap?: number;
  preferred?: Placement; // "top" | "bottom"
};

export function PortalTooltip({
  content,
  children,
  gap = 8,
  preferred = "top",
}: PortalTooltipProps) {
  const id = useId();

  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState<boolean>(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const computePosition = () => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;

    const t = trigger.getBoundingClientRect();
    const b = tip.getBoundingClientRect();

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Try preferred, then flip if it would go off-screen.
    const canTop = t.top - gap - b.height >= 0;
    const canBottom = t.bottom + gap + b.height <= vh;

    const placement: Placement =
      preferred === "top"
        ? canTop
          ? "top"
          : "bottom"
        : canBottom
          ? "bottom"
          : "top";

    const left = clamp(t.left + t.width / 2 - b.width / 2, 8, vw - b.width - 8);
    const top = placement === "top" ? t.top - b.height - gap : t.bottom + gap;

    setPos({
      left: left + window.scrollX,
      top: top + window.scrollY,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, content, preferred, gap]);

  useEffect(() => {
    if (!open) return;

    const onScroll = () => computePosition();
    const onResize = () => computePosition();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <span
        ref={triggerRef}
        style={{ display: "inline-flex" }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-describedby={open ? id : undefined}
      >
        {children}
      </span>

      {open &&
        createPortal(
          <div
            ref={tipRef}
            id={id}
            role="tooltip"
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
              maxWidth: 280,
              padding: "8px 10px",
              fontSize: 12,
              borderRadius: 10,
              background: "rgba(20,20,20,0.95)",
              color: "white",
              boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}

// Example usage
export default function Demo() {
  return (
    <div
      style={{
        padding: 40,
        height: 400,
        overflow: "hidden",
        border: "1px solid #ddd",
      }}
    >
      <p style={{ marginTop: 160 }}>
        <PortalTooltip content="I render in a portal, so I won't get clipped.">
          <button style={{ padding: "8px 12px" }}>Hover or focus me</button>
        </PortalTooltip>
      </p>
    </div>
  );
}