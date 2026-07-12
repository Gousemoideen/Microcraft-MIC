"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { DOMAINS, EVENT_TYPES, type SerializedEvent } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EventFormState = {
  title: string;
  description: string;
  domain: string;
  type: string;
  startTime: string;
  endTime: string;
  roomName: string;
  posterUrl: string;
  statusOverride: "auto" | "live" | "ended";
  isPublished: boolean;
};

function getInitialForm(event?: SerializedEvent | null): EventFormState {
  if (event) {
    return {
      title: event.title,
      description: event.description,
      domain: event.domain,
      type: event.type,
      startTime: toISTDatetimeLocal(event.startTime),
      endTime: toISTDatetimeLocal(event.endTime),
      roomName: event.roomName,
      posterUrl: event.posterUrl ?? "",
      statusOverride: event.statusOverride,
      isPublished: event.isPublished,
    };
  }

  return {
    title: "",
    description: "",
    domain: "AI/ML",
    type: "session",
    startTime: "",
    endTime: "",
    roomName: "",
    posterUrl: "",
    statusOverride: "auto",
    isPublished: false,
  };
}

const emptyForm: EventFormState = {
  title: "",
  description: "",
  domain: "AI/ML",
  type: "session",
  startTime: "",
  endTime: "",
  roomName: "",
  posterUrl: "",
  statusOverride: "auto",
  isPublished: false,
};

function toISTDatetimeLocal(value: string) {
  const date = new Date(value);
  // IST is UTC + 5.5 hours (+330 minutes)
  const istTime = new Date(date.getTime() + 330 * 60_000);
  return istTime.toISOString().slice(0, 16);
}

export function AdminEventForm({
  event,
  onSubmit,
  onCancel,
}: {
  event?: SerializedEvent | null;
  onSubmit: (payload: EventFormState) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = React.useState<EventFormState>(() => getInitialForm(event));
  const [saving, setSaving] = React.useState(false);

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      if (!event) setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 font-sans">
      <div className="grid gap-2">
        <Label htmlFor="title" className="text-xs uppercase tracking-[0.2em] text-[#ffafd5] font-bold">Event Title</Label>
        <Input 
          id="title" 
          required 
          value={form.title} 
          onChange={(e) => setForm({ ...form, title: e.target.value })} 
          className="bg-black/45 border-white/10 focus-visible:ring-[#ffafd5] focus-visible:border-[#ffafd5] font-sans"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description" className="text-xs uppercase tracking-[0.2em] text-[#ffafd5] font-bold">Description</Label>
        <textarea
          id="description"
          required
          rows={4}
          className="rounded-md border border-white/10 bg-black/45 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#ffafd5] focus:border-[#ffafd5] font-sans transition-all text-white placeholder:text-muted-foreground"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Detailed description of the workshop or hackathon..."
        />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="domain" className="text-xs uppercase tracking-[0.2em] text-[#ffafd5] font-bold">Domain</Label>
          <select
            id="domain"
            className="h-10 rounded-md border border-white/10 bg-black/45 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#ffafd5] focus:border-[#ffafd5] font-sans text-white"
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
          >
            {DOMAINS.map((domain) => (
              <option key={domain} value={domain} className="bg-[#12131b] text-white">{domain}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="type" className="text-xs uppercase tracking-[0.2em] text-[#ffafd5] font-bold">Event Type</Label>
          <select
            id="type"
            className="h-10 rounded-md border border-white/10 bg-black/45 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#ffafd5] focus:border-[#ffafd5] font-sans text-white"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type} className="bg-[#12131b] text-white">{type === "session" ? "Workshop / Session" : "Hackathon"}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="startTime" className="text-xs uppercase tracking-[0.2em] text-[#ffafd5] font-bold">Start Time (IST)</Label>
          <Input 
            id="startTime" 
            required 
            type="datetime-local" 
            value={form.startTime} 
            onChange={(e) => setForm({ ...form, startTime: e.target.value })} 
            className="bg-black/45 border-white/10 focus-visible:ring-[#ffafd5] focus-visible:border-[#ffafd5]"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endTime" className="text-xs uppercase tracking-[0.2em] text-[#ffafd5] font-bold">End Time (IST)</Label>
          <Input 
            id="endTime" 
            required 
            type="datetime-local" 
            value={form.endTime} 
            onChange={(e) => setForm({ ...form, endTime: e.target.value })} 
            className="bg-black/45 border-white/10 focus-visible:ring-[#ffafd5] focus-visible:border-[#ffafd5]"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="roomName" className="text-xs uppercase tracking-[0.2em] text-[#ffafd5] font-bold">Zoho Meet Embedded URL</Label>
        <Input 
          id="roomName" 
          required 
          value={form.roomName} 
          onChange={(e) => setForm({ ...form, roomName: e.target.value })} 
          placeholder="https://meeting.zoho.in/meeting/register?..."
          className="bg-black/45 border-white/10 focus-visible:ring-[#ffafd5] focus-visible:border-[#ffafd5] font-sans"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="posterUrl" className="text-xs uppercase tracking-[0.2em] text-[#ffafd5] font-bold">Poster Image URL (Optional)</Label>
        <Input
          id="posterUrl"
          placeholder="https://example.com/poster.jpg"
          value={form.posterUrl}
          onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
          className="bg-black/45 border-white/10 focus-visible:ring-[#ffafd5] focus-visible:border-[#ffafd5] font-sans"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="statusOverride" className="text-xs uppercase tracking-[0.2em] text-[#ffafd5] font-bold">Live Status Override</Label>
        <select
          id="statusOverride"
          className="h-10 rounded-md border border-white/10 bg-black/45 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#ffafd5] focus:border-[#ffafd5] font-sans text-white"
          value={form.statusOverride}
          onChange={(e) => setForm({ ...form, statusOverride: e.target.value as EventFormState["statusOverride"] })}
        >
          <option value="auto" className="bg-[#12131b] text-white">Auto (Based on system clock)</option>
          <option value="live" className="bg-[#12131b] text-white">Force Live</option>
          <option value="ended" className="bg-[#12131b] text-white">Force Ended</option>
        </select>
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold text-arcade-muted select-none cursor-pointer">
        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          className="h-4 w-4 rounded border-white/10 bg-black/45 text-[#ffafd5] focus:ring-[#ffafd5] accent-[#ffafd5]"
        />
        Publish event immediately to members
      </label>

      <div className="flex gap-3 mt-2">
        <Button 
          type="submit" 
          disabled={saving}
          className="bg-[#ffafd5] hover:bg-[#ffafd5]/90 text-black font-black uppercase tracking-widest text-xs flex-1 gap-2 h-10 shadow-[0_0_15px_rgba(255,175,213,0.2)] hover:shadow-[0_0_20px_rgba(255,175,213,0.4)] transition-all duration-300"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : event ? "Update Event" : "Create Event"}
        </Button>
        {onCancel ? (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-xs h-10"
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
