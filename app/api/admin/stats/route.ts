import { connectDB } from "@/lib/db"
import { Member } from "@/lib/models/Member"
import { Payment } from "@/lib/models/Payment"
import { User } from "@/lib/models/User"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const now = new Date()
    const totalMembers = await Member.countDocuments()
    const activeMembers = await Member.countDocuments({ expiryDate: { $gt: now } })
    const expiredMembers = totalMembers - activeMembers
    const totalTrainers = await User.countDocuments({ role: "trainer" })

    const payments = await Payment.find({ status: "success" })
    const monthlyIncome = payments.reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      totalMembers,
      activeMembers,
      expiredMembers,
      totalTrainers,
      monthlyIncome,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
