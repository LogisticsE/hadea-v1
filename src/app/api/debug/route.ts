import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint helps diagnose Azure deployment issues
  const info = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? '***SET***' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***SET***' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    },
    cwd: process.cwd(),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(info, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
