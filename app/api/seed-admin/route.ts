import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Replace this email with YOUR email you use to login
  const myEmail = "ly.buntheng.dev@gmail.com"; 

  await prisma.user.update({
    where: { email: myEmail },
    data: { role: "ADMIN" },
  });

  return NextResponse.json({ message: `Success! ${myEmail} is now an Admin.` });
}