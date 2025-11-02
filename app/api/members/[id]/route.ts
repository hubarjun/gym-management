import { connectDB } from "@/lib/db";
import { Member } from "@/lib/models/Member";
import { type NextRequest, NextResponse } from "next/server";

// PUT update member
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const data = await req.json();

    // Handle params as Promise (Next.js 15+) or direct object
    const resolvedParams = params instanceof Promise ? await params : params;
    const memberId = resolvedParams.id;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId format (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(memberId)) {
      return NextResponse.json(
        { error: "Invalid member ID format" },
        { status: 400 }
      );
    }

    const updatedMember = await Member.findByIdAndUpdate(
      memberId,
      { $set: data },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("trainerId", "specialization")
      .populate({
        path: "trainerId",
        populate: { path: "userId", select: "name email" },
      })
      .exec();

    if (!updatedMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, member: updatedMember });
  } catch (error: any) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update member" },
      { status: 500 }
    );
  }
}
