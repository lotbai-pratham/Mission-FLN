import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { image: true },
    });

    if (!user || !user.image) {
      return new NextResponse(null, { status: 404 });
    }

    // If it's a base64 image, extract the data and serve it directly
    if (user.image.startsWith('data:')) {
      try {
        const [header, base64Data] = user.image.split(',');
        const mimeType = header.split(':')[1].split(';')[0];
        const buffer = Buffer.from(base64Data, 'base64');
        
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
          },
        });
      } catch (e) {
        return new NextResponse("Invalid image format", { status: 400 });
      }
    }

    // If it's a standard URL, just redirect to it
    return NextResponse.redirect(user.image);
    
  } catch (error) {
    console.error("Avatar fetch error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
