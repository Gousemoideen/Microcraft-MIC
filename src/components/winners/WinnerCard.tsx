"use client";

import React, { useEffect, useRef, useState } from "react";
import { Winner } from "@/constants/winners-data";
import {
  Trophy,
  Medal,
  Award,
  Terminal,
  Code,
  Shield,
  Lock,
  Lightbulb,
  Zap,
  Star,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WinnerCardProps {
  winner: Winner;
  accentColor: string;
  accentGlowColor: string;
}

export function WinnerCard({ winner, accentColor, accentGlowColor }: WinnerCardProps) {
  const isFirst = winner.rank === 1;
  const isSecond = winner.rank === 2;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const renderIcon = () => {
    const iconProps = {
      className: "w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300",
      style: { color: accentColor, filter: `drop-shadow(0 0 6px ${accentColor})` },
    };

    switch (winner.icon) {
      case "trophy":
        return <Trophy {...iconProps} />;
      case "medal":
        return <Medal {...iconProps} />;
      case "award":
        return <Award {...iconProps} />;
      case "terminal":
        return <Terminal {...iconProps} />;
      case "code":
        return <Code {...iconProps} />;
      case "shield":
        return <Shield {...iconProps} />;
      case "lock":
        return <Lock {...iconProps} />;
      case "bulb":
        return <Lightbulb {...iconProps} />;
      case "crown":
        return <Crown {...iconProps} />;
      case "star":
        return <Star {...iconProps} />;
      default:
        return <Zap {...iconProps} />;
    }
  };

  const orderClass = isFirst
    ? "order-1 md:order-2"
    : isSecond
    ? "order-2 md:order-1"
    : "order-3 md:order-3";

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex flex-col items-center justify-between transition-all duration-500 ease-out",
        orderClass,
        isFirst
          ? "w-full md:w-[320px] lg:w-[340px] min-h-[340px] sm:min-h-[380px] p-6 sm:p-8 z-20 md:-translate-y-4"
          : "w-full md:w-[280px] lg:w-[300px] min-h-[290px] sm:min-h-[320px] p-5 sm:p-6 z-10",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{
        transitionDelay: `${(winner.rank - 1) * 150}ms`,
      }}
    >
      {/* Gold Floating Star for 1st Place */}
      {isFirst && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 animate-float-star text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <polygon points="12,2 15,9 22,9 16.5,13.5 18.5,21 12,16.5 5.5,21 7.5,13.5 2,9 9,9" />
          </svg>
        </div>
      )}

      {/* Main Pixel Card Container */}
      <div
        className={cn(
          "w-full h-full flex flex-col items-center justify-between rounded-sm bg-[#0a0c16]/85 backdrop-blur-md border-2 transition-all duration-300 relative overflow-hidden group",
          isHovered ? "-translate-y-2 scale-[1.02]" : "translate-y-0 scale-100"
        )}
        style={{
          borderColor: accentColor,
          boxShadow: isHovered
            ? `inset 0 0 24px ${accentGlowColor}, 0 0 28px ${accentGlowColor}`
            : `inset 0 0 12px ${accentGlowColor}, 0 0 14px ${accentGlowColor}`,
        }}
      >
        {/* Subtle Pixel Grid Texture inside card */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
            backgroundSize: "12px 12px",
          }}
        />

        {/* Card Header & Icon Section */}
        <div className="flex flex-col items-center pt-8 pb-3 w-full text-center relative z-10">
          <div className="mb-4 p-3.5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {renderIcon()}
          </div>

          <span
            className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase font-press-start"
            style={{
              color: isFirst ? "#facc15" : "#94a3b8",
              textShadow: isFirst
                ? "0 0 8px rgba(250, 204, 21, 0.6)"
                : "0 0 4px rgba(148, 163, 184, 0.4)",
            }}
          >
            {winner.badgeLabel}
          </span>
        </div>

        {/* Winner Name Section (Place & Name Only) */}
        <div className="flex flex-col items-center pb-8 px-4 w-full text-center relative z-10 my-auto">
          <h3
            className={cn(
              "font-press-start font-bold uppercase tracking-wider text-white break-words max-w-full leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]",
              isFirst ? "text-base sm:text-lg lg:text-xl" : "text-sm sm:text-base"
            )}
            style={{
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.9)",
            }}
          >
            {winner.name}
          </h3>
        </div>

        {/* Bottom Neon Accent Stripe */}
        <div
          className="w-full h-1"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 10px ${accentColor}`,
          }}
        />
      </div>
    </div>
  );
}
