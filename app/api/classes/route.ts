import { connectDB } from "@/lib/db";
import { Class } from "@/lib/models/Class";
import { Booking } from "@/lib/models/Booking";
import { type NextRequest, NextResponse } from "next/server";

// GET all classes or filter by category/status
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const query: any = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const classes = await Class.find(query)
      .populate("instructorId", "name email")
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

// POST create a new class (Admin/Trainer)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();

    // Ensure schedule is an array if not provided
    if (!data.schedule) {
      data.schedule = [];
    }

    // instructorId is optional now, but validate if provided
    if (data.instructorId && !data.instructorId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid instructor ID format" },
        { status: 400 }
      );
    }

    const newClass = await Class.create(data);

    const populatedClass = await Class.findById(newClass._id)
      .populate("instructorId", "name email")
      .exec();

    return NextResponse.json(
      { success: true, class: populatedClass },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create class" },
      { status: 500 }
    );
  }
}
