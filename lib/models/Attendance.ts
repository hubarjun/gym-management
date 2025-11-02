import mongoose, { Schema, type Document } from "mongoose"

export interface IAttendance extends Document {
  memberId: mongoose.Types.ObjectId
  date: Date
  time: string
}

const attendanceSchema = new Schema({
  memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
})

export const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", attendanceSchema)
