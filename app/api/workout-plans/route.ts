import { connectDB } from "@/lib/db";
import { WorkoutPlan } from "@/lib/models/WorkoutPlan";
import { type NextRequest, NextResponse } from "next/server";

// GET workout plans - filter by trainerId, memberId, or status
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const trainerId = searchParams.get("trainerId");
    const memberId = searchParams.get("memberId");
    const status = searchParams.get("status");

    const query: any = {};
    if (trainerId) query.trainerId = trainerId;
    if (memberId) query.memberId = memberId;
    if (status) query.status = status;

    const plans = await WorkoutPlan.find(query)
      .populate("trainerId", "name email")
      .populate("memberId", "userId")
      .populate({
        path: "memberId",
        populate: { path: "userId", select: "name email" },
      })
      .populate(
        "exercises.exerciseId",
        "name description equipment muscleGroups"
      )
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workout plans" },
      { status: 500 }
    );
  }
}

// POST create workout plan
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();

    const plan = await WorkoutPlan.create(data);

    const populatedPlan = await WorkoutPlan.findById(plan._id)
      .populate("trainerId", "name email")
      .populate(
        "exercises.exerciseId",
        "name description equipment muscleGroups"
      )
      .exec();

    return NextResponse.json(
      { success: true, plan: populatedPlan },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create workout plan" },
      { status: 500 }
    );
  }
}
