import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Security: You might want to check if session.user.email === "your-admin-email@gmail.com"
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { code } = await req.json(); // The "ECO-XYZ" code

    // 1. Find the redemption
    const redemption = await prisma.redemption.findUnique({
      where: { uniqueCode: code },
      include: { reward: true, user: true } // Get details to show in response
    });

    if (!redemption) return NextResponse.json({ error: "Invalid Code" }, { status: 404 });
    if (redemption.status === "COMPLETED") return NextResponse.json({ error: "Already Claimed!" }, { status: 400 });

    // 2. Mark as Completed
    const updated = await prisma.redemption.update({
      where: { id: redemption.id },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({ 
      success: true, 
      item: redemption.reward.name, 
      user: redemption.user.name 
    });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}