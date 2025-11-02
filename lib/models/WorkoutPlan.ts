import mongoose, { Schema, type Document } from "mongoose";

export interface IWorkoutExercise {
  exerciseId: mongoose.Types.ObjectId;
  sets: number;
  reps: number;
  weight?: number; // in kg
  restTime?: number; // in seconds
  notes?: string;
  order: number;
}

export interface IWorkoutPlan extends Document {
  name: string;
  description?: string;
  trainerId: mongoose.Types.ObjectId;
  memberId?: mongoose.Types.ObjectId; // if null, it's a template
  exercises: IWorkoutExercise[];
  duration: number; // estimated minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const workoutExerciseSchema = new Schema({
  exerciseId: {
    type: Schema.Types.ObjectId,
    ref: "Exercise",
    required: true,
  },
  sets: { type: Number, required: true, min: 1 },
  reps: { type: Number, required: true, min: 1 },
  weight: { type: Number, min: 0 },
  restTime: { type: Number, min: 0 },
  notes: { type: String },
  order: { type: Number, required: true },
});

const workoutPlanSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    exercises: [workoutExerciseSchema],
    duration: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const WorkoutPlan =
  mongoose.models.WorkoutPlan ||
  mongoose.model<IWorkoutPlan>("WorkoutPlan", workoutPlanSchema);
