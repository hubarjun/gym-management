import mongoose, { Schema, type Document } from "mongoose";

export interface IProgress extends Document {
  memberId: mongoose.Types.ObjectId;
  date: Date;
  weight?: number; // in kg
  bodyFat?: number; // percentage
  muscleMass?: number; // in kg
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  photos?: string[]; // URLs
  notes?: string;
  createdAt: Date;
}

const progressSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    weight: { type: Number, min: 0 },
    bodyFat: { type: Number, min: 0, max: 100 },
    muscleMass: { type: Number, min: 0 },
    measurements: {
      chest: { type: Number, min: 0 },
      waist: { type: Number, min: 0 },
      hips: { type: Number, min: 0 },
      arms: { type: Number, min: 0 },
      thighs: { type: Number, min: 0 },
    },
    photos: [{ type: String }],
    notes: { type: String },
  },
  { timestamps: true }
);

progressSchema.index({ memberId: 1, date: -1 });

export const Progress =
  mongoose.models.Progress ||
  mongoose.model<IProgress>("Progress", progressSchema);
