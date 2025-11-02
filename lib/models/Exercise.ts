import mongoose, { Schema, type Document } from "mongoose";

export interface IExercise extends Document {
  name: string;
  description: string;
  muscleGroups: string[]; // chest, back, legs, arms, shoulders, core
  equipment: string; // dumbbells, barbell, bodyweight, machine, etc.
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions?: string;
  videoUrl?: string;
  imageUrl?: string;
  createdAt: Date;
}

const exerciseSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    muscleGroups: [{ type: String }],
    equipment: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    instructions: { type: String },
    videoUrl: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export const Exercise =
  mongoose.models.Exercise ||
  mongoose.model<IExercise>("Exercise", exerciseSchema);
