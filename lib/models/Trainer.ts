import mongoose, { Schema, type Document } from "mongoose"

export interface ITrainer extends Document {
  userId: mongoose.Types.ObjectId
  specialization: string
  createdAt: Date
}

const trainerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  specialization: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const Trainer = mongoose.models.Trainer || mongoose.model<ITrainer>("Trainer", trainerSchema)
