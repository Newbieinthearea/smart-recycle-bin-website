import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // 1. Security Check: Must be Admin
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { uniqueCode } = await req.json();

    // 2. Find the Redemption
    const redemption = await prisma.redemption.findUnique({
      where: { uniqueCode },
      include: { user: true, reward: true },
    });

    if (!redemption) {
      return NextResponse.json({ error: "Invalid Code" }, { status: 404 });
    }

    // 3. Check Status
    if (redemption.status === "COMPLETED") {
      return NextResponse.json({ error: "This code has already been used!" }, { status: 400 });
    }

    // 4. Mark as Completed
    await prisma.redemption.update({
      where: { id: redemption.id },
      data: { status: "COMPLETED" },
    });

    // 5. Success Response
    return NextResponse.json({
      success: true,
      userName: redemption.user.name,
      rewardName: redemption.reward.name,
    });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}