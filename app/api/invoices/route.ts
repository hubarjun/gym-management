import { connectDB } from "@/lib/db";
import { Invoice } from "@/lib/models/Invoice";
import { Payment } from "@/lib/models/Payment";
import { type NextRequest, NextResponse } from "next/server";

// GET invoices - filter by memberId, status, date range
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: any = {};
    if (memberId) query.memberId = memberId;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const invoices = await Invoice.find(query)
      .populate("memberId", "userId")
      .populate({
        path: "memberId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("paymentId")
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST create invoice
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const {
      memberId,
      amount,
      description,
      dueDate,
      tax = 0,
    } = await req.json();

    // Generate invoice number
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`;

    const totalAmount = amount + tax;

    const invoice = await Invoice.create({
      invoiceNumber,
      memberId,
      amount,
      tax,
      totalAmount,
      description,
      dueDate: new Date(dueDate),
      status: "pending",
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("memberId", "userId")
      .populate({
        path: "memberId",
        populate: { path: "userId", select: "name email" },
      })
      .exec();

    return NextResponse.json(
      { success: true, invoice: populatedInvoice },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
