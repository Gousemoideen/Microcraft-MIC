"use client";

import * as React from "react";
import { signIn, useSession } from "next-auth/react";
import { Award, Search, ShieldCheck, AlertCircle, ExternalLink, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CertificateInstructionVideo } from "@/components/CertificateInstructionVideo";

type Certificate = {
  cert_id: string;
  participant_name: string;
  event_name: string;
  event_type: "workshop" | "hackathon";
  cloudinary_url: string;
  issued_at: string;
};

export default function CertificatesPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = React.useState<"verify" | "my-certs">("verify");
  
  // Public Verification states
  const [searchId, setSearchId] = React.useState("");
  const [searchResult, setSearchResult] = React.useState<{
    searched: boolean;
    loading: boolean;
    found: boolean;
    certificate?: Certificate;
    error?: string;
  }>({
    searched: false,
    loading: false,
    found: false,
  });

  // User Certificates states
  const [userCerts, setUserCerts] = React.useState<Certificate[]>([]);
  const [loadingUserCerts, setLoadingUserCerts] = React.useState(false);

  // Fetch logged-in user's certificates
  const fetchUserCerts = React.useCallback(async () => {
    if (status !== "authenticated") return;
    setLoadingUserCerts(true);
    try {
      const res = await fetch("/api/user/certificates");
      if (res.ok) {
        const data = await res.json();
        setUserCerts(data.certificates || []);
      }
    } catch (err) {
      console.error("Failed to load user certificates", err);
    } finally {
      setLoadingUserCerts(false);
    }
  }, [status]);

  React.useEffect(() => {
    if (status === "authenticated" && activeTab === "my-certs") {
      fetchUserCerts();
    }
  }, [status, activeTab, fetchUserCerts]);

  // Handle Certificate Lookup Search
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchId.trim()) return;

    setSearchResult({ searched: false, loading: true, found: false });

    try {
      const res = await fetch(`/api/certificates/verify/${encodeURIComponent(searchId.trim())}`);
      const data = await res.json();
      if (res.ok && data.found) {
        setSearchResult({
          searched: true,
          loading: false,
          found: true,
          certificate: data.certificate,
        });
      } else {
        setSearchResult({
          searched: true,
          loading: false,
          found: false,
        });
      }
    } catch (err) {
      console.error("Lookup failed", err);
      setSearchResult({
        searched: true,
        loading: false,
        found: false,
        error: "An error occurred during verification. Please try again.",
      });
    }
  }

  const accents = ["pink", "cyan", "yellow", "purple", "blue", "green"];
  const getColors = (id: string) => {
    let sum = 0;
    for (let i = 0; i < id.length; i++) {
      sum += id.charCodeAt(i);
    }
    const accent = accents[sum % accents.length];
    
    const colorMap: Record<string, { border: string; text: string; tag: string; glow: string }> = {
      cyan: { border: "#00e5ff", text: "text-[#00e5ff]", tag: "tag-cyan", glow: "rgba(0,229,255,0.15)" },
      yellow: { border: "#fbbc04", text: "text-[#fbbc04]", tag: "tag-yellow", glow: "rgba(251,188,4,0.15)" },
      pink: { border: "#ffafd5", text: "text-[#ffafd5]", tag: "tag-pink", glow: "rgba(255,175,213,0.15)" },
      purple: { border: "#bd5eff", text: "text-[#bd5eff]", tag: "tag-purple", glow: "rgba(189,94,255,0.15)" },
      blue: { border: "#38b6ff", text: "text-[#38b6ff]", tag: "tag-blue", glow: "rgba(56,182,255,0.15)" },
      green: { border: "#79f2a1", text: "text-[#79f2a1]", tag: "tag-green", glow: "rgba(121,242,161,0.15)" },
    };
    return colorMap[accent] || colorMap.pink;
  };

  return (
    <div className="schedule-retro relative min-h-screen">
      <div className="stars-container" />
      <div className="neon-grid" />
      
      <main className="main-shell relative z-10 py-12 max-w-4xl mx-auto px-4">
        {/* Page Title */}
        <section className="hero mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-black tracking-widest text-[#ffafd5]">CERTIFICATE GATEWAY</h1>
          <p className="mt-2 text-arcade-muted">Verify earned credentials and manage your workshop & hackathon certificates.</p>
          <div className="hero-rule mt-6" />
        </section>

        {/* Improved Tab Controls (Matching Admin Tabs UI) */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/50 border border-white/10 p-1 flex justify-start gap-1 overflow-x-auto rounded-lg backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("verify")}
              className={`uppercase tracking-widest text-xs px-6 py-2.5 h-9 font-bold transition-all rounded-md cursor-pointer ${
                activeTab === "verify"
                  ? "bg-[#ffafd5]/20 text-[#ffafd5] border border-[#ffafd5]/40"
                  : "border border-transparent text-arcade-muted hover:text-white"
              }`}
            >
              Verify Credential
            </button>
            <button
              onClick={() => setActiveTab("my-certs")}
              className={`uppercase tracking-widest text-xs px-6 py-2.5 h-9 font-bold transition-all rounded-md cursor-pointer ${
                activeTab === "my-certs"
                  ? "bg-[#ffafd5]/20 text-[#ffafd5] border border-[#ffafd5]/40"
                  : "border border-transparent text-arcade-muted hover:text-white"
              }`}
            >
              My Certificates
            </button>
          </div>
        </div>

        {/* TAB 1: PUBLIC VERIFICATION LOOKUP */}
        {activeTab === "verify" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <Card className="bg-black/45 border-white/10 backdrop-blur-sm p-6 max-w-2xl mx-auto">
              <CardHeader className="p-0 mb-6 text-center">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center justify-center gap-2">
                  <Award className="h-4 w-4 text-[#ffafd5]" />
                  Enter Certificate ID
                </CardTitle>
                <CardDescription className="text-[10px] text-arcade-muted uppercase font-mono mt-2">
                  Format: MC26-XXXX-XXXX (e.g. MC26-WS01-0001)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleSearch} className="flex gap-3">
                  <Input
                    type="text"
                    required
                    placeholder="MC26-WS01-0001"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="bg-black/35 border-white/15 text-white font-mono placeholder:text-zinc-600 focus-visible:ring-[#ffafd5] h-10"
                  />
                  <Button type="submit" className="arcade-btn px-6 font-black tracking-widest h-10 cursor-pointer hover:scale-[1.02] transition-transform">
                    <Search className="h-4 w-4 mr-1.5" />
                    SEARCH
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results UI */}
            {searchResult.loading && (
              <div className="flex justify-center p-8">
                <RefreshCw className="h-8 w-8 text-[#ffafd5] animate-spin" />
              </div>
            )}

            {searchResult.searched && (
              <div className="max-w-2xl mx-auto mt-8 animate-in zoom-in-95 duration-200">
                {searchResult.found && searchResult.certificate ? (
                  (() => {
                    const c = searchResult.certificate;
                    const colors = getColors(c.cert_id);
                    const formattedDate = new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "long",
                    }).format(new Date(c.issued_at));

                    return (
                      <article
                        className="event-card p-8 relative overflow-hidden"
                        style={{
                          border: `2px solid ${colors.border}`,
                          boxShadow: `0 0 25px ${colors.glow}`,
                          background: "rgba(18, 19, 27, 0.94)",
                        }}
                      >
                        {/* Watermark Water Accent */}
                        <div className="absolute -bottom-8 -right-8 opacity-[0.03] pointer-events-none select-none">
                          <Award className="h-56 w-56 text-white" />
                        </div>

                        {/* Security Stamp Badge */}
                        <div className="flex items-center gap-2 text-[#79f2a1] bg-[#79f2a1]/10 border border-[#79f2a1]/30 px-3.5 py-1.5 rounded-md w-fit mb-8 font-mono text-[10px] uppercase font-bold tracking-[0.15em] shadow-[0_0_15px_rgba(121,242,161,0.08)]">
                          <ShieldCheck className="h-4 w-4 text-[#79f2a1]" />
                          Verified Authentic
                        </div>

                        {/* 2-Column Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-arcade-muted/70 font-mono">Recipient Name</span>
                            <p className="text-lg font-bold text-white tracking-wide">{c.participant_name}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-arcade-muted/70 font-mono">Credential ID</span>
                            <p className="text-lg font-bold text-white tracking-wide font-mono">{c.cert_id}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-arcade-muted/70 font-mono">Event / Workshop</span>
                            <p className={`text-lg font-bold ${colors.text} tracking-wide`}>{c.event_name}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-arcade-muted/70 font-mono">Event Type</span>
                            <div className="pt-1">
                              <span className="border border-white/20 text-white bg-white/5 px-3 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest font-bold">
                                {c.event_type}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-arcade-muted/70 font-mono">Date of Issue</span>
                            <p className="text-sm text-white/90">{formattedDate}</p>
                          </div>
                        </div>

                        {/* Centered Button Link */}
                        <div className="mt-8 pt-6 border-t border-white/5">
                          <Button
                            asChild
                            className="arcade-btn w-full font-black tracking-widest py-6 text-sm uppercase gap-2 hover:scale-[1.01] transition-transform shadow-[0_0_20px_rgba(249,77,180,0.25)] cursor-pointer"
                          >
                            <a href={c.cloudinary_url} target="_blank" rel="noopener noreferrer">
                              View Certificate PDF <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </article>
                    );
                  })()
                ) : (
                  <div className="event-card border-red-500/40 bg-black/45 backdrop-blur-sm p-8 text-center flex flex-col items-center">
                    <AlertCircle className="h-12 w-12 text-red-500/80 mb-3 animate-pulse" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Verification Failed</h3>
                    <p className="text-xs text-arcade-muted mt-1 uppercase font-mono">
                      No certificate found matching ID: {searchId}
                    </p>
                    <p className="text-xs text-arcade-muted/80 max-w-sm mt-3 font-sans leading-relaxed">
                      Please verify the spelling, hyphens, and sequence padding of the certificate ID. Real credentials follow the format MC26-XXXX-XXXX.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY CERTIFICATES DASHBOARD */}
        {activeTab === "my-certs" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {status !== "authenticated" ? (
              <div className="event-card bg-black/45 border-white/10 backdrop-blur-sm py-12 px-6 text-center max-w-xl mx-auto flex flex-col items-center">
                <Lock className="h-12 w-12 text-[#ffafd5]/80 mb-3" />
                <h3 className="text-lg font-bold text-white uppercase tracking-widest">Sign in to Access</h3>
                <p className="text-xs text-arcade-muted mt-2 max-w-sm leading-relaxed">
                  Authenticate using your Google Member credentials to view and download all certificates you have earned.
                </p>
                <Button onClick={() => signIn("google")} className="arcade-btn mt-6 font-black tracking-widest hover:scale-[1.02] transition-transform cursor-pointer">
                  SIGN IN WITH GOOGLE
                </Button>
              </div>
            ) : loadingUserCerts ? (
              <div className="flex justify-center p-12">
                <RefreshCw className="h-8 w-8 text-[#ffafd5] animate-spin" />
              </div>
            ) : userCerts.length === 0 ? (
              <div className="event-card bg-black/45 border-white/10 backdrop-blur-sm py-12 px-6 text-center max-w-xl mx-auto flex flex-col items-center">
                <Award className="h-12 w-12 text-[#ffafd5]/50 mb-3" />
                <h3 className="text-lg font-bold text-white uppercase tracking-widest">No Certificates Found</h3>
                <p className="text-xs text-arcade-muted mt-2 max-w-sm leading-relaxed font-mono">
                  EMAIL: {session.user.email}
                </p>
                <p className="text-xs text-arcade-muted/80 mt-3 max-w-xs leading-relaxed font-sans">
                  No verified certificates are registered for your email yet. Please verify you registered with this email.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4 border-l-4 border-[#ffafd5] pl-4">
                  <h2 className="text-lg font-black uppercase tracking-widest text-white">Your Earned Credentials ({userCerts.length})</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {userCerts.map((cert) => {
                    const colors = getColors(cert.cert_id);
                    const formattedDate = new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                    }).format(new Date(cert.issued_at));

                    return (
                      <article
                        key={cert.cert_id}
                        className="event-card transition-all duration-300 hover:-translate-y-1"
                        style={{
                          border: `2px solid ${colors.border}`,
                          boxShadow: `0 0 20px ${colors.glow}`,
                          background: "rgba(18, 19, 27, 0.92)",
                        }}
                      >
                        <div className="event-card__content">
                          <div className="event-card__topline">
                            <span className="border border-white/20 text-white bg-white/5 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-mono tracking-widest font-bold">
                              {cert.event_type}
                            </span>
                            <span className="text-xs text-arcade-muted font-mono">{cert.cert_id}</span>
                          </div>
                          <h3 className={`event-card__title mt-3 font-bold ${colors.text}`}>
                            {cert.event_name}
                          </h3>
                          <p className="mt-3 text-sm text-arcade-muted">
                            Issued on {formattedDate}
                          </p>
                        </div>
                        <div className="event-card__footer mt-6">
                          <Button
                            asChild
                            variant="outline"
                            className="w-full font-black tracking-widest hover:text-white gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
                            style={{ borderColor: colors.border, color: colors.border }}
                          >
                            <a href={cert.cloudinary_url} target="_blank" rel="noopener noreferrer">
                              VIEW CERTIFICATE <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Certificate Registration Instruction Video Guide */}
        <CertificateInstructionVideo />
      </main>
    </div>
  );
}
