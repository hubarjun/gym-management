import mongoose, { Schema, type Document } from "mongoose";

export interface IInvoice extends Document {
  invoiceNumber: string;
  memberId: mongoose.Types.ObjectId;
  amount: number;
  tax?: number;
  totalAmount: number;
  description: string;
  paymentId?: mongoose.Types.ObjectId;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
}

const invoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    description: { type: String, required: true },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue", "cancelled"],
      default: "pending",
    },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
  },
  { timestamps: true }
);

invoiceSchema.index({ memberId: 1, createdAt: -1 });
invoiceSchema.index({ invoiceNumber: 1 });

export const Invoice =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", invoiceSchema);
