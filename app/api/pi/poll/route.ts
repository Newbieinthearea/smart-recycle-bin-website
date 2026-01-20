import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const binId = searchParams.get("binId");
  const secret = searchParams.get("secret");

  // Simple security check for the Pi
  if (secret !== process.env.PI_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find active job
  const job = await prisma.recycleTransaction.findFirst({
    where: { 
      binId: binId!, 
      status: { in: ["WAITING", "FINISHING"] } // Only care about status changes
    },
  });

  if (!job) return NextResponse.json({ command: "IDLE" });

  // 1. User clicked Start -> Tell Pi to START
  if (job.status === "WAITING") {
    // Mark as ACTIVE so we don't send start command repeatedly
    await prisma.recycleTransaction.update({
      where: { id: job.id },
      data: { status: "ACTIVE" }
    });
    return NextResponse.json({ command: "START", transactionId: job.id });
  }

  // 2. User clicked Finish -> Tell Pi to STOP
  if (job.status === "FINISHING") {
    return NextResponse.json({ command: "STOP", transactionId: job.id });
  }

  return NextResponse.json({ command: "IDLE" });
}