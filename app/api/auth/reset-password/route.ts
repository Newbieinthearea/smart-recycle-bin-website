import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
        return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }

    // 1. Find the token in DB
    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
    });

    // 2. Validate token (Check existence AND expiration)
    if (!resetToken || resetToken.expires < new Date()) {
        return NextResponse.json({ message: "Invalid or expired link. Please request a new one." }, { status: 400 });
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update the User's password
    await prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
    });

    // 5. Delete the used token (One-time use)
    await prisma.passwordResetToken.delete({
        where: { token },
    });

    return NextResponse.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}