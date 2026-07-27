import React from "react";
import type { Metadata } from "next";
import { WINNERS_DATA } from "@/constants/winners-data";
import { EventSection } from "@/components/winners/EventSection";
import { CRTOverlay } from "@/components/winners/CRTOverlay";

export const metadata: Metadata = {
  title: "Hall of Fame - Microsoft Innovations Club",
  description: "Explore the champions and winners of Microcraft events, hackathons, and contests.",
};

export default function WinnersPage() {
  return (
    <div className="schedule-retro relative min-h-screen text-foreground overflow-x-hidden pt-12 pb-24 select-none">
      {/* Animated Background Layers matching website theme */}
      <div className="stars-container" />
      <div className="neon-grid" />
      <div className="synth-sun" />

      {/* CRT Scanline Overlay Effect */}
      <CRTOverlay />

      {/* Main Page Title */}
      <div className="relative z-10 text-center mb-12 sm:mb-20 px-4">
        <h1
          className="text-3xl sm:text-5xl lg:text-6xl font-black font-press-start text-white uppercase tracking-widest leading-tight"
          style={{
            textShadow:
              "0 4px 12px rgba(0, 0, 0, 0.9), 0 0 14px rgba(255, 211, 106, 0.4)",
          }}
        >
          HALL OF FAME
        </h1>
      </div>

      {/* Event Sections List */}
      <div className="relative z-10 flex flex-col items-center">
        {WINNERS_DATA.map((event) => (
          <EventSection key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
