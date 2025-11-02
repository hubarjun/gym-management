import { connectDB } from "@/lib/db";
import { Member } from "@/lib/models/Member";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // Fetch single member by userId
      const member = await Member.findOne({ userId })
        .populate("userId", "name email")
        .populate("trainerId", "specialization")
        .exec();

      if (!member) {
        return NextResponse.json(
          { error: "Member not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(member);
    }

    // Fetch all members
    const members = await Member.find()
      .populate("userId", "name email")
      .populate("trainerId", "specialization")
      .exec();

    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
