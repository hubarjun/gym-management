"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface AdminStats {
  totalMembers: number
  activeMembers: number
  expiredMembers: number
  totalTrainers: number
  monthlyIncome: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  const chartData = [
    { name: "Active", value: stats?.activeMembers || 0 },
    { name: "Expired", value: stats?.expiredMembers || 0 },
  ]

  const COLORS = ["#3b82f6", "#ef4444"]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
          Logout
        </Button>
      </nav>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <p className="text-gray-400 text-sm">Total Members</p>
            <p className="text-3xl font-bold text-blue-400">{stats?.totalMembers}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <p className="text-gray-400 text-sm">Active Members</p>
            <p className="text-3xl font-bold text-green-400">{stats?.activeMembers}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <p className="text-gray-400 text-sm">Expired Members</p>
            <p className="text-3xl font-bold text-red-400">{stats?.expiredMembers}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <p className="text-gray-400 text-sm">Total Trainers</p>
            <p className="text-3xl font-bold text-purple-400">{stats?.totalTrainers}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <p className="text-gray-400 text-sm">Monthly Income</p>
            <p className="text-3xl font-bold text-green-400">${stats?.monthlyIncome}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Membership Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Income Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { month: "Jan", income: 2400 },
                  { month: "Feb", income: 2300 },
                  { month: "Mar", income: stats?.monthlyIncome || 2800 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  )
}
