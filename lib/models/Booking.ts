import mongoose, { Schema, type Document } from "mongoose";

export interface IBooking extends Document {
  memberId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  date: Date;
  status: "confirmed" | "cancelled" | "completed" | "no-show";
  createdAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

const bookingSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed", "no-show"],
      default: "confirmed",
    },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

// Index for efficient queries
bookingSchema.index({ memberId: 1, date: 1 });
bookingSchema.index({ classId: 1, date: 1 });

export const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);
