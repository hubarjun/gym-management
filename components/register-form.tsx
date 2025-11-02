"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"

export function RegisterForm() {
  const [role, setRole] = useState<"member" | "trainer">("member")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    specialization: "",
    idProof: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Registration failed")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      toast.success("Registered successfully")

      if (role === "member") {
        router.push("/member/dashboard")
      } else {
        router.push("/trainer/dashboard")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Create Account</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setRole("member")}
            className={`flex-1 py-2 rounded font-semibold transition ${
              role === "member" ? "bg-blue-600 text-white" : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
          >
            Member
          </button>
          <button
            onClick={() => setRole("trainer")}
            className={`flex-1 py-2 rounded font-semibold transition ${
              role === "trainer" ? "bg-blue-600 text-white" : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
          >
            Trainer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full bg-slate-700 border-slate-600 text-white"
            required
          />
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full bg-slate-700 border-slate-600 text-white"
            required
          />
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full bg-slate-700 border-slate-600 text-white"
            required
          />

          {role === "member" && (
            <>
              <Input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full bg-slate-700 border-slate-600 text-white"
                required
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <Input
                type="text"
                name="idProof"
                value={formData.idProof}
                onChange={handleChange}
                placeholder="ID Proof (e.g., Passport Number)"
                className="w-full bg-slate-700 border-slate-600 text-white"
                required
              />
            </>
          )}

          {role === "trainer" && (
            <Input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="Specialization"
              className="w-full bg-slate-700 border-slate-600 text-white"
              required
            />
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
        <p className="text-gray-400 text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  )
}
