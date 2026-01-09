import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Prisma Client is available
    let prismaAvailable = false;
    let prismaError = null;
    try {
      const { prisma } = await import('@/lib/db');
      await prisma.$queryRaw`SELECT 1`;
      prismaAvailable = true;
    } catch (error: any) {
      prismaError = error?.message || 'Unknown error';
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        PORT: process.env.PORT || 'not set',
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'not set',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
      },
      prisma: {
        available: prismaAvailable,
        error: prismaError,
      },
      nodeVersion: process.version,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
