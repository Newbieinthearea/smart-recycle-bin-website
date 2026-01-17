import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1. Check if user exists in the database
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Security measure: Even if user is not found, we return "Success" 
    // so hackers cannot scan your database to see which emails are registered.
    if (!user) {
      return NextResponse.json({ message: "If an account exists, we have sent a link." });
    }

    // 2. Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // Token valid for 1 hour

    // 3. Save the token to the database
    // We delete old tokens for this email first to keep it clean
    await prisma.passwordResetToken.deleteMany({ where: { email } });
    
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // 4. Configure the Email Sender (Your System Email)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,        // Your Gmail
        pass: process.env.GMAIL_APP_PASSWORD // Your App Password
      },
    });

    // 5. Create the Reset Link
    // Uses ngrok URL if testing, or localhost
    const baseUrl = process.env.NEXTAUTH_URL || "https://predefrayal-celsa-turbidly.ngrok-free.dev";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // 6. Send the Email to the USER
    await transporter.sendMail({
      from: `"EcoBin Support" <${process.env.GMAIL_USER}>`, // Sender (You)
      to: email,                                            // Receiver (The User)
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Reset Password</h2>
          <p>Hi ${user.name || "there"},</p>
          <p>We received a request to reset the password for your account.</p>
          <p>Click the button below to choose a new password:</p>
          <br>
          <a href="${resetLink}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
          <br><br>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "If an account exists, we have sent a link." });

  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
  }
}