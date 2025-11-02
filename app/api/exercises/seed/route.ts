import { connectDB } from "@/lib/db";
import { Exercise } from "@/lib/models/Exercise";
import { type NextRequest, NextResponse } from "next/server";

const defaultExercises = [
  {
    name: "Bench Press",
    description:
      "Upper body compound exercise targeting chest, shoulders, and triceps",
    muscleGroups: ["chest", "shoulders", "triceps"],
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    name: "Squat",
    description:
      "Lower body compound exercise targeting quadriceps, glutes, and hamstrings",
    muscleGroups: ["legs", "glutes"],
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    name: "Deadlift",
    description:
      "Full body compound exercise targeting back, glutes, and hamstrings",
    muscleGroups: ["back", "legs", "glutes"],
    equipment: "barbell",
    difficulty: "advanced",
  },
  {
    name: "Pull-ups",
    description: "Upper body exercise targeting back and biceps",
    muscleGroups: ["back", "biceps"],
    equipment: "bodyweight",
    difficulty: "intermediate",
  },
  {
    name: "Push-ups",
    description: "Upper body exercise targeting chest, shoulders, and triceps",
    muscleGroups: ["chest", "shoulders", "triceps"],
    equipment: "bodyweight",
    difficulty: "beginner",
  },
  {
    name: "Dumbbell Curls",
    description: "Isolation exercise targeting biceps",
    muscleGroups: ["biceps", "arms"],
    equipment: "dumbbells",
    difficulty: "beginner",
  },
  {
    name: "Shoulder Press",
    description: "Upper body exercise targeting shoulders and triceps",
    muscleGroups: ["shoulders", "triceps"],
    equipment: "dumbbells",
    difficulty: "intermediate",
  },
  {
    name: "Lunges",
    description: "Lower body exercise targeting quadriceps and glutes",
    muscleGroups: ["legs", "glutes"],
    equipment: "bodyweight",
    difficulty: "beginner",
  },
  {
    name: "Plank",
    description: "Core strengthening exercise",
    muscleGroups: ["core"],
    equipment: "bodyweight",
    difficulty: "beginner",
  },
  {
    name: "Lat Pulldown",
    description: "Upper body exercise targeting back and biceps",
    muscleGroups: ["back", "biceps"],
    equipment: "machine",
    difficulty: "beginner",
  },
  {
    name: "Leg Press",
    description: "Lower body exercise targeting quadriceps and glutes",
    muscleGroups: ["legs", "glutes"],
    equipment: "machine",
    difficulty: "beginner",
  },
  {
    name: "Romanian Deadlift",
    description: "Lower body exercise targeting hamstrings and glutes",
    muscleGroups: ["legs", "glutes"],
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    name: "Overhead Press",
    description: "Upper body exercise targeting shoulders and triceps",
    muscleGroups: ["shoulders", "triceps"],
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    name: "Dips",
    description: "Upper body exercise targeting triceps and chest",
    muscleGroups: ["triceps", "chest"],
    equipment: "bodyweight",
    difficulty: "intermediate",
  },
  {
    name: "Crunches",
    description: "Core exercise targeting abdominal muscles",
    muscleGroups: ["core"],
    equipment: "bodyweight",
    difficulty: "beginner",
  },
];

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check if exercises already exist
    const existingCount = await Exercise.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({
        message: "Exercises already seeded",
        count: existingCount,
      });
    }

    // Create exercises
    const exercises = await Exercise.insertMany(defaultExercises);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${exercises.length} exercises`,
      exercises,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to seed exercises" },
      { status: 500 }
    );
  }
}
