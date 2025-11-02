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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Member {
  _id: string;
  membershipType: string;
  expiryDate: string;
  trainerId?: string;
}

interface ClassType {
  _id: string;
  name: string;
  description: string;
  category: string;
  schedule: any[];
  capacity: number;
  price: number;
  instructorId: any;
}

interface BookingType {
  _id: string;
  classId: ClassType;
  date: string;
  status: string;
}

interface WorkoutPlan {
  _id: string;
  name: string;
  description: string;
  exercises: any[];
  difficulty: string;
  duration: number;
}

interface WorkoutSession {
  _id: string;
  date: string;
  exercises: any[];
  completed: boolean;
  duration?: number;
}

interface ProgressRecord {
  _id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  measurements?: any;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  amount: number;
  totalAmount: number;
  description: string;
  status: string;
  dueDate: string;
  paidDate?: string;
}

export function MemberDashboard() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Dialogs
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Data states
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Form states
  const [selectedMembershipType, setSelectedMembershipType] =
    useState("monthly");
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [progressForm, setProgressForm] = useState({
    weight: "",
    bodyFat: "",
    chest: "",
    waist: "",
    arms: "",
  });

  const [renewing, setRenewing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      router.push("/login");
    } else {
      fetchMemberData(user.id);
      fetchClasses();
      fetchBookings();
      fetchWorkoutPlans();
      fetchWorkoutSessions();
      fetchProgressRecords();
      fetchInvoices();
    }
  }, [router]);

  const fetchMemberData = async (userId: string) => {
    try {
      const response = await fetch(`/api/members?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMember(data);
      }
    } catch (error) {
      console.error("Error fetching member data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes?status=active");
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchBookings = async () => {
    if (!member?._id) return;
    try {
      const response = await fetch(`/api/bookings?memberId=${member._id}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchWorkoutPlans = async () => {
    if (!member?._id) return;
    try {
      const response = await fetch(`/api/workout-plans?memberId=${member._id}`);
      if (response.ok) {
        const data = await response.json();
        setWorkoutPlans(data);
      }
    } catch (error) {
      console.error("Error fetching workout plans:", error);
    }
  };

  const fetchWorkoutSessions = async () => {
    if (!member?._id) return;
    try {
      const response = await fetch(
        `/api/workout-sessions?memberId=${member._id}`
      );
      if (response.ok) {
        const data = await response.json();
        setWorkoutSessions(data);
      }
    } catch (error) {
      console.error("Error fetching workout sessions:", error);
    }
  };

  const fetchProgressRecords = async () => {
    if (!member?._id) return;
    try {
      const response = await fetch(`/api/progress?memberId=${member._id}`);
      if (response.ok) {
        const data = await response.json();
        setProgressRecords(data);
      }
    } catch (error) {
      console.error("Error fetching progress records:", error);
    }
  };

  const fetchInvoices = async () => {
    if (!member?._id) return;
    try {
      const response = await fetch(`/api/invoices?memberId=${member._id}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  useEffect(() => {
    if (member?._id) {
      fetchBookings();
      fetchWorkoutPlans();
      fetchWorkoutSessions();
      fetchProgressRecords();
      fetchInvoices();
    }
  }, [member]);

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
      const response = await fetch("/api/attendance/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member._id }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("✅ Attendance logged successfully!", {
          description: `Logged at ${new Date().toLocaleTimeString()}`,
          duration: 5000,
        });
      } else {
        toast.error(data.error || "Failed to log attendance");
      }
    } catch (error) {
      toast.error("Failed to log attendance");
    }
  };

  const handleRenewal = () => {
    setRenewDialogOpen(true);
  };

  const confirmRenewal = async () => {
    if (!member?._id) return;
    setRenewing(true);
    try {
      const amount = selectedMembershipType === "monthly" ? 1000 : 10000;
      const response = await fetch("/api/payments/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.id) await fetchMemberData(user.id);
        fetchInvoices();
      } else {
        toast.error(data.error || "Renewal failed");
      }
    } catch (error) {
      toast.error("Renewal failed");
    } finally {
      setRenewing(false);
    }
  };

  const handleBookClass = (classItem: ClassType) => {
    setSelectedClass(classItem);
    setClassDialogOpen(true);
  };

  const confirmBooking = async () => {
    if (!member?._id || !selectedClass) return;
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member._id,
          classId: selectedClass._id,
          date: selectedDate.toISOString(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Class booked successfully!");
        setClassDialogOpen(false);
        fetchBookings();
      } else {
        toast.error(data.error || "Failed to book class");
      }
    } catch (error) {
      toast.error("Failed to book class");
    }
  };

  const handleStartWorkout = async (planId: string) => {
    if (!member?._id) return;
    try {
      const response = await fetch("/api/workout-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member._id,
          workoutPlanId: planId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Workout started!");
        setWorkoutDialogOpen(true);
        fetchWorkoutSessions();
      }
    } catch (error) {
      toast.error("Failed to start workout");
    }
  };

  const handleSaveProgress = async () => {
    if (!member?._id) return;
    try {
      const measurements: any = {};
      if (progressForm.chest)
        measurements.chest = parseFloat(progressForm.chest);
      if (progressForm.waist)
        measurements.waist = parseFloat(progressForm.waist);
      if (progressForm.arms) measurements.arms = parseFloat(progressForm.arms);

      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member._id,
          weight: progressForm.weight
            ? parseFloat(progressForm.weight)
            : undefined,
          bodyFat: progressForm.bodyFat
            ? parseFloat(progressForm.bodyFat)
            : undefined,
          measurements:
            Object.keys(measurements).length > 0 ? measurements : undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Progress saved successfully!");
        setProgressDialogOpen(false);
        setProgressForm({
          weight: "",
          bodyFat: "",
          chest: "",
          waist: "",
          arms: "",
        });
        fetchProgressRecords();
      }
    } catch (error) {
      toast.error("Failed to save progress");
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        toast.success("Booking cancelled");
        fetchBookings();
      }
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  const expiryDate = member?.expiryDate ? new Date(member.expiryDate) : null;
  const daysUntilExpiry = expiryDate
    ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  // Prepare progress chart data
  const progressChartData = progressRecords
    .filter((r) => r.weight)
    .slice(-30)
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString(),
      weight: r.weight,
      bodyFat: r.bodyFat,
    }));

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
        <h1 className="text-2xl font-bold text-gray-900">Member Dashboard</h1>
        <Button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Logout
        </Button>
      </nav>

      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="classes"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              Classes
            </TabsTrigger>
            <TabsTrigger
              value="workouts"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              Workouts
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              Progress
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Membership Info
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Membership Type</p>
                    <p className="text-lg font-semibold text-blue-600 capitalize">
                      {member?.membershipType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Expiry Date</p>
                    <p className="text-lg font-semibold text-amber-600">
                      {expiryDate?.toLocaleDateString() || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Days Until Expiry</p>
                    <p
                      className={`text-lg font-semibold ${
                        daysUntilExpiry < 7
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {daysUntilExpiry > 0
                        ? `${daysUntilExpiry} days`
                        : "Expired"}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Button
                    onClick={handleAttendance}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Log Attendance
                  </Button>
                  <Button
                    onClick={handleRenewal}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Renew Membership
                  </Button>
                  <Button
                    onClick={() => setProgressDialogOpen(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Log Progress
                  </Button>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  Upcoming Classes
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {bookings.filter((b) => b.status === "confirmed").length}
                </p>
              </Card>
              <Card className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  Workout Plans
                </h3>
                <p className="text-3xl font-bold text-emerald-600">
                  {workoutPlans.length}
                </p>
              </Card>
              <Card className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  Completed Sessions
                </h3>
                <p className="text-3xl font-bold text-amber-600">
                  {workoutSessions.filter((s) => s.completed).length}
                </p>
              </Card>
            </div>

            {progressChartData.length > 0 && (
              <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Progress Trend
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Classes
              </h2>
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
                  <p className="text-sm mb-2">
                    <span className="text-gray-600">Category:</span>{" "}
                    <span className="text-blue-600 font-medium">
                      {classItem.category}
                    </span>
                  </p>
                  <p className="text-sm mb-2">
                    <span className="text-gray-600">Price:</span>{" "}
                    <span className="text-emerald-600 font-medium">
                      ₹{classItem.price}
                    </span>
                  </p>
                  <Button
                    onClick={() => handleBookClass(classItem)}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Book Class
                  </Button>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                My Bookings
              </h2>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card
                    key={booking._id}
                    className="bg-white border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900">
                          {booking.classId?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          Status:{" "}
                          <span
                            className={
                              booking.status === "confirmed"
                                ? "text-emerald-600 font-medium"
                                : "text-red-600 font-medium"
                            }
                          >
                            {booking.status}
                          </span>
                        </p>
                      </div>
                      {booking.status === "confirmed" && (
                        <Button
                          onClick={() => cancelBooking(booking._id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900">
              My Workout Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workoutPlans.map((plan) => (
                <Card
                  key={plan._id}
                  className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="text-gray-600">Exercises:</span>{" "}
                      <span className="text-blue-600 font-medium">
                        {plan.exercises.length}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Duration:</span>{" "}
                      <span className="text-emerald-600 font-medium">
                        {plan.duration} min
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Difficulty:</span>{" "}
                      <span className="text-amber-600 capitalize font-medium">
                        {plan.difficulty}
                      </span>
                    </p>
                  </div>
                  <Button
                    onClick={() => handleStartWorkout(plan._id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Start Workout
                  </Button>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Workout History
              </h2>
              <div className="space-y-4">
                {workoutSessions.map((session) => (
                  <Card
                    key={session._id}
                    className="bg-white border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900">
                          {new Date(session.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.exercises.length} exercises
                        </p>
                        {session.duration && (
                          <p className="text-sm text-emerald-600 font-medium">
                            Duration: {session.duration} min
                          </p>
                        )}
                      </div>
                      <span
                        className={
                          session.completed
                            ? "text-emerald-600 font-medium"
                            : "text-amber-600 font-medium"
                        }
                      >
                        {session.completed ? "Completed" : "In Progress"}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Progress</h2>
              <Button
                onClick={() => setProgressDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Progress
              </Button>
            </div>

            {progressChartData.length > 0 && (
              <Card className="bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Weight Progress
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" />
                    {progressChartData.some((d) => d.bodyFat) && (
                      <Line
                        type="monotone"
                        dataKey="bodyFat"
                        stroke="#ef4444"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {progressRecords.map((record) => (
                <Card
                  key={record._id}
                  className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold mb-2 text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </h3>
                  {record.weight && (
                    <p className="text-sm mb-1">
                      <span className="text-gray-600">Weight:</span>{" "}
                      <span className="text-blue-600 font-medium">
                        {record.weight} kg
                      </span>
                    </p>
                  )}
                  {record.bodyFat && (
                    <p className="text-sm mb-1">
                      <span className="text-gray-600">Body Fat:</span>{" "}
                      <span className="text-red-600 font-medium">
                        {record.bodyFat}%
                      </span>
                    </p>
                  )}
                  {record.measurements && (
                    <div className="mt-2 space-y-1">
                      {record.measurements.chest && (
                        <p className="text-xs text-gray-600">
                          Chest: {record.measurements.chest} cm
                        </p>
                      )}
                      {record.measurements.waist && (
                        <p className="text-xs text-gray-600">
                          Waist: {record.measurements.waist} cm
                        </p>
                      )}
                      {record.measurements.arms && (
                        <p className="text-xs text-gray-600">
                          Arms: {record.measurements.arms} cm
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Payment History
            </h2>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card
                  key={invoice._id}
                  className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {invoice.description}
                      </p>
                      <p className="text-sm mt-2 text-gray-600">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">
                        ₹{invoice.totalAmount}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          invoice.status === "paid"
                            ? "text-emerald-600"
                            : invoice.status === "overdue"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Renew Membership Dialog */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent className="bg-white text-gray-900 border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Renew Membership
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Select a membership plan to renew
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">
                Membership Type
              </label>
              <Select
                value={selectedMembershipType}
                onValueChange={setSelectedMembershipType}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="monthly">Monthly (₹1,000)</SelectItem>
                  <SelectItem value="yearly">Yearly (₹10,000)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setRenewDialogOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRenewal}
              disabled={renewing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {renewing ? "Processing..." : "Confirm Renewal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book Class Dialog */}
      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent className="bg-white text-gray-900 border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Book Class</DialogTitle>
            <DialogDescription className="text-gray-600">
              Select a date for {selectedClass?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setClassDialogOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBooking}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent className="bg-white text-gray-900 border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Log Progress</DialogTitle>
            <DialogDescription className="text-gray-600">
              Record your fitness progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">
                Weight (kg)
              </label>
              <Input
                type="number"
                value={progressForm.weight}
                onChange={(e) =>
                  setProgressForm({ ...progressForm, weight: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">
                Body Fat (%)
              </label>
              <Input
                type="number"
                value={progressForm.bodyFat}
                onChange={(e) =>
                  setProgressForm({ ...progressForm, bodyFat: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  Chest (cm)
                </label>
                <Input
                  type="number"
                  value={progressForm.chest}
                  onChange={(e) =>
                    setProgressForm({ ...progressForm, chest: e.target.value })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  Waist (cm)
                </label>
                <Input
                  type="number"
                  value={progressForm.waist}
                  onChange={(e) =>
                    setProgressForm({ ...progressForm, waist: e.target.value })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  Arms (cm)
                </label>
                <Input
                  type="number"
                  value={progressForm.arms}
                  onChange={(e) =>
                    setProgressForm({ ...progressForm, arms: e.target.value })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setProgressDialogOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProgress}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
