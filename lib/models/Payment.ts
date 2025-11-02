import mongoose, { Schema, type Document } from "mongoose";

export interface IPayment extends Document {
  memberId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  method: "online" | "cash" | "card" | "upi" | "wallet" | "fake";
  status: "success" | "failed" | "pending";
  invoiceId?: mongoose.Types.ObjectId;
  transactionId?: string;
  description?: string;
}

const paymentSchema = new Schema({
  memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: {
    type: String,
    enum: ["online", "cash", "card", "upi", "wallet", "fake"],
    required: true,
  },
  status: {
    type: String,
    enum: ["success", "failed", "pending"],
    required: true,
  },
  invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
  transactionId: { type: String },
  description: { type: String },
});

paymentSchema.index({ memberId: 1, date: -1 });

export const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);
