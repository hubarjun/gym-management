import { connectDB } from "@/lib/db";
import { Progress } from "@/lib/models/Progress";
import { type NextRequest, NextResponse } from "next/server";

// GET progress records - filter by memberId, date range
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: any = {};
    if (memberId) query.memberId = memberId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const progressRecords = await Progress.find(query)
      .sort({ date: -1 })
      .exec();

    return NextResponse.json(progressRecords);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch progress records" },
      { status: 500 }
    );
  }
}

// POST create progress record
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();

    const progress = await Progress.create(data);

    return NextResponse.json({ success: true, progress }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create progress record" },
      { status: 500 }
    );
  }
}
