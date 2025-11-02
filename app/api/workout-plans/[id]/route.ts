import { connectDB } from "@/lib/db";
import { WorkoutPlan } from "@/lib/models/WorkoutPlan";
import { type NextRequest, NextResponse } from "next/server";

// GET single workout plan
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const plan = await WorkoutPlan.findById(params.id)
      .populate("trainerId", "name email")
      .populate("memberId", "userId")
      .populate(
        "exercises.exerciseId",
        "name description equipment muscleGroups videoUrl imageUrl"
      )
      .exec();

    if (!plan) {
      return NextResponse.json(
        { error: "Workout plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workout plan" },
      { status: 500 }
    );
  }
}

// PUT update workout plan
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const data = await req.json();

    const plan = await WorkoutPlan.findByIdAndUpdate(params.id, data, {
      new: true,
    })
      .populate("trainerId", "name email")
      .populate(
        "exercises.exerciseId",
        "name description equipment muscleGroups"
      )
      .exec();

    if (!plan) {
      return NextResponse.json(
        { error: "Workout plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update workout plan" },
      { status: 500 }
    );
  }
}

// DELETE workout plan
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const plan = await WorkoutPlan.findByIdAndDelete(params.id);

    if (!plan) {
      return NextResponse.json(
        { error: "Workout plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete workout plan" },
      { status: 500 }
    );
  }
}
