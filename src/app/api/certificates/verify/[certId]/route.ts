import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Certificate from "@/models/Certificate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ certId: string }> }
) {
  const { certId } = await params;
  if (!certId) {
    return NextResponse.json({ found: false, error: "Missing certificate ID" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const cert = await Certificate.findOne({
      cert_id: { $regex: new RegExp(`^${certId.trim()}$`, "i") },
    }).select("cert_id participant_name event_name event_type cloudinary_url issued_at");

    if (!cert) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    return NextResponse.json({ found: true, certificate: cert }, { status: 200 });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
