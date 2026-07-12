import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Event from "@/models/Event";
import Certificate from "@/models/Certificate";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "admin") {
    return NextResponse.json({ message: "Admin access required" }, { status: 403 });
  }

  await connectToDatabase();

  // 1. Fetch all datasets for in-memory analysis
  const events = await Event.find({}).sort({ startTime: 1 });
  const registrations = await Registration.find({}).populate("userId", "name email image");
  const certificates = await Certificate.find({});

  // 2. Institution statistics: Group and count registrations by school/college
  const institutionCounts: Record<string, number> = {};
  registrations.forEach((r) => {
    let rawCollege = r.schoolCollegeName ? r.schoolCollegeName.trim() : "";
    const lowerCollege = rawCollege.toLowerCase();
    
    // Normalize and group all VIT campus variations (including VITC/VIT Chennai)
    if (
      lowerCollege === "vit" ||
      lowerCollege === "vitc" ||
      lowerCollege.startsWith("vit ") ||
      lowerCollege.startsWith("vitc ") ||
      lowerCollege.startsWith("vit,") ||
      lowerCollege.includes("vellore institute") ||
      lowerCollege.includes("vellore inst")
    ) {
      rawCollege = "Vellore Institute of Technology (VIT)";
    } else if (lowerCollege.includes("valluvar")) {
      // Normalize and group all Valluvar college variations
      rawCollege = "Valluvar College of Science and Management";
    }
    
    const college = rawCollege || "Unknown / Not Specified";
    institutionCounts[college] = (institutionCounts[college] || 0) + 1;
  });

  const institutionStats = Object.entries(institutionCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 3. Event engagement metrics: registrations, attendance conversion, avg time spent
  const eventMetrics = events.map((event) => {
    const eventRegs = registrations.filter(
      (r) => String(r.eventId) === String(event._id)
    );
    const totalReg = eventRegs.length;
    
    // Attended means there's at least one log in meetHistory
    const attendedRegs = eventRegs.filter(
      (r) => r.meetHistory && r.meetHistory.length > 0
    );
    const attended = attendedRegs.length;
    
    const conversionRate = totalReg > 0 ? Math.round((attended / totalReg) * 100) : 0;

    // Compute average duration in minutes for students who attended
    let totalDurationMs = 0;
    let attendedWithDurationCount = 0;

    attendedRegs.forEach((r) => {
      let userDurationMs = 0;
      let hasValidLog = false;
      
      r.meetHistory.forEach((log) => {
        if (log.joinedAt && log.leftAt) {
          const join = new Date(log.joinedAt).getTime();
          const left = new Date(log.leftAt).getTime();
          if (left > join) {
            userDurationMs += left - join;
            hasValidLog = true;
          }
        }
      });
      
      if (hasValidLog) {
        totalDurationMs += userDurationMs;
        attendedWithDurationCount++;
      }
    });

    const avgDurationMin =
      attendedWithDurationCount > 0
        ? Math.round(totalDurationMs / (attendedWithDurationCount * 60 * 1000))
        : 0;

    // Count certificates issued for this event
    // Look up certificates matching this event's title
    const certsCount = certificates.filter(
      (c) => c.event_name.toLowerCase().trim() === event.title.toLowerCase().trim()
    ).length;

    return {
      id: String(event._id),
      title: event.title,
      domain: event.domain,
      type: event.type,
      startTime: event.startTime,
      totalRegistrations: totalReg,
      attendedCount: attended,
      conversionRate,
      avgDurationMin,
      certificatesIssued: certsCount,
    };
  });

  // 4. Daily registration velocity (last 7 days)
  const dailyRegistrationVelocity = [];
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const currentDayStart = new Date(startOfToday);
    currentDayStart.setDate(currentDayStart.getDate() - i);
    const currentDayEnd = new Date(currentDayStart);
    currentDayEnd.setDate(currentDayEnd.getDate() + 1);

    const dayRegistrations = registrations.filter((r) => {
      if (!r.registeredAt) return false;
      const regTime = new Date(r.registeredAt).getTime();
      return regTime >= currentDayStart.getTime() && regTime < currentDayEnd.getTime();
    });

    dailyRegistrationVelocity.push({
      date: currentDayStart.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      count: dayRegistrations.length,
    });
  }

  // 5. Workshop Super-Participants Leaderboard
  const workshopEventIds = new Set(
    events.filter((e) => e.type === "session").map((e) => String(e._id))
  );
  const totalWorkshops = workshopEventIds.size;

  const userWorkshopAttendance: Record<
    string,
    {
      name: string;
      email: string;
      college: string;
      attendedCount: number;
    }
  > = {};

  registrations.forEach((r) => {
    const isWorkshop = workshopEventIds.has(String(r.eventId));
    const attended = r.meetHistory && r.meetHistory.length > 0;
    
    if (isWorkshop && attended && r.userId) {
      const u = r.userId as any;
      const uId = String(u._id);
      
      if (!userWorkshopAttendance[uId]) {
        let rawCollege = r.schoolCollegeName ? r.schoolCollegeName.trim() : "";
        const lowerCollege = rawCollege.toLowerCase();
        
        if (
          lowerCollege === "vit" ||
          lowerCollege === "vitc" ||
          lowerCollege.startsWith("vit ") ||
          lowerCollege.startsWith("vitc ") ||
          lowerCollege.startsWith("vit,") ||
          lowerCollege.includes("vellore institute") ||
          lowerCollege.includes("vellore inst")
        ) {
          rawCollege = "Vellore Institute of Technology (VIT)";
        } else if (lowerCollege.includes("valluvar")) {
          rawCollege = "Valluvar College of Science and Management";
        }

        userWorkshopAttendance[uId] = {
          name: u.name || "Member",
          email: u.email || "",
          college: rawCollege || "Not Specified",
          attendedCount: 0,
        };
      }
      userWorkshopAttendance[uId].attendedCount++;
    }
  });

  const superParticipants = Object.values(userWorkshopAttendance)
    .sort((a, b) => b.attendedCount - a.attendedCount)
    .slice(0, 30);

  // 6. Overall credentials analytics conversion
  const totalCertificates = certificates.length;
  const uniqueRecipients = new Set(certificates.map((c) => c.participant_email.toLowerCase().trim())).size;
  const totalWorkshopCertificates = certificates.filter((c) => c.event_type === "workshop").length;
  const totalHackathonCertificates = certificates.filter((c) => c.event_type === "hackathon").length;

  return NextResponse.json(
    {
      institutionStats,
      eventMetrics,
      dailyRegistrationVelocity,
      superParticipants,
      totalWorkshops,
      credentialsSummary: {
        totalCertificates,
        uniqueRecipients,
        totalWorkshopCertificates,
        totalHackathonCertificates,
        overallConversionRate: registrations.length > 0 ? Math.round((totalCertificates / registrations.length) * 100) : 0,
      },
    },
    { status: 200 }
  );
}
