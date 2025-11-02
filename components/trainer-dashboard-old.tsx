"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function TrainerDashboard() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.id) {
      router.push("/login")
    } else {
      fetchMembers()
    }
  }, [router])

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members")
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error("Failed to fetch members")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Trainer Dashboard</h1>
        <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
          Logout
        </Button>
      </nav>

      <div className="p-8">
        <h2 className="text-xl font-bold mb-4">Assigned Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 p-6 col-span-full text-center">
              <p className="text-gray-400">No members assigned yet</p>
            </Card>
          ) : (
            members.map((member: any) => (
              <Card key={member._id} className="bg-slate-800 border-slate-700 p-6">
                <h3 className="font-bold text-lg mb-2">{member.userId?.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{member.userId?.email}</p>
                <p className="text-sm mb-1">
                  <span className="text-gray-400">Membership:</span>{" "}
                  <span className="text-blue-400">{member.membershipType}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-400">Expires:</span>{" "}
                  <span className={member.expiryDate > new Date().toISOString() ? "text-green-400" : "text-red-400"}>
                    {new Date(member.expiryDate).toLocaleDateString()}
                  </span>
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
