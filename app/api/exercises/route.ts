import { connectDB } from "@/lib/db";
import { Exercise } from "@/lib/models/Exercise";
import { type NextRequest, NextResponse } from "next/server";

// GET exercises - filter by muscle group, equipment, difficulty
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const muscleGroup = searchParams.get("muscleGroup");
    const equipment = searchParams.get("equipment");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");

    const query: any = {};
    if (muscleGroup) query.muscleGroups = muscleGroup;
    if (equipment) query.equipment = equipment;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const exercises = await Exercise.find(query).sort({ name: 1 }).exec();

    return NextResponse.json(exercises);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

// POST create exercise (Admin)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();

    const exercise = await Exercise.create(data);

    return NextResponse.json({ success: true, exercise }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create exercise" },
      { status: 500 }
    );
  }
}
