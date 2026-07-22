import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { image: true },
    });

    if (!user || !user.image) {
      return new NextResponse(null, { status: 404 });
    }

    // If it's a base64 image, extract the data and serve it directly
    const match = user.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        },
      });
    }

    // If it's a standard URL, just redirect to it
    return NextResponse.redirect(user.image);
    
  } catch (error) {
    console.error("Avatar fetch error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
