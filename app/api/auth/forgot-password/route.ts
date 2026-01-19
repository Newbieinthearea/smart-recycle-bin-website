import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 👈 Use the shared connection
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1. Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });

    // Security: Return success even if user not found (prevents email scanning)
    if (!user) {
      return NextResponse.json({ message: "If an account exists, we have sent a link." });
    }

    // 2. Generate Token & Expiry
    const token = crypto.randomBytes(32).toString("hex");
    // Token valid for 1 hour (3600000 ms)
    const expires = new Date(Date.now() + 3600000); 

    // 3. Save Token to User Profile
    // We update the existing User instead of creating a new row in a separate table
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expires,
      },
    });

    // 4. Configure Email Sender
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "buntonggt00@gmail.com", // 👈 Matches your .env
        pass: "rmatxitfbtcbxscq"  // 👈 Matches your .env
      },
    });

    // 5. Create Link
    // In production (Vercel), NEXTAUTH_URL is automatically set to your domain.
    // Fallback is only for local dev.
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // 6. Send Email
    await transporter.sendMail({
      from: `"EcoBin Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - EcoBin",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #16a34a;">Reset Password</h2>
          <p>Hi ${user.name || "there"},</p>
          <p>Click the button below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetLink}" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "If an account exists, we have sent a link." });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}