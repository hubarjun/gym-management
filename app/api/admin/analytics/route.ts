import { connectDB } from "@/lib/db";
import { Member } from "@/lib/models/Member";
import { Payment } from "@/lib/models/Payment";
import { Attendance } from "@/lib/models/Attendance";
import { Booking } from "@/lib/models/Booking";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month"; // month, week, year

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Revenue analytics
    const payments = await Payment.find({
      date: { $gte: startDate },
      status: "success",
    });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const revenueByMethod = payments.reduce((acc: any, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {});

    // Attendance analytics
    const attendanceCount = await Attendance.countDocuments({
      date: { $gte: startDate },
    });

    // Booking analytics
    const bookingCount = await Booking.countDocuments({
      date: { $gte: startDate },
      status: { $in: ["confirmed", "completed"] },
    });

    // Member analytics
    const activeMembers = await Member.countDocuments({
      expiryDate: { $gte: now },
    });
    const expiredMembers = await Member.countDocuments({
      expiryDate: { $lt: now },
    });

    // Daily attendance trend (last 30 days)
    const dailyAttendance = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const count = await Attendance.countDocuments({
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999)),
        },
      });
      dailyAttendance.push({
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    return NextResponse.json({
      revenue: {
        total: totalRevenue,
        byMethod: revenueByMethod,
        count: payments.length,
      },
      attendance: {
        total: attendanceCount,
        daily: dailyAttendance,
      },
      bookings: {
        total: bookingCount,
      },
      members: {
        active: activeMembers,
        expired: expiredMembers,
        total: activeMembers + expiredMembers,
      },
      period,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
