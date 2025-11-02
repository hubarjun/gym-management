import { connectDB } from "@/lib/db";
import { Attendance } from "@/lib/models/Attendance";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { error: "memberId is required" },
        { status: 400 }
      );
    }

    const attendanceRecords = await Attendance.find({ memberId })
      .sort({ date: -1, time: -1 })
      .exec();

    return NextResponse.json(attendanceRecords);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}
