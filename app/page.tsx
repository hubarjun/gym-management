"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Gym Management System</h1>
        <p className="text-xl text-gray-300 mb-8">Professional management for your fitness business</p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
          >
            Login
          </Button>
          <Button
            onClick={() => router.push("/register")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3"
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  )
}
