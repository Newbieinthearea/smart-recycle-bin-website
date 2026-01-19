import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch all data for the dashboard
export async function GET() {
  const session = await getServerSession(authOptions);
  
  // 🔒 SECURITY: Only Admins allowed
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [redemptions, rewards] = await prisma.$transaction([
    prisma.redemption.findMany({
      include: { user: true, reward: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reward.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ redemptions, rewards });
}

// POST: Create a new Reward
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // 🔒 SECURITY: Only Admins allowed
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
}
// ... (Keep existing imports, GET and POST functions)

// 👇 1. UPDATE REWARD (PUT)
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  try {
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
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// 👇 2. DELETE REWARD (DELETE)
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    return NextResponse.json({ error: "Cannot delete: This reward has already been claimed by users." }, { status: 400 });
  }
}