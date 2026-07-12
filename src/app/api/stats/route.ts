import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Registration from "@/models/Registration";
import Event from "@/models/Event";
import Certificate from "@/models/Certificate";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectToDatabase();
  const events = await Event.find({}).sort({ startTime: 1 });
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfToday);
  const weekday = startOfWeek.getDay();
  const daysFromMonday = (weekday + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - daysFromMonday);
  
  const totalUsers = await User.countDocuments();
  const totalRegistrations = await Registration.countDocuments();
  const registrationsToday = await Registration.countDocuments({ registeredAt: { $gte: startOfToday } });
  const registrationsThisWeek = await Registration.countDocuments({ registeredAt: { $gte: startOfWeek } });
  const hackathonEventIds = events.filter((event) => event.type === "hackathon").map((event) => event._id);
  
  const totalHackathonRegistrations = hackathonEventIds.length
    ? await Registration.countDocuments({ eventId: { $in: hackathonEventIds } })
    : 0;
  
  const registrationCountsRaw = await Registration.aggregate([
    { $group: { _id: "$eventId", count: { $sum: 1 } } },
  ]);
  
  const registrationCounts = registrationCountsRaw.reduce<Record<string, number>>((acc, item) => {
    acc[String(item._id)] = item.count;
    return acc;
  }, {});

  // Fetch Certificate Analytics
  const totalCertificates = await Certificate.countDocuments();
  const uniqueCertificateRecipients = (await Certificate.distinct("participant_email")).length;
  const totalWorkshopCertificates = await Certificate.countDocuments({ event_type: "workshop" });
  const totalHackathonCertificates = await Certificate.countDocuments({ event_type: "hackathon" });

  return NextResponse.json({
    totalUsers,
    totalRegistrations,
    registrationsToday,
    registrationsThisWeek,
    totalHackathonRegistrations,
    registrationCounts,
    // Certificate metrics
    totalCertificates,
    uniqueCertificateRecipients,
    totalWorkshopCertificates,
    totalHackathonCertificates,
  }, { status: 200 });
}