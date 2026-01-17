import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Check if user is logged in
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { transactionId } = await req.json();

    // 2. Find the transaction
    const transaction = await prisma.recycleTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    if (transaction.isClaimed) {
      return NextResponse.json({ message: "Already claimed!" }, { status: 400 });
    }

    // 3. Calculate Points (Example: 10 points per plastic, 5 per can)
    const pointsToAdd = (transaction.plastic * 10) + (transaction.cans * 5);
    const totalItems = transaction.plastic + transaction.cans;

    // 4. Update Database (User Points + Transaction Status)
    // We use a transaction to ensure both happen or neither happens
    await prisma.$transaction([
      // Update User
      prisma.user.update({
        where: { email: session.user.email },
        data: {
          points: { increment: pointsToAdd },
          recycledCount: { increment: totalItems },
        },
      }),
      // Update Transaction
      prisma.recycleTransaction.update({
        where: { id: transactionId },
        data: {
          isClaimed: true,
          userId: session.user.id, // Link it to this user
        },
      }),
    ]);

    return NextResponse.json({ status: "success", pointsAdded: pointsToAdd });

  } catch (error) {
    console.error("Claim Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}