import mongoose, { Schema, type Document } from "mongoose";

export interface IClass extends Document {
  name: string;
  description: string;
  instructorId?: mongoose.Types.ObjectId;
  schedule: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM format
    endTime: string;
    duration: number; // minutes
  }[];
  capacity: number;
  price: number;
  category: string; // Yoga, Zumba, CrossFit, etc.
  status: "active" | "inactive" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
    },
    schedule: [
      {
        dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        duration: { type: Number, required: true },
      },
    ],
    capacity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const Class =
  mongoose.models.Class || mongoose.model<IClass>("Class", classSchema);
