import { connectDB } from "@/lib/db";
import { Payment } from "@/lib/models/Payment";
import { Member } from "@/lib/models/Member";
import { Invoice } from "@/lib/models/Invoice";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { memberId, amount, membershipType } = await req.json();

    // Create invoice
    const invoiceCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, "0")}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      memberId,
      amount,
      tax: 0,
      totalAmount: amount,
      description: `Membership renewal - ${membershipType}`,
      dueDate: new Date(),
      status: "pending",
    });

    // Create payment
    const payment = await Payment.create({
      memberId,
      amount,
      date: new Date(),
      method: "fake",
      status: "success",
      invoiceId: invoice._id,
      description: `Membership renewal - ${membershipType}`,
    });

    // Update invoice with payment
    await Invoice.findByIdAndUpdate(invoice._id, {
      paymentId: payment._id,
      status: "paid",
      paidDate: new Date(),
    });

    // Update member membership
    const expiryDate = new Date();
    if (membershipType === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    await Member.findByIdAndUpdate(memberId, {
      membershipType,
      expiryDate,
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate("invoiceId", "invoiceNumber")
      .exec();

    return NextResponse.json({
      success: true,
      payment: populatedPayment,
      invoice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Payment failed" },
      { status: 500 }
    );
  }
}
