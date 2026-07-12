import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Certificate from "@/models/Certificate";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user.email) {
    return NextResponse.json({ certificates: [] }, { status: 200 });
  }

  try {
    await connectToDatabase();

    // Query certificates corresponding to the authenticated user's email
    const certificates = await Certificate.find({
      participant_email: session.user.email.toLowerCase(),
    })
      .sort({ issued_at: -1 })
      .select("cert_id event_name event_type cloudinary_url issued_at");

    return NextResponse.json({ certificates }, { status: 200 });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
