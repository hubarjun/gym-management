import { connectDB } from "@/lib/db";
import { WorkoutSession } from "@/lib/models/WorkoutSession";
import { type NextRequest, NextResponse } from "next/server";

// GET workout sessions - filter by memberId, date range
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const completed = searchParams.get("completed");

    const query: any = {};
    if (memberId) query.memberId = memberId;
    if (completed !== null) query.completed = completed === "true";

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

    const sessions = await WorkoutSession.find(query)
      .populate("workoutPlanId", "name exercises")
      .populate("exercises.exerciseId", "name description")
      .sort({ date: -1, startTime: -1 })
      .exec();

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workout sessions" },
      { status: 500 }
    );
  }
}

// POST create workout session
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();

    const session = await WorkoutSession.create({
      ...data,
      startTime: new Date(),
      date: new Date(),
    });

    const populatedSession = await WorkoutSession.findById(session._id)
      .populate("workoutPlanId", "name exercises")
      .populate("exercises.exerciseId", "name description")
      .exec();

    return NextResponse.json(
      { success: true, session: populatedSession },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create workout session" },
      { status: 500 }
    );
  }
}
