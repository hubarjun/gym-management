import mongoose, { Schema, type Document } from "mongoose";

export interface IWorkoutSessionExercise {
  exerciseId: mongoose.Types.ObjectId;
  sets: {
    reps: number;
    weight?: number;
    completed: boolean;
    notes?: string;
  }[];
  completed: boolean;
}

export interface IWorkoutSession extends Document {
  memberId: mongoose.Types.ObjectId;
  workoutPlanId?: mongoose.Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  exercises: IWorkoutSessionExercise[];
  notes?: string;
  completed: boolean;
  createdAt: Date;
}

const workoutSessionExerciseSchema = new Schema({
  exerciseId: {
    type: Schema.Types.ObjectId,
    ref: "Exercise",
    required: true,
  },
  sets: [
    {
      reps: { type: Number, required: true },
      weight: { type: Number },
      completed: { type: Boolean, default: false },
      notes: { type: String },
    },
  ],
  completed: { type: Boolean, default: false },
});

const workoutSessionSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    workoutPlanId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutPlan",
    },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number },
    exercises: [workoutSessionExerciseSchema],
    notes: { type: String },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const WorkoutSession =
  mongoose.models.WorkoutSession ||
  mongoose.model<IWorkoutSession>("WorkoutSession", workoutSessionSchema);
