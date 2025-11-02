import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { type NextRequest, NextResponse } from "next/server";

// GET single booking
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const booking = await Booking.findById(params.id)
      .populate("memberId", "userId")
      .populate({
        path: "memberId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("classId", "name schedule capacity")
      .exec();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PUT update booking (cancel, mark completed, etc.)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { status, cancellationReason } = await req.json();

    const updateData: any = { status };
    if (status === "cancelled") {
      updateData.cancelledAt = new Date();
      if (cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
    }

    const booking = await Booking.findByIdAndUpdate(params.id, updateData, {
      new: true,
    })
      .populate("memberId", "userId")
      .populate("classId", "name schedule capacity")
      .exec();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const booking = await Booking.findByIdAndDelete(params.id);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
