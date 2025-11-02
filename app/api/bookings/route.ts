import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Class } from "@/lib/models/Class";
import { type NextRequest, NextResponse } from "next/server";

// GET bookings - filter by memberId, classId, or date
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const classId = searchParams.get("classId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    const query: any = {};
    if (memberId) query.memberId = memberId;
    if (classId) query.classId = classId;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate("memberId", "userId")
      .populate({
        path: "memberId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("classId", "name schedule capacity")
      .sort({ date: 1 })
      .exec();

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST create booking
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { memberId, classId, date } = await req.json();

    // Check class capacity
    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Count existing bookings for the date
    const existingBookings = await Booking.countDocuments({
      classId,
      date: new Date(date),
      status: { $in: ["confirmed", "completed"] },
    });

    if (existingBookings >= classData.capacity) {
      return NextResponse.json(
        { error: "Class is fully booked" },
        { status: 400 }
      );
    }

    // Check if member already booked
    const existingBooking = await Booking.findOne({
      memberId,
      classId,
      date: new Date(date),
      status: "confirmed",
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "You already have a booking for this class" },
        { status: 400 }
      );
    }

    const booking = await Booking.create({
      memberId,
      classId,
      date: new Date(date),
      status: "confirmed",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("memberId", "userId")
      .populate({
        path: "memberId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("classId", "name schedule capacity")
      .exec();

    return NextResponse.json(
      { success: true, booking: populatedBooking },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}
