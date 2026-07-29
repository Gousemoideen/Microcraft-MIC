"use client";

import * as React from "react";
import { Play, ExternalLink, Info, Sparkles, Volume2, Maximize2, UserCheck, GraduationCap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CertificateInstructionVideoProps {
  registrationUrl?: string;
  className?: string;
}

export function CertificateInstructionVideo({
  registrationUrl = "https://eventhubcc.vit.ac.in/EventHub/",
  className = "",
}: CertificateInstructionVideoProps) {
  const [showNotice, setShowNotice] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"external" | "vit">("external");

  const handlePlayClick = () => {
    setShowNotice(true);
    setTimeout(() => setShowNotice(false), 4000);
  };

  const externalSteps = [
    "Open the VIT Event Hub website (click the button above or visit eventhubcc.vit.ac.in).",
    "Select the event you want to participate in and click Yes / Register.",
    "Fill in your details: Name, Email ID, WhatsApp Number, College Name, and Password.",
    "Click Sign Up.",
    "Open the verification email sent to your inbox.",
    "Click the verification link (or use the verification button) to activate your account.",
    "Return to the website and log in using your registered email and password.",
    "Search for your event and open it.",
    "Click Register for the event.",
    "A confirmation message will appear indicating that your registration was successful.",
  ];

  const vitSteps = [
    "Open the VIT Event Hub website (click the button above or visit eventhubcc.vit.ac.in).",
    "Sign in using your VTOP credentials.",
    "Browse and select the event you want to participate in.",
    "Click Register.",
    "Review your details (if prompted) and confirm your registration.",
    "A confirmation message will appear once your registration is successful.",
  ];

  return (
    <div className={`w-full max-w-4xl mx-auto mt-12 space-y-6 ${className}`}>
      {/* Container Box */}
      <div className="relative overflow-hidden rounded-3xl border border-[#ffafd5]/25 bg-black/60 p-6 md:p-8 backdrop-blur-md shadow-[0_0_40px_rgba(255,175,213,0.1)]">
        {/* Glow accents in background */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#ffafd5]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#38b6ff]/10 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#ffafd5] text-xs font-mono font-bold tracking-widest uppercase mb-1">
              <Sparkles className="h-4 w-4" />
              Certificate Portal & Instruction Guide
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase">
              How to Register & Claim Certificates
            </h3>
            <p className="text-xs md:text-sm text-arcade-muted mt-1 leading-relaxed max-w-2xl">
              To receive your official verified certificate, participants must register on the official VIT Event Hub portal. Watch the guide below and follow the step-by-step instructions.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              asChild
              className="arcade-btn px-5 py-3 text-xs font-black tracking-widest uppercase flex items-center gap-2 hover:scale-[1.03] transition-transform shadow-[0_0_20px_rgba(249,77,180,0.35)] cursor-pointer"
            >
              <a href={registrationUrl} target="_blank" rel="noopener noreferrer">
                VIT EVENT HUB PORTAL <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Dummy Video Player Placeholder */}
        <div
          className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black shadow-2xl group cursor-pointer"
          onClick={handlePlayClick}
        >
          {/* Subtle Grid pattern inside video preview */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffafd5_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/70" />

          {/* Top Badges overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffafd5] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ffafd5]"></span>
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase">
                INSTRUCTION GUIDE • VIDEO PLACEHOLDER
              </span>
            </div>

            <div className="bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1 rounded-md text-[10px] font-mono text-white/80">
              02:45
            </div>
          </div>

          {/* Center Play Button Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute h-20 w-20 rounded-full bg-[#ffafd5]/20 animate-ping group-hover:bg-[#ffafd5]/30 transition-all" />

              <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full bg-[#ffafd5] text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,175,213,0.6)] group-hover:scale-110 transition-transform duration-300">
                <Play className="h-8 w-8 md:h-10 md:w-10 fill-black translate-x-0.5" />
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <p className="text-sm md:text-base font-bold text-white tracking-wider uppercase drop-shadow-md">
                VIT Event Hub Registration Tutorial
              </p>
              <p className="text-[11px] font-mono text-[#ffafd5] tracking-widest uppercase">
                [ Instruction Video Upload Pending ]
              </p>
            </div>
          </div>

          {/* Alert Toast Notice when clicked */}
          {showNotice && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-black/90 border border-[#ffafd5] text-white px-4 py-2.5 rounded-lg shadow-xl backdrop-blur-md flex items-center gap-2 text-xs animate-in fade-in zoom-in-95 duration-200">
              <Info className="h-4 w-4 text-[#ffafd5] shrink-0" />
              <span>Instruction guide video will be uploaded soon!</span>
            </div>
          )}

          {/* Mock Video Player Control Bar at bottom */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 md:p-4 z-20 flex flex-col gap-2 pointer-events-none">
            {/* Progress bar */}
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden relative">
              <div className="bg-gradient-to-r from-[#ffafd5] to-[#38b6ff] h-full w-[35%] rounded-full relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-[0_0_10px_#ffafd5]" />
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between text-white/70 text-xs pt-1 font-mono">
              <div className="flex items-center gap-3">
                <Play className="h-4 w-4" />
                <Volume2 className="h-4 w-4" />
                <span className="text-[10px] text-white/50">00:58 / 02:45</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] border border-white/20 px-1.5 py-0.5 rounded text-white/60">HD</span>
                <Maximize2 className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Registration Instructions Tabs */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#79f2a1]" />
              Step-By-Step Registration Instructions
            </h4>

            {/* Track Switcher Tabs */}
            <div className="bg-black/60 border border-white/10 p-1 flex rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab("external")}
                className={`text-xs px-4 py-1.5 rounded-md font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "external"
                    ? "bg-[#ffafd5]/20 text-[#ffafd5] border border-[#ffafd5]/40"
                    : "text-arcade-muted hover:text-white border border-transparent"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                External Participant
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("vit")}
                className={`text-xs px-4 py-1.5 rounded-md font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "vit"
                    ? "bg-[#38b6ff]/20 text-[#38b6ff] border border-[#38b6ff]/40"
                    : "text-arcade-muted hover:text-white border border-transparent"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                VIT Student
              </button>
            </div>
          </div>

          {/* Tab 1: External Participant Registration */}
          {activeTab === "external" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                  <span className="text-xs font-bold font-mono uppercase text-[#ffafd5] tracking-wider">
                    2.1 External Participant Registration Steps
                  </span>
                  <a
                    href={registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-arcade-muted hover:text-white underline flex items-center gap-1"
                  >
                    Open Portal <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <ol className="space-y-3">
                  {externalSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-white/90 leading-relaxed">
                      <span className="h-5 w-5 rounded-full bg-[#ffafd5]/20 text-[#ffafd5] flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Tab 2: VIT Student Registration */}
          {activeTab === "vit" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                  <span className="text-xs font-bold font-mono uppercase text-[#38b6ff] tracking-wider">
                    2.2 VIT Student Registration Steps
                  </span>
                  <a
                    href={registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-arcade-muted hover:text-white underline flex items-center gap-1"
                  >
                    Open Portal <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <ol className="space-y-3">
                  {vitSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-white/90 leading-relaxed">
                      <span className="h-5 w-5 rounded-full bg-[#38b6ff]/20 text-[#38b6ff] flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
