import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { transactionId, plastic, cans, secret } = body;

  if (secret !== process.env.PI_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Update counts and mark as COMPLETED
  await prisma.recycleTransaction.update({
    where: { id: transactionId },
    data: {
      plastic,
      cans,
      status: "COMPLETED" // 👇 This triggers the Phone to show the Receipt
    }
  });

  return NextResponse.json({ success: true });
}