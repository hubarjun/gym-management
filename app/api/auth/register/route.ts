import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/User"
import { Member } from "@/lib/models/Member"
import { Trainer } from "@/lib/models/Trainer"
import { generateToken } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { name, email, password, role, dob, gender, specialization, idProof } = await req.json()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      role,
    })

    if (role === "member" && dob && gender && idProof) {
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + 1)
      await Member.create({
        userId: user._id,
        dob,
        gender,
        membershipType: "monthly",
        expiryDate,
        idProof,
      })
    }

    if (role === "trainer" && specialization) {
      await Trainer.create({
        userId: user._id,
        specialization,
      })
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
