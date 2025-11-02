import mongoose, { Schema, type Document } from "mongoose"

export interface IPlan extends Document {
  type: "monthly" | "yearly"
  duration: number
  fee: number
}

const planSchema = new Schema({
  type: { type: String, enum: ["monthly", "yearly"], required: true },
  duration: { type: Number, required: true },
  fee: { type: Number, required: true },
})

export const Plan = mongoose.models.Plan || mongoose.model<IPlan>("Plan", planSchema)
