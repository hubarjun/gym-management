import { connectDB } from "@/lib/db";
import { Progress } from "@/lib/models/Progress";
import { type NextRequest, NextResponse } from "next/server";

// GET single progress record
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const progress = await Progress.findById(params.id).exec();

    if (!progress) {
      return NextResponse.json(
        { error: "Progress record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch progress record" },
      { status: 500 }
    );
  }
}

// PUT update progress record
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const data = await req.json();

    const progress = await Progress.findByIdAndUpdate(params.id, data, {
      new: true,
    });

    if (!progress) {
      return NextResponse.json(
        { error: "Progress record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update progress record" },
      { status: 500 }
    );
  }
}

// DELETE progress record
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const progress = await Progress.findByIdAndDelete(params.id);

    if (!progress) {
      return NextResponse.json(
        { error: "Progress record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete progress record" },
      { status: 500 }
    );
  }
}
