import { connectDB } from "@/lib/db";
import { WorkoutSession } from "@/lib/models/WorkoutSession";
import { type NextRequest, NextResponse } from "next/server";

// GET single workout session
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await WorkoutSession.findById(params.id)
      .populate("workoutPlanId", "name exercises")
      .populate("exercises.exerciseId", "name description videoUrl")
      .exec();

    if (!session) {
      return NextResponse.json(
        { error: "Workout session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workout session" },
      { status: 500 }
    );
  }
}

// PUT update workout session (complete, update exercises, etc.)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const data = await req.json();

    // If completing session, calculate duration
    if (data.completed && !data.endTime) {
      data.endTime = new Date();
      const session = await WorkoutSession.findById(params.id);
      if (session) {
        const duration = Math.round(
          (data.endTime.getTime() - session.startTime.getTime()) / 60000
        );
        data.duration = duration;
      }
    }

    const session = await WorkoutSession.findByIdAndUpdate(params.id, data, {
      new: true,
    })
      .populate("workoutPlanId", "name exercises")
      .populate("exercises.exerciseId", "name description")
      .exec();

    if (!session) {
      return NextResponse.json(
        { error: "Workout session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update workout session" },
      { status: 500 }
    );
  }
}

// DELETE workout session
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await WorkoutSession.findByIdAndDelete(params.id);

    if (!session) {
      return NextResponse.json(
        { error: "Workout session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete workout session" },
      { status: 500 }
    );
  }
}
