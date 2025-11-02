"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Member {
  _id: string;
  membershipType: string;
  expiryDate: string;
  trainerId?: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  time: string;
}

export function MemberDashboard() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [selectedMembershipType, setSelectedMembershipType] =
    useState<string>("monthly");
  const [renewing, setRenewing] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      router.push("/login");
    } else {
      fetchMemberData(user.id);
    }
  }, [router]);

  const fetchMemberData = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/members?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMember(data);
      } else {
        toast.error("Failed to load member data");
      }
    } catch (error) {
      console.error("Error fetching member data:", error);
      toast.error("Failed to load member data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleAttendance = async () => {
    if (!member?._id) {
      toast.error("Member data not loaded");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/attendance/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ memberId: member._id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Attendance logged successfully!");
      } else {
        toast.error(data.error || "Failed to log attendance");
      }
    } catch (error) {
      console.error("Error logging attendance:", error);
      toast.error("Failed to log attendance");
    }
  };

  const handleRenewal = () => {
    setRenewDialogOpen(true);
  };

  const confirmRenewal = async () => {
    if (!member?._id) {
      toast.error("Member data not loaded");
      return;
    }

    setRenewing(true);
    try {
      const token = localStorage.getItem("token");
      const amount = selectedMembershipType === "monthly" ? 1000 : 10000;

      const response = await fetch("/api/payments/renew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberId: member._id,
          amount,
          membershipType: selectedMembershipType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Membership renewed successfully!");
        setRenewDialogOpen(false);
        // Refresh member data
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.id) {
          await fetchMemberData(user.id);
        }
      } else {
        toast.error(data.error || "Renewal failed");
      }
    } catch (error) {
      console.error("Error renewing membership:", error);
      toast.error("Renewal failed");
    } finally {
      setRenewing(false);
    }
  };

  const handleViewAttendance = async () => {
    if (!member?._id) {
      toast.error("Member data not loaded");
      return;
    }

    setAttendanceDialogOpen(true);
    setLoadingAttendance(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/attendance?memberId=${member._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAttendanceRecords(data);
      } else {
        toast.error(data.error || "Failed to load attendance records");
        setAttendanceDialogOpen(false);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance records");
      setAttendanceDialogOpen(false);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const expiryDate = member?.expiryDate ? new Date(member.expiryDate) : null;
  const daysUntilExpiry = expiryDate
    ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Member Dashboard</h1>
        <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
          Logout
        </Button>
      </nav>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Membership Info</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Membership Type</p>
                <p className="text-lg font-semibold text-blue-400 capitalize">
                  {member?.membershipType || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Expiry Date</p>
                <p className="text-lg font-semibold text-yellow-400">
                  {expiryDate?.toLocaleDateString() || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Days Until Expiry</p>
                <p
                  className={`text-lg font-semibold ${
                    daysUntilExpiry < 7 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : "Expired"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button
                onClick={handleAttendance}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Log Attendance
              </Button>
              <Button
                onClick={handleRenewal}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Renew Membership
              </Button>
              <Button
                onClick={handleViewAttendance}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                View Attendance
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Renew Membership Dialog */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>Renew Membership</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select a membership plan to renew
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Membership Type
              </label>
              <Select
                value={selectedMembershipType}
                onValueChange={setSelectedMembershipType}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-white">
                  <SelectItem value="monthly">Monthly (₹1,000)</SelectItem>
                  <SelectItem value="yearly">Yearly (₹10,000)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setRenewDialogOpen(false)}
              className="bg-slate-600 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRenewal}
              disabled={renewing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {renewing ? "Processing..." : "Confirm Renewal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Attendance Dialog */}
      <Dialog
        open={attendanceDialogOpen}
        onOpenChange={setAttendanceDialogOpen}
      >
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attendance History</DialogTitle>
            <DialogDescription className="text-gray-400">
              Your gym attendance records
            </DialogDescription>
          </DialogHeader>
          {loadingAttendance ? (
            <div className="py-8 text-center">
              Loading attendance records...
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              No attendance records found
            </div>
          ) : (
            <div className="space-y-2 py-4">
              {attendanceRecords.map((record) => (
                <Card
                  key={record._id}
                  className="bg-slate-700 border-slate-600 p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        Time: {record.time}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
