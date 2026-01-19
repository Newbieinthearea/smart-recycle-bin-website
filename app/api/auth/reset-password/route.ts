import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Use shared connection
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }

    // 1. Find User by Token AND Check Expiry
    // We look for a user who has this specific token, AND the token hasn't expired yet
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // "gt" means Greater Than (future)
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired link" }, { status: 400 });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update User & Clear Token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,       // Clear it so it can't be used again
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}