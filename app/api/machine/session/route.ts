import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const body = await req.json();
  const { action, binId, transactionId } = body;
  
  // Check if user is logged in (Optional)
  const session = await getServerSession(authOptions);

  // --- 1. START SESSION (User clicks Start) ---
  if (action === "START") {
    // Check if machine is busy (ignore old stuck sessions > 5 mins)
    const busy = await prisma.recycleTransaction.findFirst({
      where: { 
        binId, 
        status: { in: ["WAITING", "ACTIVE", "FINISHING"] },
        createdAt: { gt: new Date(Date.now() - 1000 * 60 * 5) } 
      }
    });

    if (busy) {
      return NextResponse.json({ error: "Machine is currently in use. Please wait." }, { status: 409 });
    }

    // Create the session
    const newTx = await prisma.recycleTransaction.create({
      data: {
        binId,
        status: "WAITING", // Waiting for Pi to pick it up
        // If logged in, link user immediately. If guest, keep null.
        userId: session?.user?.id || null, 
        isClaimed: !!session?.user?.id, 
      }
    });

    return NextResponse.json({ success: true, transactionId: newTx.id });
  }

  // --- 2. STOP SESSION (User clicks Finish) ---
  if (action === "STOP" && transactionId) {
    await prisma.recycleTransaction.update({
      where: { id: transactionId },
      data: { status: "FINISHING" } // Signals Pi to stop motors & send data
    });
    return NextResponse.json({ success: true });
  }

  // --- 3. CHECK STATUS (Phone polling for results) ---
  if (action === "CHECK" && transactionId) {
    const tx = await prisma.recycleTransaction.findUnique({
      where: { id: transactionId }
    });
    
    if (!tx) return NextResponse.json({ status: "ERROR" });

    // ONLY return the secret (digital receipt) if the job is truly done
    if (tx.status === "COMPLETED") {
      return NextResponse.json({ 
        status: "COMPLETED", 
        plastic: tx.plastic, 
        cans: tx.cans,
        claimSecret: tx.claimSecret // 👇 The key to claim points!
      });
    }
    
    return NextResponse.json({ status: tx.status });
  }

  return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
}