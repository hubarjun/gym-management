import mongoose, { Schema, type Document } from "mongoose"

export interface IMember extends Document {
  userId: mongoose.Types.ObjectId
  dob: Date
  gender: string
  membershipType: "monthly" | "yearly"
  expiryDate: Date
  trainerId?: mongoose.Types.ObjectId
  idProof: string
  createdAt: Date
}

const memberSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  membershipType: { type: String, enum: ["monthly", "yearly"], required: true },
  expiryDate: { type: Date, required: true },
  trainerId: { type: Schema.Types.ObjectId, ref: "Trainer" },
  idProof: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const Member = mongoose.models.Member || mongoose.model<IMember>("Member", memberSchema)
