import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch all data for the dashboard (Redemptions, Rewards, AND Bins)
export async function GET() {
  const session = await getServerSession(authOptions);
  
  // 🔒 SECURITY: Only Admins allowed
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [redemptions, rewards, bins] = await prisma.$transaction([
      // 1. Fetch Redemptions
      prisma.redemption.findMany({
        include: { user: true, reward: true },
        orderBy: { createdAt: "desc" },
      }),
      // 2. Fetch Rewards
      prisma.reward.findMany({
        orderBy: { name: "asc" },
      }),
      // 3. Fetch Bins [NEW]
      prisma.bin.findMany({
        orderBy: { id: "asc" }
      })
    ]);

    return NextResponse.json({ redemptions, rewards, bins });
  } catch (error) {
    console.error("Dashboard Data Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// POST: Create a new Reward
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const reward = await prisma.reward.create({
      data: {
        name: data.name,
        description: data.description,
        cost: parseInt(data.cost),
        stock: parseInt(data.stock),
        image: data.image || null,
      },
    });

    return NextResponse.json(reward);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create reward" }, { status: 500 });
  }
}

// PUT: Update an existing Reward
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const updatedReward = await prisma.reward.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        cost: parseInt(data.cost),
        stock: parseInt(data.stock),
        image: data.image || null,
      },
    });
    return NextResponse.json(updatedReward);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update reward" }, { status: 500 });
  }
}

// DELETE: Remove a Reward
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await prisma.reward.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    // This happens if users have already redeemed this reward (Foreign Key Constraint)
    return NextResponse.json(
      { error: "Cannot delete: This reward has already been claimed by users." }, 
      { status: 400 }
    );
  }
}