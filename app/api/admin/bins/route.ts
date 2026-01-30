import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch only bin status data
export async function GET() {
  const session = await getServerSession(authOptions);
  
  // 🔒 SECURITY: Only Admins allowed
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bins = await prisma.bin.findMany({
      orderBy: { id: "asc" }
    });

    return NextResponse.json({ bins });
  } catch (error) {
    console.error("Bin Data Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch bin data" }, { status: 500 });
  }
}
