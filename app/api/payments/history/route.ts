import { connectDB } from "@/lib/db";
import { Payment } from "@/lib/models/Payment";
import { Invoice } from "@/lib/models/Invoice";
import { type NextRequest, NextResponse } from "next/server";

// GET payment history - filter by memberId, date range
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    const query: any = {};
    if (memberId) query.memberId = memberId;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const payments = await Payment.find(query)
      .populate("memberId", "userId")
      .populate({
        path: "memberId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("invoiceId", "invoiceNumber description")
      .sort({ date: -1 })
      .exec();

    // Calculate summary
    const totalPaid = payments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      payments,
      summary: {
        total: payments.length,
        totalPaid,
        totalFailed: payments.filter((p) => p.status === "failed").length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch payment history" },
      { status: 500 }
    );
  }
}
