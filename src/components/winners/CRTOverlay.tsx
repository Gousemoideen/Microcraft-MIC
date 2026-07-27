"use client";

import React from "react";

export function CRTOverlay() {
  return (
    <div
      className="fixed inset-0 z-30 pointer-events-none crt-scanline-overlay"
      aria-hidden="true"
    />
  );
}
