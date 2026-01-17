import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 👇 DEFINING THE SECRET KEY HERE
// In a real app, you'd use process.env.PI_SECRET, but hardcoding is fine for now.
const mySecret = process.env.PI_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plastic, cans, binId, secretKey } = body;

    // 1. SECURITY CHECK
    // If the Pi sends the wrong password, we reject it.
    if (secretKey !== mySecret) {
      return NextResponse.json({ message: "Unauthorized: Wrong Secret Key" }, { status: 401 });
    }

    // 2. SAVE TO DATABASE
    const transaction = await prisma.recycleTransaction.create({
      data: {
        plastic,
        cans,
        binId,
        isClaimed: false, // Default is false until user scans QR
      },
    });

    // 3. GENERATE THE QR LINK
    // This is the link the user will visit on their phone
    const qrUrl = `${process.env.NEXTAUTH_URL}/claim/${transaction.id}`;

    return NextResponse.json({ 
      status: "success", 
      transactionId: transaction.id,
      qrUrl: qrUrl 
    });

  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}