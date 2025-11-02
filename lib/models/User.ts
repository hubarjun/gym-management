import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  role: "admin" | "trainer" | "member"
  createdAt: Date
  comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "trainer", "member"], required: true },
  createdAt: { type: Date, default: Date.now },
})

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.passwordHash)
}

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
