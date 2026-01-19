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