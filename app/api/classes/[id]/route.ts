import { connectDB } from "@/lib/db";
import { Class } from "@/lib/models/Class";
import { type NextRequest, NextResponse } from "next/server";

// GET single class
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const classData = await Class.findById(params.id)
      .populate("instructorId", "name email")
      .exec();

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(classData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

// PUT update class
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const data = await req.json();

    const updatedClass = await Class.findByIdAndUpdate(params.id, data, {
      new: true,
    });

    if (!updatedClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, class: updatedClass });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update class" },
      { status: 500 }
    );
  }
}

// DELETE class
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const deletedClass = await Class.findByIdAndDelete(params.id);

    if (!deletedClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
