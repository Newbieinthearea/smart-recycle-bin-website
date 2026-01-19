import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Import your options
import { prisma } from "@/lib/prisma"; // Make sure you have a shared prisma instance
import { nanoid } from "nanoid"; // Install this: npm i nanoid

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rewardId } = await req.json();

  // Start a transaction (All or Nothing)
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get User and Reward details
      const user = await tx.user.findUnique({ where: { id: session.user.id } });
      const reward = await tx.reward.findUnique({ where: { id: rewardId } });

      if (!reward || !user) throw new Error("Not found");
      if (user.points < reward.cost) throw new Error("Not enough points");
      if (reward.stock <= 0) throw new Error("Out of stock");

      // 2. Deduct Points & Decrease Stock
      await tx.user.update({
        where: { id: user.id },
        data: { points: user.points - reward.cost },
      });

      await tx.reward.update({
        where: { id: rewardId },
        data: { stock: reward.stock - 1 },
      });

      // 3. Generate Secret Code (e.g., "ECO-8J2K")
      const code = `ECO-${nanoid(6).toUpperCase()}`;

      // 4. Create Receipt
      return await tx.redemption.create({
        data: {
          userId: user.id,
          rewardId: reward.id,
          uniqueCode: code,
          status: "PENDING",
        },
      });
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}