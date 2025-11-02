import { connectDB } from "@/lib/db";
import { Invoice } from "@/lib/models/Invoice";
import { Payment } from "@/lib/models/Payment";
import { type NextRequest, NextResponse } from "next/server";

// GET single invoice
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const invoice = await Invoice.findById(params.id)
      .populate("memberId", "userId")
      .populate({
        path: "memberId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("paymentId")
      .exec();

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// PUT update invoice (mark as paid)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { paymentId, status } = await req.json();

    const updateData: any = {};
    if (paymentId) {
      updateData.paymentId = paymentId;
      updateData.status = "paid";
      updateData.paidDate = new Date();

      // Update payment with invoice reference
      await Payment.findByIdAndUpdate(paymentId, { invoiceId: params.id });
    }
    if (status) updateData.status = status;

    const invoice = await Invoice.findByIdAndUpdate(params.id, updateData, {
      new: true,
    })
      .populate("memberId", "userId")
      .populate("paymentId")
      .exec();

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update invoice" },
      { status: 500 }
    );
  }
}
