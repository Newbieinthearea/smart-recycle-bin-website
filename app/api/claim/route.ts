import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache"; // 👈 CRITICAL IMPORT

export async function POST(req: Request) {
  // 1. Verify User Session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get Data from Request
  const { transactionId, secret } = await req.json();

  // 3. Find the Transaction
  const tx = await prisma.recycleTransaction.findUnique({
    where: { id: transactionId }
  });

  if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  if (tx.isClaimed) return NextResponse.json({ error: "Already claimed" }, { status: 400 });

  // 4. Security Check (Compare Secrets)
  if (tx.claimSecret && tx.claimSecret !== secret) {
     return NextResponse.json({ error: "Invalid QR Code" }, { status: 403 });
  }

  // 5. Calculate Points
  // Logic: Plastic = 10 pts, Cans = 15 pts
  const pointsEarned = (tx.plastic * 10) + (tx.cans * 15);

  // 6. Update Database (Atomic Transaction)
  await prisma.$transaction([
    // A. Mark transaction as claimed
    prisma.recycleTransaction.update({
      where: { id: transactionId },
      data: { 
        isClaimed: true,
        userId: session.user.id // Connect to the user
      }
    }),
    // B. Add points to User Wallet
    prisma.user.update({
      where: { email: session.user.email },
      data: { points: { increment: pointsEarned } }
    })
  ]);

  // 7. ⚡ FIX THE DASHBOARD LAG ⚡
  // This purges the cache for the home page so the new points show up instantly.
  revalidatePath("/");

  return NextResponse.json({ success: true, points: pointsEarned });
}