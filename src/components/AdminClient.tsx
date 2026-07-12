"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { 
  Edit, 
  Eye, 
  EyeOff, 
  Radio, 
  Square, 
  Trash2, 
  UserPlus, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Calendar, 
  Trophy, 
  Award, 
  Search, 
  FileDown, 
  UserMinus,
  LayoutDashboard,
  Plus,
  BarChart4,
  RefreshCw,
  Clock
} from "lucide-react";
import { AdminEventForm } from "@/components/AdminEventForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatEventWindow, getStatus, formatRoomNameLabel, type SerializedEvent } from "@/lib/events";

type Participant = {
  _id: string;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
  mobileNumber?: string;
  registrationNumber?: string;
  schoolCollegeName?: string;
  institutionType?: string;
  grade?: string;
  year?: string;
  registeredAt?: string;
  meetHistory?: Array<{ joinedAt: string; leftAt?: string }>;
};

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  image: string;
  createdAt: string;
};

const domainColors: Record<string, string> = {
  "AI/ML": "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20",
  "CP": "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20",
  "UI/UX": "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20",
  "CyberSec": "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20",
  "Dev": "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20",
  "Hackathon": "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20",
  "MLSA": "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20",
};

export function AdminClient({
  initialEvents,
  initialAdmins = [],
  totalRegistrations,
  registrationsToday,
  registrationsThisWeek,
  totalUsers,
  totalHackathonRegistrations,
  registrationCounts,
  totalCertificates = 0,
  uniqueCertificateRecipients = 0,
  totalWorkshopCertificates = 0,
  totalHackathonCertificates = 0,
}: {
  initialEvents: SerializedEvent[];
  initialAdmins?: AdminUser[];
  totalRegistrations: number;
  registrationsToday: number;
  registrationsThisWeek: number;
  totalUsers: number;
  totalHackathonRegistrations: number;
  registrationCounts: Record<string, number>;
  totalCertificates?: number;
  uniqueCertificateRecipients?: number;
  totalWorkshopCertificates?: number;
  totalHackathonCertificates?: number;
}) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = React.useState<"overview" | "events" | "analytics" | "form" | "admins">("overview");
  const [events, setEvents] = React.useState(initialEvents);
  const [admins, setAdmins] = React.useState<AdminUser[]>(initialAdmins);
  const [editing, setEditing] = React.useState<SerializedEvent | null>(null);
  
  // Mounted check to prevent hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Deep Analytics Data state
  const [analyticsData, setAnalyticsData] = React.useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = React.useState(false);

  // Participant loading states
  const [participants, setParticipants] = React.useState<Record<string, Participant[]>>({});
  const [loadingParticipants, setLoadingParticipants] = React.useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = React.useState<string | null>(null);
  const [participantSearch, setParticipantSearch] = React.useState<Record<string, string>>({});
  
  // Event filters
  const [eventSearch, setEventSearch] = React.useState("");
  const [domainFilter, setDomainFilter] = React.useState("All");
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [publishFilter, setPublishFilter] = React.useState("All");
  
  // Promote form state
  const [email, setEmail] = React.useState("");
  const [promoting, setPromoting] = React.useState(false);
  
  const { toast } = useToast();

  const fetchAnalytics = React.useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const response = await fetch("/api/admin/analytics");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load analytics");
      setAnalyticsData(data);
    } catch (error) {
      toast({ 
        title: "Could not load analytics", 
        description: error instanceof Error ? error.message : "Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setLoadingAnalytics(false);
    }
  }, [toast]);

  // Fetch analytics data when switching to the analytics tab
  React.useEffect(() => {
    if (activeTab === "analytics" && !analyticsData) {
      fetchAnalytics();
    }
  }, [activeTab, analyticsData, fetchAnalytics]);

  async function refresh() {
    const response = await fetch("/api/events?includeUnpublished=true", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to load events");
    setEvents(data.events);
  }

  async function saveEvent(payload: Record<string, unknown>) {
    try {
      const url = editing ? `/api/events/${editing._id}` : "/api/events";
      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save event");
      setEditing(null);
      await refresh();
      toast({ title: editing ? "Event updated" : "Event created", description: data.event.title });
      setActiveTab("events");
    } catch (error) {
      toast({ title: "Could not save event", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  }

  async function togglePublished(event: SerializedEvent) {
    await savePatch(event._id, { isPublished: !event.isPublished }, event.isPublished ? "Event unpublished" : "Event published");
  }

  async function setManualStatus(event: SerializedEvent, statusOverride: SerializedEvent["statusOverride"]) {
    const title = statusOverride === "auto" ? "Event status returned to auto" : `Event marked ${statusOverride}`;
    await savePatch(event._id, { statusOverride }, title);
  }

  async function savePatch(id: string, payload: Record<string, unknown>, title: string) {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");
      setEvents((current) => current.map((event) => (event._id === id ? data.event : event)));
      toast({ title });
    } catch (error) {
      toast({ title: "Update failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  }

  async function deleteEvent(id: string) {
    if (!window.confirm("Are you sure you want to permanently delete this event? All registration stats will be archived.")) return;
    try {
      const response = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");
      setEvents((current) => current.filter((event) => event._id !== id));
      toast({ title: "Event deleted" });
    } catch (error) {
      toast({ title: "Delete failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  }

  async function loadParticipants(eventId: string) {
    setLoadingParticipants(eventId);
    try {
      const response = await fetch(`/api/registrations/${eventId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load participants");
      setParticipants((current) => ({ ...current, [eventId]: data.registrations }));
    } catch (error) {
      toast({ title: "Could not load participants", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setLoadingParticipants(null);
    }
  }

  const toggleEventExpanded = async (eventId: string) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
      if (!participants[eventId]) {
        await loadParticipants(eventId);
      }
    }
  };

  async function promote(event: React.FormEvent) {
    event.preventDefault();
    setPromoting(true);
    try {
      const response = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Promotion failed");
      
      const newAdmin: AdminUser = {
        _id: data.user.id,
        name: data.user.name || "Administrator",
        email: data.user.email,
        image: data.user.image || "",
        createdAt: new Date().toISOString(),
      };
      setAdmins((current) => {
        const exists = current.some(a => a.email.toLowerCase() === newAdmin.email.toLowerCase());
        if (exists) return current;
        return [...current, newAdmin].sort((a, b) => a.name.localeCompare(b.name));
      });
      setEmail("");
      toast({ title: "Admin promoted", description: data.user.email });
    } catch (error) {
      toast({ title: "Promotion failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setPromoting(false);
    }
  }

  async function demote(adminEmail: string) {
    if (!window.confirm(`Are you sure you want to revoke admin privileges for ${adminEmail}?`)) return;
    try {
      const response = await fetch("/api/admin/demote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Demotion failed");
      toast({ title: "Admin demoted", description: adminEmail });
      setAdmins((current) => current.filter((admin) => admin.email.toLowerCase() !== adminEmail.toLowerCase()));
    } catch (error) {
      toast({ title: "Demotion failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    }
  }

  // Domain breakdown calculation
  const domainRegistrations = React.useMemo(() => {
    const counts: Record<string, number> = {
      "AI/ML": 0,
      "CP": 0,
      "UI/UX": 0,
      "CyberSec": 0,
      "Dev": 0,
      "Hackathon": 0,
      "MLSA": 0,
    };
    events.forEach((event) => {
      const count = registrationCounts[event._id] ?? 0;
      if (event.domain in counts) {
        counts[event.domain] += count;
      }
    });
    return counts;
  }, [events, registrationCounts]);

  const maxDomainCount = Math.max(...Object.values(domainRegistrations), 1);

  // Filtered Events
  const filteredEvents = React.useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(eventSearch.toLowerCase()) || 
                            event.description.toLowerCase().includes(eventSearch.toLowerCase());
      const matchesDomain = domainFilter === "All" || event.domain === domainFilter;
      const matchesType = typeFilter === "All" || event.type === typeFilter;
      const matchesPublish = publishFilter === "All" || 
                             (publishFilter === "Published" && event.isPublished) ||
                             (publishFilter === "Draft" && !event.isPublished);
                             
      const status = getStatus(event.startTime, event.endTime, event.statusOverride);
      const matchesStatus = statusFilter === "All" || 
                            (statusFilter === "Live" && status === "Live") ||
                            (statusFilter === "Upcoming" && status === "Upcoming") ||
                            (statusFilter === "Ended" && status === "Ended");
                            
      return matchesSearch && matchesDomain && matchesType && matchesPublish && matchesStatus;
    });
  }, [events, eventSearch, domainFilter, typeFilter, publishFilter, statusFilter]);

  // Filtered Participants (per event)
  const filteredParticipants = React.useMemo(() => {
    const results: Record<string, Participant[]> = {};
    Object.keys(participants).forEach((eventId) => {
      const list = participants[eventId] || [];
      const search = (participantSearch[eventId] || "").toLowerCase().trim();
      if (!search) {
        results[eventId] = list;
      } else {
        results[eventId] = list.filter((p) => {
          const name = (p.user?.name || "").toLowerCase();
          const email = (p.user?.email || "").toLowerCase();
          const regNo = (p.registrationNumber || "").toLowerCase();
          const college = (p.schoolCollegeName || "").toLowerCase();
          return name.includes(search) || email.includes(search) || regNo.includes(search) || college.includes(search);
        });
      }
    });
    return results;
  }, [participants, participantSearch]);

  // Export to CSV utility
  function exportToCSV(eventTitle: string, participantList: Participant[]) {
    if (!participantList || participantList.length === 0) return;
    
    const headers = [
      "Name",
      "Email",
      "Mobile",
      "Registration Number",
      "Institution Type",
      "School/College Name",
      "Grade/Year",
      "Registration Date (IST)",
      "Attendance Status",
      "Meeting Joins Count"
    ];
    
    const rows = participantList.map((p) => {
      const regDate = p.registeredAt ? new Date(p.registeredAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "";
      const attended = p.meetHistory && p.meetHistory.length > 0 ? "Attended" : "Absent";
      const joinsCount = p.meetHistory ? p.meetHistory.length : 0;
      const gradeOrYear = p.institutionType === "School" ? p.grade : p.year;
      
      return [
        p.user?.name || "Registered member",
        p.user?.email || "",
        p.mobileNumber || "",
        p.registrationNumber || "",
        p.institutionType || "",
        p.schoolCollegeName || "",
        gradeOrYear || "",
        regDate,
        attended,
        joinsCount
      ];
    });
    
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const encodedUri = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const sanitizedTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.setAttribute("download", `registrations_${sanitizedTitle}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Trigger edit mode and redirect tab
  const handleStartEdit = (event: SerializedEvent) => {
    setEditing(event);
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="schedule-retro relative min-h-screen">
      <div className="stars-container" />
      <div className="neon-grid" />

      <main className="main-shell relative z-10 py-10 px-4 md:px-8 max-w-7xl mx-auto font-sans">
        
        {/* Header Hero Section */}
        <section className="hero mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-widest text-[#ffafd5] uppercase flex items-center gap-3 drop-shadow-[0_0_12px_rgba(255,175,213,0.35)]">
              <LayoutDashboard className="h-8 w-8 text-[#ffafd5]" />
              Admin Command Deck
            </h1>
            <p className="text-[10px] tracking-widest text-arcade-muted uppercase mt-1.5 font-bold">
              Central operations center for Microsoft Innovations Club events & registrations.
            </p>
          </div>
          <div>
            <Button 
              onClick={() => { setEditing(null); setActiveTab("form"); }}
              className="bg-[#79f2a1] text-black hover:bg-[#79f2a1]/90 font-black tracking-widest uppercase text-xs gap-2 px-5 h-10 shadow-[0_0_15px_rgba(121,242,161,0.25)] hover:shadow-[0_0_22px_rgba(121,242,161,0.45)] transition-all duration-300"
            >
              <Plus className="h-4 w-4 stroke-[3px]" />
              New Event
            </Button>
          </div>
        </section>

        {/* Dashboard Navigation Tabs */}
        <div className="w-full">
          <div className="bg-black/60 border border-white/10 p-1 mb-8 flex flex-wrap justify-start gap-2 overflow-x-auto w-full md:w-fit rounded-lg shadow-[0_0_20px_rgba(255,175,213,0.02)]">
            <button 
              onClick={() => setActiveTab("overview")} 
              className={`uppercase tracking-widest text-[10px] px-5 py-2.5 h-10 font-bold transition-all rounded-md whitespace-nowrap border ${
                activeTab === "overview" 
                  ? "bg-[#ffafd5]/10 text-[#ffafd5] border-[#ffafd5]/30 shadow-[0_0_12px_rgba(255,175,213,0.18)]" 
                  : "border-transparent text-arcade-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("events")} 
              className={`uppercase tracking-widest text-[10px] px-5 py-2.5 h-10 font-bold transition-all rounded-md whitespace-nowrap border ${
                activeTab === "events" 
                  ? "bg-[#ffafd5]/10 text-[#ffafd5] border-[#ffafd5]/30 shadow-[0_0_12px_rgba(255,175,213,0.18)]" 
                  : "border-transparent text-arcade-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Events Stream ({events.length})
            </button>
            <button 
              onClick={() => setActiveTab("analytics")} 
              className={`uppercase tracking-widest text-[10px] px-5 py-2.5 h-10 font-bold transition-all rounded-md whitespace-nowrap border ${
                activeTab === "analytics" 
                  ? "bg-[#ffafd5]/10 text-[#ffafd5] border-[#ffafd5]/30 shadow-[0_0_12px_rgba(255,175,213,0.18)]" 
                  : "border-transparent text-arcade-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Analytics Console
            </button>
            <button 
              onClick={() => setActiveTab("form")} 
              className={`uppercase tracking-widest text-[10px] px-5 py-2.5 h-10 font-bold transition-all rounded-md whitespace-nowrap border ${
                activeTab === "form" 
                  ? "bg-[#ffafd5]/10 text-[#ffafd5] border-[#ffafd5]/30 shadow-[0_0_12px_rgba(255,175,213,0.18)]" 
                  : "border-transparent text-arcade-muted hover:text-white hover:bg-white/5"
              }`}
            >
              {editing ? `Edit: ${editing.title.slice(0, 15)}...` : "Create Event"}
            </button>
            <button 
              onClick={() => setActiveTab("admins")} 
              className={`uppercase tracking-widest text-[10px] px-5 py-2.5 h-10 font-bold transition-all rounded-md whitespace-nowrap border ${
                activeTab === "admins" 
                  ? "bg-[#ffafd5]/10 text-[#ffafd5] border-[#ffafd5]/30 shadow-[0_0_12px_rgba(255,175,213,0.18)]" 
                  : "border-transparent text-arcade-muted hover:text-white hover:bg-white/5"
              }`}
            >
              Admins Directory ({admins.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW & BASIC STATS */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in-50 duration-300">
              
              {/* Overall Analytics Grid */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="bg-black/60 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:border-sky-500/30 hover:shadow-[0_0_25px_rgba(56,189,248,0.12)] backdrop-blur-md relative overflow-hidden transition-all duration-300 group">
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-15 transition-opacity duration-300">
                    <Users className="h-16 w-16 text-sky-400" />
                  </div>
                  <CardHeader className="p-5 pb-3">
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.18em] text-arcade-muted">Total Active Users</CardDescription>
                    <CardTitle className="text-3xl font-black text-white mt-1 group-hover:text-sky-400 transition-colors duration-300">{totalUsers}</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="bg-black/60 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:border-[#79f2a1]/30 hover:shadow-[0_0_25px_rgba(121,242,161,0.12)] backdrop-blur-md relative overflow-hidden transition-all duration-300 group">
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-15 transition-opacity duration-300">
                    <Calendar className="h-16 w-16 text-[#79f2a1]" />
                  </div>
                  <CardHeader className="p-5 pb-3">
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.18em] text-arcade-muted">Total Registrations</CardDescription>
                    <CardTitle className="text-3xl font-black text-[#79f2a1] mt-1">{totalRegistrations}</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="bg-black/60 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:border-yellow-400/30 hover:shadow-[0_0_25px_rgba(250,204,21,0.12)] backdrop-blur-md relative overflow-hidden transition-all duration-300 group">
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-15 transition-opacity duration-300">
                    <Calendar className="h-16 w-16 text-yellow-400" />
                  </div>
                  <CardHeader className="p-5 pb-3">
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.18em] text-arcade-muted">Registrations (Today)</CardDescription>
                    <CardTitle className="text-3xl font-black text-yellow-400 mt-1">{registrationsToday}</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="bg-black/60 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:border-amber-400/30 hover:shadow-[0_0_25px_rgba(245,158,11,0.12)] backdrop-blur-md relative overflow-hidden transition-all duration-300 group">
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-15 transition-opacity duration-300">
                    <Trophy className="h-16 w-16 text-amber-500" />
                  </div>
                  <CardHeader className="p-5 pb-3">
                    <CardDescription className="text-[10px] uppercase font-bold tracking-[0.18em] text-arcade-muted">Hackathon Signups</CardDescription>
                    <CardTitle className="text-3xl font-black text-amber-400 mt-1">{totalHackathonRegistrations}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Certificate Stats Sub-section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#ffafd5] pl-2.5 border-l-2 border-[#ffafd5]">
                  Certificate Logistics
                </h3>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                  <Card className="bg-black/60 border border-white/10 backdrop-blur-md hover:border-[#ffafd5]/20 hover:shadow-[0_0_15px_rgba(255,175,213,0.05)] transition-all duration-300">
                    <CardHeader className="p-5 pb-3">
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-arcade-muted">Certificates Issued</CardDescription>
                      <CardTitle className="text-2xl font-black text-white mt-1">{totalCertificates}</CardTitle>
                    </CardHeader>
                  </Card>
                  
                  <Card className="bg-black/60 border border-white/10 backdrop-blur-md hover:border-[#79f2a1]/20 hover:shadow-[0_0_15px_rgba(121,242,161,0.05)] transition-all duration-300">
                    <CardHeader className="p-5 pb-3">
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-arcade-muted">Unique Recipients</CardDescription>
                      <CardTitle className="text-2xl font-black text-[#79f2a1] mt-1">{uniqueCertificateRecipients}</CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="bg-black/60 border border-white/10 backdrop-blur-md hover:border-cyan-400/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.05)] transition-all duration-300">
                    <CardHeader className="p-5 pb-3">
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-arcade-muted">Workshop Certificates</CardDescription>
                      <CardTitle className="text-2xl font-black text-cyan-400 mt-1">{totalWorkshopCertificates}</CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="bg-black/60 border border-white/10 backdrop-blur-md hover:border-yellow-400/20 hover:shadow-[0_0_15px_rgba(250,204,21,0.05)] transition-all duration-300">
                    <CardHeader className="p-5 pb-3">
                      <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-arcade-muted">Hackathon Credentials</CardDescription>
                      <CardTitle className="text-2xl font-black text-yellow-400 mt-1">{totalHackathonCertificates}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </div>

              {/* Domain breakdown chart */}
              <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                <Card className="bg-black/60 border border-white/10 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3">Domain Participation Distribution</CardTitle>
                    <CardDescription className="text-xs text-arcade-muted mt-1.5 font-semibold">Total registrations counted aggregate across domain categories.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 space-y-5 font-mono">
                    {Object.entries(domainRegistrations).map(([domain, count]) => {
                      const percentage = Math.round((count / maxDomainCount) * 100);
                      const colorClass = domainColors[domain] || "text-white";
                      return (
                        <div key={domain} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className={`${colorClass} tracking-widest uppercase`}>{domain}</span>
                            <span className="text-white font-mono">{count} signups</span>
                          </div>
                          <div className="h-3.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative shadow-[inner_0_1px_3px_rgba(0,0,0,0.4)]">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ease-out ${
                                domain === "AI/ML" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                domain === "CP" ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" :
                                domain === "UI/UX" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
                                domain === "CyberSec" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                                domain === "Dev" ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" :
                                domain === "Hackathon" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Info Deck */}
                <Card className="bg-black/60 border border-white/10 backdrop-blur-md p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#ffafd5] border-b border-white/5 pb-3">Operational Status</h4>
                    <p className="text-xs text-arcade-muted leading-relaxed font-semibold">
                      All event data is synchronized in real-time. Make sure to double-check meeting links before force-opening meets, as students receive push cues on their dashboard directly.
                    </p>
                    <div className="rounded-lg border border-[#79f2a1]/25 bg-[#79f2a1]/5 p-4 text-xs text-[#79f2a1] font-mono leading-6 shadow-[0_0_15px_rgba(121,242,161,0.03)]">
                      <strong>MEET HOST:</strong> {process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.microsoftinnovations.club"}
                      <br />
                      <strong>DATABASE:</strong> CONNECTED
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 mt-6 flex justify-between items-center text-[10px] text-arcade-muted font-mono uppercase font-bold">
                    <span>STATUS SECURE</span>
                    <span>{mounted ? `${new Date().toLocaleTimeString()} IST` : "Loading..."}</span>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: EVENTS STREAM */}
          {activeTab === "events" && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              
              {/* Filters Panel */}
              <Card className="bg-black/60 border border-white/10 backdrop-blur-md p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
                  <div className="grid gap-2">
                    <span className="text-[10px] uppercase font-black text-arcade-muted tracking-widest">Search Stream</span>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-arcade-muted" />
                      <Input
                        placeholder="Search event title..."
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        className="pl-10 bg-black/40 border-white/10 focus-visible:ring-[#ffafd5] text-xs h-9 rounded-md placeholder:text-arcade-muted/70"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <span className="text-[10px] uppercase font-black text-arcade-muted tracking-widest">Domain</span>
                    <select
                      value={domainFilter}
                      onChange={(e) => setDomainFilter(e.target.value)}
                      className="h-9 rounded-md border border-white/10 bg-black/50 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#ffafd5] text-white font-bold cursor-pointer"
                    >
                      <option value="All" className="bg-[#12131b]">All Domains</option>
                      <option value="AI/ML" className="bg-[#12131b]">AI/ML</option>
                      <option value="CP" className="bg-[#12131b]">Competitive Programming</option>
                      <option value="UI/UX" className="bg-[#12131b]">UI/UX</option>
                      <option value="CyberSec" className="bg-[#12131b]">Cybersecurity</option>
                      <option value="Dev" className="bg-[#12131b]">Development</option>
                      <option value="Hackathon" className="bg-[#12131b]">Hackathon</option>
                      <option value="MLSA" className="bg-[#12131b]">MLSA</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <span className="text-[10px] uppercase font-black text-arcade-muted tracking-widest">Type</span>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="h-9 rounded-md border border-white/10 bg-black/50 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#ffafd5] text-white font-bold cursor-pointer"
                    >
                      <option value="All" className="bg-[#12131b]">All Types</option>
                      <option value="session" className="bg-[#12131b]">Workshops</option>
                      <option value="hackathon" className="bg-[#12131b]">Hackathons</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <span className="text-[10px] uppercase font-black text-arcade-muted tracking-widest">Visibility</span>
                    <select
                      value={publishFilter}
                      onChange={(e) => setPublishFilter(e.target.value)}
                      className="h-9 rounded-md border border-white/10 bg-black/50 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#ffafd5] text-white font-bold cursor-pointer"
                    >
                      <option value="All" className="bg-[#12131b]">All Visibility</option>
                      <option value="Published" className="bg-[#12131b]">Published</option>
                      <option value="Draft" className="bg-[#12131b]">Draft</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <span className="text-[10px] uppercase font-black text-arcade-muted tracking-widest">Live Status</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-9 rounded-md border border-white/10 bg-black/50 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#ffafd5] text-white font-bold cursor-pointer"
                    >
                      <option value="All" className="bg-[#12131b]">All States</option>
                      <option value="Live" className="bg-[#12131b]">Live Now</option>
                      <option value="Upcoming" className="bg-[#12131b]">Upcoming</option>
                      <option value="Ended" className="bg-[#12131b]">Completed</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Events List */}
              <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/10 bg-black/20 rounded-lg">
                    <p className="text-arcade-muted text-sm font-medium">No events found matching your filters.</p>
                  </div>
                ) : (
                  filteredEvents.map((event) => {
                    const { date, time } = formatEventWindow(event.startTime, event.endTime);
                    const isExpanded = expandedEvent === event._id;
                    const eventRegistrations = registrationCounts[event._id] ?? 0;
                    const currentStatus = getStatus(event.startTime, event.endTime, event.statusOverride);
                    const participantList = filteredParticipants[event._id] || [];

                    return (
                      <Card 
                        key={event._id}
                        className={`bg-black/60 border border-white/10 backdrop-blur-md overflow-hidden transition-all duration-300 border-l-4 ${
                          event.isLive ? "border-l-[#79f2a1] border-[#79f2a1]/40 shadow-[0_0_20px_rgba(121,242,161,0.08)]" : 
                          currentStatus === "Upcoming" ? "border-l-yellow-500" : "border-l-zinc-600"
                        } ${isExpanded ? "shadow-[0_0_30px_rgba(255,175,213,0.04)] border-white/20" : ""}`}
                      >
                        <div className="p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                          
                          {/* Info Column */}
                          <div className="space-y-2.5 max-w-2xl">
                            <div className="flex flex-wrap gap-2 items-center">
                              <Badge 
                                className={`text-[9px] tracking-widest uppercase font-black h-5 border ${
                                  domainColors[event.domain] || "bg-white/5 border-white/10 text-white"
                                }`}
                              >
                                {event.domain}
                              </Badge>
                              <Badge 
                                variant={event.isPublished ? "default" : "secondary"} 
                                className={`text-[9px] tracking-widest uppercase font-black h-5 ${
                                  event.isPublished ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                }`}
                              >
                                {event.isPublished ? "Published" : "Draft"}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-[9px] tracking-widest uppercase font-black h-5 ${
                                  currentStatus === "Live" ? "border-red-500/35 bg-red-500/10 text-red-400 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.1)]" : 
                                  currentStatus === "Upcoming" ? "border-yellow-500/35 bg-yellow-500/10 text-yellow-400" :
                                  "border-zinc-500/35 bg-zinc-500/10 text-zinc-400"
                                }`}
                              >
                                {currentStatus}
                              </Badge>
                              <Badge variant="outline" className="text-[9px] tracking-widest uppercase font-black h-5 border-white/10 text-white">
                                {eventRegistrations} registrations
                              </Badge>
                              {event.statusOverride !== "auto" && (
                                <Badge className="text-[9px] tracking-widest uppercase font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 h-5">
                                  Force {event.statusOverride}
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-black text-white tracking-wide">{event.title}</h3>
                            <p className="text-xs text-arcade-muted font-mono leading-5 font-bold uppercase tracking-wider">
                              {date} · {time} · <span className="underline text-white/80">{formatRoomNameLabel(event.roomName)}</span>
                            </p>
                          </div>

                          {/* Actions Column */}
                          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleStartEdit(event)}
                              className="border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-wider h-8.5 px-3.5 gap-1.5"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => togglePublished(event)}
                              className="border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-wider h-8.5 px-3.5 gap-1.5"
                            >
                              {event.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              {event.isPublished ? "Unpublish" : "Publish"}
                            </Button>

                            <Button 
                              variant={event.isLive ? "default" : "outline"} 
                              size="sm" 
                              onClick={() => savePatch(event._id, { isLive: !event.isLive }, event.isLive ? "Meeting closed" : "Meeting opened")}
                              className={`text-[10px] font-black uppercase tracking-wider h-8.5 px-3.5 gap-1.5 transition-all ${
                                event.isLive 
                                  ? "bg-[#79f2a1] hover:bg-[#79f2a1]/90 text-black shadow-[0_0_15px_rgba(121,242,161,0.25)]" 
                                  : "border-white/10 hover:bg-white/5"
                              }`}
                            >
                              <Radio className={`h-3.5 w-3.5 ${event.isLive ? "animate-pulse" : ""}`} />
                              {event.isLive ? "Meet ON" : "Open Meet"}
                            </Button>

                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setManualStatus(event, event.statusOverride === "ended" ? "auto" : "ended")}
                              className="border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-wider h-8.5 px-3.5 gap-1.5"
                            >
                              <Square className="h-3.5 w-3.5" />
                              {event.statusOverride === "ended" ? "Auto" : "End"}
                            </Button>

                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => deleteEvent(event._id)}
                              className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-wider h-8.5 px-3.5 gap-1.5"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </div>

                        {/* Collapsible Action to load/view registrations */}
                        <div className="border-t border-white/5 bg-black/15">
                          <button
                            onClick={() => toggleEventExpanded(event._id)}
                            className="w-full flex items-center justify-between px-5 py-3 text-xs text-arcade-muted hover:text-white transition-colors"
                          >
                            <span className="font-bold uppercase tracking-[0.15em] text-[10px]">
                              {isExpanded ? "Collapse Registrations Console" : "Expand Registrations Console"}
                            </span>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>

                          {/* Expanded list view */}
                          {isExpanded && (
                            <div className="p-5 border-t border-white/5 bg-black/30 space-y-4 animate-in slide-in-from-top-2 duration-300">
                              {loadingParticipants === event._id ? (
                                <div className="space-y-3">
                                  <Skeleton className="h-10 w-full bg-white/5" />
                                  <Skeleton className="h-24 w-full bg-white/5" />
                                </div>
                              ) : (
                                <>
                                  {/* Inner Control Panel */}
                                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                                    <div className="relative w-full sm:max-w-xs">
                                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-arcade-muted" />
                                      <Input
                                        placeholder="Search registrations..."
                                        value={participantSearch[event._id] || ""}
                                        onChange={(e) => setParticipantSearch({ ...participantSearch, [event._id]: e.target.value })}
                                        className="pl-9 bg-black/45 border-white/10 text-xs h-9 placeholder:text-arcade-muted/70 rounded"
                                      />
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                      {participants[event._id] && (
                                        <div className="flex items-center gap-2 text-xs font-mono text-[#79f2a1] font-bold">
                                          <span className="h-2 w-2 rounded-full bg-[#79f2a1] animate-pulse" />
                                          {participants[event._id].filter(p => p.meetHistory?.some(h => !h.leftAt)).length} IN MEET
                                        </div>
                                      )}
                                      <Button 
                                        onClick={() => exportToCSV(event.title, participantList)}
                                        disabled={participantList.length === 0}
                                        variant="outline"
                                        className="border-[#79f2a1]/25 bg-[#79f2a1]/5 hover:bg-[#79f2a1]/10 text-[#79f2a1] hover:text-[#79f2a1] text-[10px] font-black uppercase tracking-wider h-9 gap-1.5 px-4"
                                      >
                                        <FileDown className="h-3.5 w-3.5 stroke-[2.5px]" />
                                        Export CSV
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Participant Table */}
                                  <div className="rounded-lg border border-white/5 overflow-hidden shadow-lg">
                                    <div className="bg-black/55 p-3.5 px-4 flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-arcade-muted border-b border-white/5 font-mono">
                                      <span>{participantList.length} Signups Filtered</span>
                                      <span className="text-[#79f2a1]">
                                        {participantList.filter(p => p.meetHistory && p.meetHistory.length > 0).length} Attended
                                      </span>
                                    </div>

                                    {participantList.length === 0 ? (
                                      <p className="p-6 text-center text-xs text-arcade-muted bg-black/10">No students registered yet.</p>
                                    ) : (
                                      <div className="overflow-x-auto w-full">
                                        <table className="w-full text-left border-collapse text-xs">
                                          <thead>
                                            <tr className="bg-black/45 border-b border-white/5 text-[9px] text-arcade-muted uppercase font-bold tracking-widest font-mono">
                                              <th className="p-3 pl-4">Student</th>
                                              <th className="p-3">Credentials</th>
                                              <th className="p-3">Institute / Cohort</th>
                                              <th className="p-3">Signup Date (IST)</th>
                                              <th className="p-3 pr-4 text-right">Attendance</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {participantList.map((p) => {
                                              const regDate = p.registeredAt 
                                                ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(p.registeredAt))
                                                : "N/A";
                                              const hasAttended = p.meetHistory && p.meetHistory.length > 0;
                                              const gradeOrYear = p.institutionType === "School" ? `Grade ${p.grade}` : `Year ${p.year}`;
                                              
                                              return (
                                                <tr key={p._id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 hover:shadow-[inset_0_0_10px_rgba(255,175,213,0.01)] transition-colors">
                                                  <td className="p-3 pl-4">
                                                    <div className="font-semibold text-white">{p.user?.name || "Registered Member"}</div>
                                                    <div className="text-[10px] text-arcade-muted font-mono mt-0.5">{p.user?.email}</div>
                                                  </td>
                                                  <td className="p-3 font-mono">
                                                    <div className="text-white font-bold">{p.registrationNumber || "—"}</div>
                                                    <div className="text-[10px] text-arcade-muted mt-0.5">{p.mobileNumber || "—"}</div>
                                                  </td>
                                                  <td className="p-3">
                                                    <div className="text-white max-w-[200px] truncate font-medium">{p.schoolCollegeName || "—"}</div>
                                                    <div className="text-[10px] text-arcade-muted mt-0.5">{p.institutionType ? `${p.institutionType} · ${gradeOrYear}` : "—"}</div>
                                                  </td>
                                                  <td className="p-3 text-arcade-muted font-mono">{regDate}</td>
                                                  <td className="p-3 pr-4 text-right">
                                                    {hasAttended ? (
                                                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                                                        Attended
                                                      </span>
                                                    ) : (
                                                      <span className="inline-flex items-center rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                                        Absent
                                                      </span>
                                                    )}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEEP ANALYTICS CONSOLE */}
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-in fade-in-50 duration-300">
              
              {/* Analytics Header Control */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-widest text-[#ffafd5] flex items-center gap-2.5 drop-shadow-[0_0_8px_rgba(255,175,213,0.25)]">
                    <BarChart4 className="h-5 w-5 text-[#ffafd5]" />
                    Deep Analytics Report
                  </h2>
                  <p className="text-[10px] text-arcade-muted uppercase font-bold tracking-wider mt-1">Extended diagnostics on participants growth, conversion metrics and platform engagement.</p>
                </div>
                <Button 
                  onClick={fetchAnalytics}
                  disabled={loadingAnalytics}
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest h-9 gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingAnalytics ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {loadingAnalytics || !analyticsData ? (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[280px] w-full bg-white/5 rounded-lg" />
                    <Skeleton className="h-[280px] w-full bg-white/5 rounded-lg" />
                  </div>
                  <Skeleton className="h-[350px] w-full bg-white/5 rounded-lg" />
                </div>
              ) : (
                <>
                  {/* First Section Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    
                    {/* 1. Daily Signup Velocity Card */}
                    <Card className="bg-black/60 border border-white/10 backdrop-blur-md p-5 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                      <CardHeader className="p-0 mb-5 border-b border-white/5 pb-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#ffafd5]" />
                          Daily Signup Velocity (Past 7 Days)
                        </CardTitle>
                        <CardDescription className="text-[10px] text-arcade-muted font-mono uppercase font-bold mt-1">
                          Recent timeline velocity of incoming registrations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 pt-1 space-y-4">
                        <div className="flex flex-col gap-3.5 font-mono">
                          {analyticsData.dailyRegistrationVelocity.map((day: any) => {
                            const maxVal = Math.max(...analyticsData.dailyRegistrationVelocity.map((d: any) => d.count), 1);
                            const valPercentage = Math.round((day.count / maxVal) * 100);
                            return (
                              <div key={day.date} className="flex items-center justify-between text-xs gap-3 font-semibold">
                                <span className="w-16 text-arcade-muted font-bold">{day.date}</span>
                                <div className="flex-1 h-6 bg-white/5 rounded border border-white/5 overflow-hidden relative flex items-center pl-2.5 shadow-[inner_0_1px_2px_rgba(0,0,0,0.5)]">
                                  {day.count > 0 && (
                                    <div 
                                      className="h-full bg-gradient-to-r from-[#ffafd5] to-[#f94db4] opacity-80 border-r border-[#ffafd5]/40 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(249,77,180,0.4)]"
                                      style={{ width: `${valPercentage}%` }}
                                    />
                                  )}
                                  <span className="absolute left-2.5 text-[9px] text-white font-black uppercase tracking-widest">{day.count} signups</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 2. Top Institution Share Card */}
                    <Card className="bg-black/60 border border-white/10 backdrop-blur-md p-5 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                      <CardHeader className="p-0 mb-5 border-b border-white/5 pb-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#79f2a1]" />
                          Audience Share by Institution (Top 10)
                        </CardTitle>
                        <CardDescription className="text-[10px] text-arcade-muted font-mono uppercase font-bold mt-1">
                          Leading school & college networks participating
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 pt-1 space-y-4 font-mono">
                        {analyticsData.institutionStats.length === 0 ? (
                          <p className="text-xs text-arcade-muted p-4 text-center">No institution statistics captured.</p>
                        ) : (
                          analyticsData.institutionStats.map((item: any) => {
                            const maxInstCount = Math.max(...analyticsData.institutionStats.map((i: any) => i.count), 1);
                            const instSharePercentage = Math.round((item.count / maxInstCount) * 100);
                            const totalSharePct = totalRegistrations > 0 ? Math.round((item.count / totalRegistrations) * 100) : 0;
                            return (
                              <div key={item.name} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold gap-2">
                                  <span className="text-white truncate max-w-[270px]" title={item.name}>{item.name}</span>
                                  <span className="text-arcade-muted text-[10px] whitespace-nowrap">{item.count} signups ({totalSharePct}%)</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-[inner_0_1px_2px_rgba(0,0,0,0.5)]">
                                  <div 
                                    className="h-full bg-gradient-to-r from-[#79f2a1] to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(121,242,161,0.4)]"
                                    style={{ width: `${instSharePercentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </CardContent>
                    </Card>

                  </div>

                  {/* Second Section: Event Performance Table */}
                  <Card className="bg-black/60 border border-white/10 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                    <CardHeader className="p-5 border-b border-white/5">
                      <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Event Performance & Engagement Statistics</CardTitle>
                      <CardDescription className="text-xs text-arcade-muted font-semibold mt-1">Calculates exact attendee conversion ratios and average minutes spent in meets.</CardDescription>
                    </CardHeader>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse text-xs font-sans">
                        <thead>
                          <tr className="bg-black/45 border-b border-white/5 text-[9px] text-arcade-muted uppercase font-bold tracking-widest font-mono">
                            <th className="p-3.5 pl-5">Event Session</th>
                            <th className="p-3.5">Track / Domain</th>
                            <th className="p-3.5">Registrations</th>
                            <th className="p-3.5">Attended</th>
                            <th className="p-3.5">Conversion Rate</th>
                            <th className="p-3.5">Avg Room Duration</th>
                            <th className="p-3.5 pr-5 text-right">Certs Issued</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.eventMetrics.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-6 text-center text-xs text-arcade-muted">No event analytics available.</td>
                            </tr>
                          ) : (
                            analyticsData.eventMetrics.map((metric: any) => {
                              return (
                                <tr key={metric.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 hover:shadow-[inset_0_0_10px_rgba(255,175,213,0.01)] transition-colors">
                                  <td className="p-3.5 pl-5 font-bold text-white max-w-[200px] truncate" title={metric.title}>
                                    {metric.title}
                                  </td>
                                  <td className="p-3.5">
                                    <Badge 
                                      className={`text-[9px] tracking-widest uppercase font-black border ${
                                        domainColors[metric.domain] || "bg-white/5 border-white/10 text-white"
                                      }`}
                                    >
                                      {metric.domain}
                                    </Badge>
                                  </td>
                                  <td className="p-3.5 font-mono text-white">{metric.totalRegistrations}</td>
                                  <td className="p-3.5 font-mono text-white">{metric.attendedCount}</td>
                                  <td className="p-3.5">
                                    <div className="flex items-center gap-2 font-mono">
                                      <span className={metric.conversionRate >= 50 ? "text-[#79f2a1] font-black" : "text-white font-bold"}>
                                        {metric.conversionRate}%
                                      </span>
                                      <div className="w-14 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-[inner_0_1px_2px_rgba(0,0,0,0.5)]">
                                        <div 
                                          className={`h-full rounded-full ${
                                            metric.conversionRate >= 50 ? "bg-[#79f2a1]" : 
                                            metric.conversionRate >= 20 ? "bg-yellow-400" : "bg-zinc-600"
                                          }`}
                                          style={{ width: `${metric.conversionRate}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3.5 font-mono text-white font-semibold">
                                    {metric.avgDurationMin > 0 ? `${metric.avgDurationMin} mins` : "—"}
                                  </td>
                                  <td className="p-3.5 pr-5 text-right font-mono text-[#ffafd5] font-black text-sm">
                                    {metric.certificatesIssued}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Workshop Attendance Leaderboard */}
                  <Card className="bg-black/60 border border-white/10 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)] font-sans">
                    <CardHeader className="p-5 border-b border-white/5 flex flex-row justify-between items-center gap-3">
                      <div>
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-[#ffafd5] flex items-center gap-2.5 drop-shadow-[0_0_6px_rgba(255,175,213,0.2)]">
                          <Trophy className="h-4.5 w-4.5 text-[#ffafd5]" />
                          Workshop Super-Attendees Leaderboard
                        </CardTitle>
                        <CardDescription className="text-xs text-arcade-muted font-semibold mt-1">Students ranked by total workshop sessions attended (out of {analyticsData.totalWorkshops} total workshops).</CardDescription>
                      </div>
                    </CardHeader>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-black/45 border-b border-white/5 text-[9px] text-arcade-muted uppercase font-bold tracking-widest font-mono">
                            <th className="p-3.5 pl-5 w-16">Rank</th>
                            <th className="p-3.5">Student</th>
                            <th className="p-3.5">Email</th>
                            <th className="p-3.5">Institution</th>
                            <th className="p-3.5 pr-5 text-right font-mono">Sessions Attended</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.superParticipants.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-xs text-arcade-muted">No attendance logs found yet.</td>
                            </tr>
                          ) : (
                            analyticsData.superParticipants.map((participant: any, index: number) => {
                              const pct = Math.round((participant.attendedCount / analyticsData.totalWorkshops) * 100);
                              return (
                                <tr key={participant.email} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 hover:shadow-[inset_0_0_10px_rgba(255,175,213,0.01)] transition-colors">
                                  <td className="p-3.5 pl-5 font-mono font-bold text-white text-sm">
                                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                                  </td>
                                  <td className="p-3.5 font-bold text-white">
                                    {participant.name}
                                  </td>
                                  <td className="p-3.5 font-mono text-arcade-muted text-[10px]">
                                    {participant.email}
                                  </td>
                                  <td className="p-3.5 text-white max-w-[250px] truncate" title={participant.college}>
                                    {participant.college}
                                  </td>
                                  <td className="p-3.5 pr-5 text-right font-mono">
                                    <Badge className="bg-[#ffafd5]/10 border border-[#ffafd5]/20 text-[#ffafd5] text-[10px] font-black h-6 px-2.5">
                                      {participant.attendedCount} / {analyticsData.totalWorkshops} sessions ({pct}%)
                                    </Badge>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Third Section: Credentials conversion logistics */}
                  <Card className="bg-black/60 border border-white/10 backdrop-blur-md p-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Award className="h-32 w-32 text-[#ffafd5]" />
                    </div>
                    <CardHeader className="p-0 mb-6 border-b border-white/5 pb-4">
                      <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Credentials Acquisition Summary</CardTitle>
                      <CardDescription className="text-xs text-arcade-muted font-semibold mt-1">Audit logs on certification conversions across tracks.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 grid gap-6 md:grid-cols-3 font-mono">
                      <div className="space-y-2">
                        <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-arcade-muted">Total Certificates Issued</div>
                        <div className="text-3xl font-black text-white mt-1">{analyticsData.credentialsSummary.totalCertificates}</div>
                        <p className="text-[10px] text-arcade-muted font-sans leading-relaxed font-semibold mt-1">
                          Unique individual recipients: <strong className="text-white">{analyticsData.credentialsSummary.uniqueRecipients}</strong> students.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-arcade-muted">Overall Conversion Rate</div>
                        <div className="text-3xl font-black text-[#ffafd5] mt-1">{analyticsData.credentialsSummary.overallConversionRate}%</div>
                        <p className="text-[10px] text-arcade-muted font-sans leading-relaxed font-semibold mt-1">
                          Ratio of certificates issued relative to total registrations.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-arcade-muted">Credential Tracks Ratio</div>
                        <div className="flex gap-5 text-xs font-bold pt-1.5">
                          <div>
                            <span className="text-cyan-400 tracking-wider text-[10px]">WORKSHOPS</span>
                            <div className="text-xl font-black text-white mt-0.5">{analyticsData.credentialsSummary.totalWorkshopCertificates}</div>
                          </div>
                          <div className="border-l border-white/10 pl-5">
                            <span className="text-amber-500 tracking-wider text-[10px]">HACKATHONS</span>
                            <div className="text-xl font-black text-white mt-0.5">{analyticsData.credentialsSummary.totalHackathonCertificates}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

            </div>
          )}

          {/* TAB 4: CREATE / EDIT EVENT */}
          {activeTab === "form" && (
            <div className="animate-in fade-in-50 duration-300">
              <Card className="bg-black/60 border border-white/10 backdrop-blur-md max-w-3xl mx-auto border-l-4 border-l-[#ffafd5] shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-lg font-black uppercase tracking-widest text-[#ffafd5]">
                    {editing ? `Edit Session: ${editing.title}` : "Publish New Event"}
                  </CardTitle>
                  <CardDescription className="text-xs text-arcade-muted font-semibold mt-1">
                    Broadcast workshops and hackathons onto the members schedule. Ensure Zulu start times are matched correctly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <AdminEventForm 
                    key={editing?._id ?? "new-event"} 
                    event={editing} 
                    onSubmit={saveEvent} 
                    onCancel={editing ? () => { setEditing(null); setActiveTab("events"); } : undefined} 
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 5: ADMINS DIRECTORY */}
          {activeTab === "admins" && (
            <div className="grid gap-6 md:grid-cols-[1fr_2fr] items-start animate-in fade-in-50 duration-300">
              
              {/* Promote Form */}
              <Card className="bg-black/60 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                <CardHeader>
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-[#ffafd5]">Promote Admin</CardTitle>
                  <CardDescription className="text-xs text-arcade-muted font-semibold">Elevate a Google-authenticated user to dashboard operations.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={promote} className="space-y-4 font-mono">
                    <div className="space-y-1.5">
                      <Input 
                        type="email" 
                        required 
                        placeholder="admin-email@example.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="bg-black/45 border-white/10 focus-visible:ring-[#ffafd5] text-xs h-9"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={promoting}
                      className="w-full bg-[#ffafd5] hover:bg-[#ffafd5]/90 text-black font-black uppercase tracking-widest text-xs h-9.5 shadow-[0_0_12px_rgba(255,175,213,0.15)] hover:shadow-[0_0_20px_rgba(255,175,213,0.3)] transition-all duration-300"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {promoting ? "Promoting..." : "Promote Admin"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Admins List Table */}
              <Card className="bg-black/60 border border-white/10 backdrop-blur-md overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.3)]">
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Active Administrators</CardTitle>
                  <CardDescription className="text-xs text-arcade-muted font-semibold">Users possessing absolute control privileges over event scheduling.</CardDescription>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="bg-black/45 border-b border-white/5 text-[9px] text-arcade-muted uppercase font-bold tracking-widest font-mono">
                        <th className="p-3 pl-5">Administrator</th>
                        <th className="p-3">Joined Date</th>
                        <th className="p-3 pr-5 text-right">Revoke Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => {
                        const joinedDate = admin.createdAt 
                          ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(admin.createdAt))
                          : "N/A";
                        const isSelf = session?.user?.email?.toLowerCase().trim() === admin.email.toLowerCase().trim();
                        
                        return (
                          <tr key={admin._id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 hover:shadow-[inset_0_0_10px_rgba(255,175,213,0.01)] transition-colors">
                            <td className="p-3 pl-5 flex items-center gap-3">
                              {admin.image ? (
                                <img 
                                  src={admin.image} 
                                  alt={admin.name} 
                                  className="h-8 w-8 rounded-full border border-white/10 bg-white/5"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${admin.name}`;
                                  }}
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full border border-white/10 bg-[#ffafd5]/10 flex items-center justify-center text-[10px] font-black text-[#ffafd5]">
                                  {admin.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-white flex items-center gap-1.5">
                                  {admin.name}
                                  {isSelf && (
                                    <Badge className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 text-[8px] font-black tracking-widest px-1.5 py-0">
                                      YOU
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-[10px] text-arcade-muted font-mono mt-0.5">{admin.email}</div>
                              </div>
                            </td>
                            <td className="p-3 text-arcade-muted font-mono">{joinedDate}</td>
                            <td className="p-3 pr-5 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isSelf}
                                onClick={() => demote(admin.email)}
                                title={isSelf ? "You cannot demote yourself to prevent dashboard lockouts" : "Revoke Admin privileges"}
                                className="border-red-500/25 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-400 disabled:opacity-40 text-[9px] font-black uppercase tracking-wider h-8"
                              >
                                <UserMinus className="h-3.5 w-3.5 mr-1" />
                                Demote
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
