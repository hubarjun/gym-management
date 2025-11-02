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

interface Member {
  _id: string;
  userId: { name: string; email: string };
  membershipType: string;
  expiryDate: string;
  trainerId?: string;
}

interface Exercise {
  _id: string;
  name: string;
  description: string;
  equipment: string;
  muscleGroups: string[];
}

interface WorkoutPlan {
  _id: string;
  name: string;
  description: string;
  memberId?: { userId: { name: string } };
  exercises: any[];
  difficulty: string;
  duration: number;
}

export function TrainerDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [trainerId, setTrainerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [createPlanDialog, setCreatePlanDialog] = useState(false);
  const [viewPlanDialog, setViewPlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    difficulty: "beginner",
    duration: 60,
    exercises: [] as any[],
  });

  const [currentExercise, setCurrentExercise] = useState({
    exerciseId: "",
    sets: 3,
    reps: 10,
    weight: 0,
    restTime: 60,
    notes: "",
  });

  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      router.push("/login");
    } else {
      fetchTrainerId(user.id);
      fetchMembers();
      fetchExercises();
      fetchWorkoutPlans(user.id);
    }
  }, [router]);

  const fetchTrainerId = async (userId: string) => {
    try {
      const response = await fetch("/api/trainers");
      if (response.ok) {
        const trainers = await response.json();
        const trainer = trainers.find(
          (t: any) =>
            t.userId?._id === userId || t.userId?._id?.toString() === userId
        );
        if (trainer) {
          setTrainerId(trainer._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch trainer ID");
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
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await fetch("/api/exercises");
      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          // Auto-seed exercises if empty
          const seedResponse = await fetch("/api/exercises/seed", {
            method: "POST",
          });
          if (seedResponse.ok) {
            const seedData = await seedResponse.json();
            // Fetch exercises again after seeding
            const fetchAgain = await fetch("/api/exercises");
            if (fetchAgain.ok) {
              const newData = await fetchAgain.json();
              setExercises(newData);
              toast.success(
                "Exercise library initialized with default exercises!"
              );
            }
          }
        } else {
          setExercises(data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch exercises");
    }
  };

  const fetchWorkoutPlans = async (trainerId: string) => {
    try {
      const response = await fetch(`/api/workout-plans?trainerId=${trainerId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkoutPlans(data);
      }
    } catch (error) {
      console.error("Failed to fetch workout plans");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const addExerciseToPlan = () => {
    if (!currentExercise.exerciseId) {
      toast.error("Please select an exercise");
      return;
    }
    setNewPlan({
      ...newPlan,
      exercises: [
        ...newPlan.exercises,
        {
          ...currentExercise,
          order: newPlan.exercises.length + 1,
        },
      ],
    });
    setCurrentExercise({
      exerciseId: "",
      sets: 3,
      reps: 10,
      weight: 0,
      restTime: 60,
      notes: "",
    });
    toast.success("Exercise added to plan");
  };

  const removeExerciseFromPlan = (index: number) => {
    setNewPlan({
      ...newPlan,
      exercises: newPlan.exercises.filter((_, i) => i !== index),
    });
  };

  const createWorkoutPlan = async () => {
    if (!newPlan.name || newPlan.exercises.length === 0) {
      toast.error(
        "Please fill all required fields and add at least one exercise"
      );
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    try {
      const response = await fetch("/api/workout-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPlan,
          trainerId: user.id,
          memberId: selectedMember?._id,
          exercises: newPlan.exercises.map((e) => ({
            exerciseId: e.exerciseId,
            sets: parseInt(e.sets),
            reps: parseInt(e.reps),
            weight: e.weight ? parseFloat(e.weight) : undefined,
            restTime: parseInt(e.restTime),
            notes: e.notes,
            order: e.order,
          })),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Workout plan created successfully!");
        setCreatePlanDialog(false);
        setNewPlan({
          name: "",
          description: "",
          difficulty: "beginner",
          duration: 60,
          exercises: [],
        });
        setSelectedMember(null);
        fetchWorkoutPlans(user.id);
      } else {
        toast.error(data.error || "Failed to create workout plan");
      }
    } catch (error) {
      toast.error("Failed to create workout plan");
    }
  };

  const handleCreatePlanForMember = (member: Member) => {
    setSelectedMember(member);
    setCreatePlanDialog(true);
  };

  const handleViewPlan = (plan: WorkoutPlan) => {
    setSelectedPlan(plan);
    setViewPlanDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const assignedMembers = members.filter((m) => {
    if (!trainerId || !m.trainerId) return false;
    const memberTrainerId =
      typeof m.trainerId === "object" &&
      m.trainerId !== null &&
      "_id" in m.trainerId
        ? (m.trainerId as any)._id?.toString() || ""
        : typeof m.trainerId === "string"
        ? m.trainerId
        : "";
    return memberTrainerId === trainerId;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white border-b border-gray-200 p-6 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
        <Button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Logout
        </Button>
      </nav>

      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              My Members
            </TabsTrigger>
            <TabsTrigger
              value="workouts"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              Workout Plans
            </TabsTrigger>
            <TabsTrigger
              value="exercises"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              Exercise Library
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Assigned Members
              </h2>
              <p className="text-gray-600">
                {assignedMembers.length} member
                {assignedMembers.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedMembers.length === 0 ? (
                <Card className="bg-white border border-gray-200 p-6 col-span-full text-center shadow-sm">
                  <p className="text-gray-600">No members assigned yet</p>
                </Card>
              ) : (
                assignedMembers.map((member) => (
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
                    <p className="text-sm mb-4">
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
                    <Button
                      onClick={() => handleCreatePlanForMember(member)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Create Workout Plan
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Workout Plans
              </h2>
              <Button
                onClick={() => {
                  setSelectedMember(null);
                  setCreatePlanDialog(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create New Plan
              </Button>
            </div>
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
                      <span className="text-gray-600">Member:</span>{" "}
                      <span className="text-blue-600 font-medium">
                        {plan.memberId?.userId?.name || "Template"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Exercises:</span>{" "}
                      <span className="text-emerald-600 font-medium">
                        {plan.exercises.length}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Duration:</span>{" "}
                      <span className="text-amber-600 font-medium">
                        {plan.duration} min
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Difficulty:</span>{" "}
                      <span className="text-purple-600 capitalize font-medium">
                        {plan.difficulty}
                      </span>
                    </p>
                  </div>
                  <Button
                    onClick={() => handleViewPlan(plan)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Exercise Library
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((exercise) => (
                <Card
                  key={exercise._id}
                  className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-bold mb-2 text-gray-900">
                    {exercise.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {exercise.description}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      Equipment:{" "}
                      <span className="text-blue-600 font-medium">
                        {exercise.equipment}
                      </span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Muscle Groups:{" "}
                      <span className="text-emerald-600 font-medium">
                        {exercise.muscleGroups?.join(", ")}
                      </span>
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Workout Plan Dialog */}
      <Dialog open={createPlanDialog} onOpenChange={setCreatePlanDialog}>
        <DialogContent className="bg-white text-gray-900 border-gray-200 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {selectedMember
                ? `Create Workout Plan for ${selectedMember.userId?.name}`
                : "Create Workout Plan Template"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Build a custom workout plan with exercises
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">
                Plan Name
              </label>
              <Input
                value={newPlan.name}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, name: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
                placeholder="e.g., Beginner Full Body"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">
                Description
              </label>
              <Textarea
                value={newPlan.description}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, description: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
                placeholder="Workout plan description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  Difficulty
                </label>
                <Select
                  value={newPlan.difficulty}
                  onValueChange={(value) =>
                    setNewPlan({ ...newPlan, difficulty: value })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={newPlan.duration}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      duration: parseInt(e.target.value),
                    })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-bold mb-4 text-gray-900">Add Exercises</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">
                    Exercise
                  </label>
                  <Select
                    value={currentExercise.exerciseId}
                    onValueChange={(value) =>
                      setCurrentExercise({
                        ...currentExercise,
                        exerciseId: value,
                      })
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {exercises.map((ex) => (
                        <SelectItem key={ex._id} value={ex._id}>
                          {ex.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-700">
                      Sets
                    </label>
                    <Input
                      type="number"
                      value={currentExercise.sets}
                      onChange={(e) =>
                        setCurrentExercise({
                          ...currentExercise,
                          sets: parseInt(e.target.value),
                        })
                      }
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-700">
                      Reps
                    </label>
                    <Input
                      type="number"
                      value={currentExercise.reps}
                      onChange={(e) =>
                        setCurrentExercise({
                          ...currentExercise,
                          reps: parseInt(e.target.value),
                        })
                      }
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-700">
                      Weight (kg)
                    </label>
                    <Input
                      type="number"
                      value={currentExercise.weight}
                      onChange={(e) =>
                        setCurrentExercise({
                          ...currentExercise,
                          weight: parseFloat(e.target.value),
                        })
                      }
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-700">
                      Rest (sec)
                    </label>
                    <Input
                      type="number"
                      value={currentExercise.restTime}
                      onChange={(e) =>
                        setCurrentExercise({
                          ...currentExercise,
                          restTime: parseInt(e.target.value),
                        })
                      }
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">
                    Notes
                  </label>
                  <Input
                    value={currentExercise.notes}
                    onChange={(e) =>
                      setCurrentExercise({
                        ...currentExercise,
                        notes: e.target.value,
                      })
                    }
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Optional notes"
                  />
                </div>
                <Button
                  onClick={addExerciseToPlan}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Add Exercise to Plan
                </Button>
              </div>

              <div className="mt-6">
                <h4 className="font-bold mb-2 text-gray-900">
                  Exercises in Plan ({newPlan.exercises.length})
                </h4>
                <div className="space-y-2">
                  {newPlan.exercises.map((ex, index) => {
                    const exercise = exercises.find(
                      (e) => e._id === ex.exerciseId
                    );
                    return (
                      <Card
                        key={index}
                        className="bg-gray-50 border border-gray-200 p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {exercise?.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {ex.sets} sets × {ex.reps} reps
                            {ex.weight ? ` @ ${ex.weight}kg` : ""}
                          </p>
                        </div>
                        <Button
                          onClick={() => removeExerciseFromPlan(index)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setCreatePlanDialog(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={createWorkoutPlan}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Workout Plan Dialog */}
      <Dialog open={viewPlanDialog} onOpenChange={setViewPlanDialog}>
        <DialogContent className="bg-white text-gray-900 border-gray-200 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedPlan?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedPlan?.exercises.map((ex: any, index: number) => (
              <Card
                key={index}
                className="bg-gray-50 border border-gray-200 p-4"
              >
                <h4 className="font-bold mb-2 text-gray-900">
                  {index + 1}. {ex.exerciseId?.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {ex.sets} sets × {ex.reps} reps
                  {ex.weight ? ` @ ${ex.weight}kg` : ""}
                </p>
                {ex.restTime && (
                  <p className="text-xs text-gray-600">
                    Rest: {ex.restTime} seconds
                  </p>
                )}
                {ex.notes && (
                  <p className="text-xs text-gray-600 mt-1">
                    Notes: {ex.notes}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
