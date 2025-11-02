import { connectDB } from "@/lib/db";
import { Trainer } from "@/lib/models/Trainer";
import { User } from "@/lib/models/User";
import { type NextRequest, NextResponse } from "next/server";

// GET all trainers
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get all users with trainer role (exclude admins)
    const trainerUsers = await User.find({ role: "trainer" })
      .select("_id name email role")
      .exec();

    // Filter out any admin users (extra safety check - should not be needed but just in case)
    const validTrainerUsers = trainerUsers.filter((u) => u.role === "trainer");

    // Get trainer records and populate
    const trainers = await Trainer.find()
      .populate({
        path: "userId",
        select: "name email role",
        match: { role: "trainer" }, // Only populate if user is a trainer
      })
      .sort({ createdAt: -1 })
      .exec();

    // Filter out any trainers where userId is null (populate failed) or admin
    const validTrainers = trainers.filter(
      (t) =>
        t.userId &&
        typeof t.userId === "object" &&
        "role" in t.userId &&
        (t.userId as any).role === "trainer"
    );

    // If a user is trainer but no Trainer record exists, create one
    const trainerMap = new Map();
    validTrainers.forEach((t) => {
      if (t.userId && typeof t.userId === "object" && "_id" in t.userId) {
        trainerMap.set((t.userId as any)._id.toString(), t);
      }
    });

    const missingTrainers = [];
    for (const user of validTrainerUsers) {
      if (!trainerMap.has(user._id.toString())) {
        // Create a default trainer record
        const newTrainer = await Trainer.create({
          userId: user._id,
          specialization: "General Fitness",
        });
        await newTrainer.populate({
          path: "userId",
          select: "name email role",
        });
        // Only add if populate succeeded and user is trainer
        if (
          newTrainer.userId &&
          typeof newTrainer.userId === "object" &&
          "role" in newTrainer.userId &&
          (newTrainer.userId as any).role === "trainer"
        ) {
          missingTrainers.push(newTrainer);
        }
      }
    }

    const allTrainers = [...validTrainers, ...missingTrainers];

    return NextResponse.json(allTrainers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch trainers" },
      { status: 500 }
    );
  }
}
