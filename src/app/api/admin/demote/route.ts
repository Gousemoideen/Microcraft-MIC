import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "admin") {
    return NextResponse.json({ message: "Admin access required" }, { status: 403 });
  }

  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Prevent admin from demoting themselves
  if (session.user.email && normalizedEmail === session.user.email.toLowerCase().trim()) {
    return NextResponse.json({ message: "You cannot demote yourself" }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOneAndUpdate(
    { email: normalizedEmail },
    { $set: { role: "user" } },
    { new: true }
  );

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
