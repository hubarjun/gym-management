import { connectDB } from "@/lib/db"
import { Attendance } from "@/lib/models/Attendance"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { memberId } = await req.json()

    const now = new Date()
    const attendance = await Attendance.create({
      memberId,
      date: now,
      time: now.toLocaleTimeString(),
    })

    return NextResponse.json({ success: true, attendance })
  } catch (error) {
    return NextResponse.json({ error: "Failed to log attendance" }, { status: 500 })
  }
}
