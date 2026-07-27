"use client";

import React from "react";
import { EventWinnerGroup } from "@/constants/winners-data";
import { WinnerCard } from "./WinnerCard";

interface EventSectionProps {
  event: EventWinnerGroup;
}

export function EventSection({ event }: EventSectionProps) {
  return (
    <section className="w-full max-w-6xl mx-auto mb-16 sm:mb-24 px-4">
      {/* Event Header with Pipe Bar and Badge */}
      <div className="flex items-center gap-3 mb-8 sm:mb-12">
        <span
          className="text-2xl sm:text-3xl font-bold font-press-start select-none"
          style={{ color: event.accentColor, textShadow: `0 0 10px ${event.accentColor}` }}
        >
          |
        </span>

        <h2
          className="text-xl sm:text-2xl lg:text-3xl font-bold font-press-start uppercase tracking-wider text-white"
          style={{
            textShadow: `0 0 12px ${event.accentGlowColor}`,
          }}
        >
          {event.title}
        </h2>

        <span
          className="ml-2 text-[9px] sm:text-[11px] font-bold font-press-start px-2.5 py-1 rounded border uppercase tracking-wider bg-black/60"
          style={{
            color: event.accentColor,
            borderColor: event.accentColor,
            boxShadow: `0 0 8px ${event.accentGlowColor}`,
          }}
        >
          {event.categoryBadge}
        </span>
      </div>

      {/* 3 Winner Cards Grid */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-8 min-h-[420px] pt-4">
        {/* 2nd Place Card (Left on desktop) */}
        <WinnerCard
          winner={event.winners.second}
          accentColor={event.accentColor}
          accentGlowColor={event.accentGlowColor}
        />

        {/* 1st Place Card (Center, Larger, Floating Star on desktop) */}
        <WinnerCard
          winner={event.winners.first}
          accentColor={event.accentColor}
          accentGlowColor={event.accentGlowColor}
        />

        {/* 3rd Place Card (Right on desktop) */}
        <WinnerCard
          winner={event.winners.third}
          accentColor={event.accentColor}
          accentGlowColor={event.accentGlowColor}
        />
      </div>
    </section>
  );
}
