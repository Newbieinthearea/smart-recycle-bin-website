import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authOptions } from "../../auth/[...nextauth]/route"; // Import your auth options

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  

  const { name, image, currentPassword, newPassword } = await req.json();

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // 1. Update Name
    if (name && name !== user.name) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { name, image },
      });
    }

    // 2. Update Password (Only if provided)
    if (newPassword) {
      // If the user signed up with Google, they might not have a password yet.
      // If they DO have a password, we must verify the old one first.
      if (user.password) {
        if (!currentPassword) {
          return NextResponse.json({ message: "Current password is required" }, { status: 400 });
        }
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
          return NextResponse.json({ message: "Incorrect current password" }, { status: 400 });
        }
      }

      // Hash and save new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { email: session.user.email },
        data: { password: hashedPassword },
      });
    }

    return NextResponse.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}