"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  BarChart,
  Bar,
} from "recharts";

interface Member {
  _id: string;
  userId: { name: string; email: string };
  membershipType: string;
  expiryDate: string;
  trainerId?:
    | string
    | {
        _id?: string;
        userId?: { name: string; email: string };
        specialization?: string;
      };
}

interface ClassType {
  _id: string;
  name: string;
  description: string;
  category: string;
  capacity: number;
  price: number;
  status: string;
}

interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  totalTrainers: number;
  monthlyIncome: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [trainerAssignDialogOpen, setTrainerAssignDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [selectedTrainerId, setSelectedTrainerId] =
    useState<string>("__none__");

  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");

  const router = useRouter();

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
    fetchMembers();
    fetchClasses();
    fetchTrainers();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics");
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/members");
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Failed to fetch members");
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Failed to fetch classes");
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await fetch("/api/trainers");
      if (response.ok) {
        const data = await response.json();
        setTrainers(data);
      }
    } catch (error) {
      console.error("Failed to fetch trainers");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleCreateClass = async (formData: any) => {
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Class created successfully!");
        setClassDialogOpen(false);
        fetchClasses();
      } else {
        toast.error(data.error || "Failed to create class");
      }
    } catch (error) {
      toast.error("Failed to create class");
    }
  };

  const handleAssignTrainer = async () => {
    if (!selectedMember) {
      toast.error("Please select a member");
      return;
    }

    try {
      // Safely extract member ID - handle both string and object IDs
      // When data comes from API, _id is usually already a string due to JSON serialization
      let memberId: string;

      // First, try direct string access
      if (typeof selectedMember._id === "string") {
        memberId = selectedMember._id.trim();
      }
      // If it's an object (MongoDB ObjectId), extract the string value
      else if (selectedMember._id && typeof selectedMember._id === "object") {
        // Handle Mongoose ObjectId - it has a toString method
        if (
          "toString" in selectedMember._id &&
          typeof (selectedMember._id as any).toString === "function"
        ) {
          memberId = (selectedMember._id as any).toString().trim();
        }
        // Handle objects with $oid (MongoDB extended JSON format)
        else if ("$oid" in selectedMember._id) {
          memberId = String((selectedMember._id as any).$oid).trim();
        }
        // Handle nested _id
        else if ("_id" in selectedMember._id) {
          memberId = String((selectedMember._id as any)._id).trim();
        }
        // Fallback to string conversion
        else {
          memberId = String(selectedMember._id).trim();
        }
      }
      // Fallback for other types
      else {
        memberId = String(selectedMember._id || "").trim();
      }

      // Validate the ID
      if (
        !memberId ||
        memberId === "undefined" ||
        memberId === "null" ||
        memberId.length === 0
      ) {
        toast.error("Invalid member ID");
        console.error("Invalid member ID:", {
          original: selectedMember._id,
          extracted: memberId,
          member: selectedMember,
        });
        return;
      }

      const trainerIdToAssign =
        selectedTrainerId === "__none__" ? null : selectedTrainerId || null;

      console.log("Assigning trainer:", {
        memberId,
        memberIdLength: memberId.length,
        trainerId: trainerIdToAssign,
        member: selectedMember,
      });

      const response = await fetch(`/api/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId: trainerIdToAssign,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Trainer assigned successfully!");
        setTrainerAssignDialogOpen(false);
        setSelectedTrainerId("__none__");
        fetchMembers();
      } else {
        toast.error(data.error || "Failed to assign trainer");
      }
    } catch (error: any) {
      console.error("Error assigning trainer:", error);
      toast.error(error.message || "Failed to assign trainer");
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.userId?.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      member.userId?.email?.toLowerCase().includes(memberSearch.toLowerCase());

    if (memberFilter === "all") return matchesSearch;
    if (memberFilter === "active") {
      return matchesSearch && new Date(member.expiryDate) > new Date();
    }
    if (memberFilter === "expired") {
      return matchesSearch && new Date(member.expiryDate) <= new Date();
    }
    return matchesSearch;
  });

  const chartData = analytics?.attendance?.daily || [];
  const revenueData = [
    { month: "Jan", revenue: 50000 },
    { month: "Feb", revenue: 55000 },
    { month: "Mar", revenue: analytics?.revenue?.total || 60000 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white border-b border-gray-200 p-6 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <Button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Logout
        </Button>
      </nav>

      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              Members
            </TabsTrigger>
            <TabsTrigger
              value="classes"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              Classes
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-600 text-sm mb-1">Total Members</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.totalMembers || 0}
                </p>
              </Card>
              <Card className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-600 text-sm mb-1">Active Members</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {stats?.activeMembers || 0}
                </p>
              </Card>
              <Card className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-600 text-sm mb-1">Expired Members</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats?.expiredMembers || 0}
                </p>
              </Card>
              <Card className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-600 text-sm mb-1">Total Trainers</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.totalTrainers || 0}
                </p>
              </Card>
              <Card className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-600 text-sm mb-1">Monthly Income</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ₹{stats?.monthlyIncome || 0}
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Membership Distribution
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Active", value: stats?.activeMembers || 0 },
                        { name: "Expired", value: stats?.expiredMembers || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Revenue Trend
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      name="Revenue (₹)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {analytics && chartData.length > 0 && (
              <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Daily Attendance (Last 30 Days)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" name="Attendance" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  Total Revenue
                </h3>
                <p className="text-2xl font-bold text-emerald-600">
                  ₹{analytics?.revenue?.total || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics?.revenue?.count || 0} transactions
                </p>
              </Card>
              <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  Total Attendance
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics?.attendance?.total || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </Card>
              <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  Class Bookings
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics?.bookings?.total || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Member Management</h2>
              <Button
                onClick={() => {
                  setSelectedMember(null);
                  setMemberDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Member
              </Button>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="bg-white border-gray-300 flex-1 text-gray-900"
              />
              <Select value={memberFilter} onValueChange={setMemberFilter}>
                <SelectTrigger className="w-[180px] bg-white border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="expired">Expired Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <Card
                  key={member._id}
                  className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    {member.userId?.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {member.userId?.email}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="text-gray-600">Membership:</span>{" "}
                    <span className="text-blue-600 capitalize font-medium">
                      {member.membershipType}
                    </span>
                  </p>
                  <p className="text-sm mb-2">
                    <span className="text-gray-600">Expires:</span>{" "}
                    <span
                      className={
                        new Date(member.expiryDate) > new Date()
                          ? "text-emerald-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {new Date(member.expiryDate).toLocaleDateString()}
                    </span>
                  </p>
                  {member.trainerId && (
                    <p className="text-sm mb-2">
                      <span className="text-gray-600">Trainer:</span>{" "}
                      <span className="text-purple-600 font-medium">
                        {typeof member.trainerId === "object" &&
                        member.trainerId !== null &&
                        "userId" in member.trainerId &&
                        member.trainerId.userId
                          ? (member.trainerId.userId as any).name
                          : "Assigned"}
                      </span>
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => {
                        setSelectedMember(member);
                        const trainerIdValue =
                          typeof member.trainerId === "object" &&
                          member.trainerId !== null &&
                          "_id" in member.trainerId
                            ? (member.trainerId as any)._id?.toString() ||
                              "__none__"
                            : typeof member.trainerId === "string"
                            ? member.trainerId || "__none__"
                            : "__none__";
                        setSelectedTrainerId(trainerIdValue);
                        setTrainerAssignDialogOpen(true);
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {member.trainerId ? "Change Trainer" : "Assign Trainer"}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedMember(member);
                        setMemberDialogOpen(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View/Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Class Management</h2>
              <Button
                onClick={() => {
                  setSelectedClass(null);
                  setClassDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Class
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <Card
                  key={classItem._id}
                  className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    {classItem.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {classItem.description}
                  </p>
                  <div className="space-y-1 mb-4">
                    <p className="text-sm">
                      <span className="text-gray-600">Category:</span>{" "}
                      <span className="text-blue-600 font-medium">
                        {classItem.category}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Capacity:</span>{" "}
                      <span className="text-emerald-600 font-medium">
                        {classItem.capacity}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Price:</span>{" "}
                      <span className="text-amber-600 font-medium">
                        ₹{classItem.price}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Status:</span>{" "}
                      <span
                        className={
                          classItem.status === "active"
                            ? "text-emerald-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {classItem.status}
                      </span>
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedClass(classItem);
                      setClassDialogOpen(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Edit
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Detailed Analytics
            </h2>
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">
                    Revenue by Payment Method
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(analytics.revenue?.byMethod || {}).map(
                      ([method, amount]: [string, any]) => (
                        <div key={method} className="flex justify-between">
                          <span className="text-gray-600 capitalize">
                            {method}:
                          </span>
                          <span className="text-emerald-600 font-medium">
                            ₹{amount}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </Card>
                <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">
                    Member Statistics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Members:</span>
                      <span className="text-emerald-600 font-medium">
                        {analytics.members?.active || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expired Members:</span>
                      <span className="text-red-600 font-medium">
                        {analytics.members?.expired || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Members:</span>
                      <span className="text-blue-600 font-medium">
                        {analytics.members?.total || 0}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Class Dialog */}
      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent className="bg-white text-gray-900 border-gray-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedClass ? "Edit Class" : "Create New Class"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedClass
                ? "Update class information"
                : "Add a new group class to the schedule"}
            </DialogDescription>
          </DialogHeader>
          <ClassFormDialog
            classData={selectedClass}
            onSave={handleCreateClass}
            onClose={() => setClassDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Trainer Dialog */}
      <Dialog
        open={trainerAssignDialogOpen}
        onOpenChange={setTrainerAssignDialogOpen}
      >
        <DialogContent className="bg-white text-gray-900 border-gray-200">
          <DialogHeader>
            <DialogTitle>
              Assign Trainer to {selectedMember?.userId?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Select a trainer to assign to this member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">
                Select Trainer
              </label>
              <Select
                value={selectedTrainerId}
                onValueChange={setSelectedTrainerId}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select a trainer" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="__none__">None (Unassign)</SelectItem>
                  {trainers.map((trainer) => (
                    <SelectItem key={trainer._id} value={trainer._id}>
                      {trainer.userId?.name} - {trainer.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setTrainerAssignDialogOpen(false);
                setSelectedTrainerId("__none__");
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignTrainer}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Assign Trainer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Separate component for class form
function ClassFormDialog({
  classData,
  onSave,
  onClose,
}: {
  classData: any;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: classData?.name || "",
    description: classData?.description || "",
    category: classData?.category || "",
    capacity: classData?.capacity?.toString() || "20",
    price: classData?.price?.toString() || "0",
    status: classData?.status || "active",
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.category) {
      toast.error("Please fill all required fields");
      return;
    }
    onSave({
      ...formData,
      capacity: parseInt(formData.capacity) || 20,
      price: parseFloat(formData.price) || 0,
    });
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">
            Class Name
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-white border-gray-300 text-gray-900"
            placeholder="e.g., Morning Yoga"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="bg-white border-gray-300 text-gray-900"
            placeholder="Class description"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700">
              Category
            </label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="Yoga">Yoga</SelectItem>
                <SelectItem value="Zumba">Zumba</SelectItem>
                <SelectItem value="CrossFit">CrossFit</SelectItem>
                <SelectItem value="Pilates">Pilates</SelectItem>
                <SelectItem value="Aerobics">Aerobics</SelectItem>
                <SelectItem value="Spinning">Spinning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700">
              Capacity
            </label>
            <Input
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700">
              Price (₹)
            </label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {classData ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </>
  );
}
