import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/kits - List kits
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('isActive');

    const where: any = {};
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const kits = await prisma.kit.findMany({
      where,
      include: {
        items: {
          include: {
            stockItem: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: kits });
  } catch (error) {
    console.error('Error fetching kits:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch kits' } },
      { status: 500 }
    );
  }
}

// POST /api/kits - Create kit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      code,
      description,
      totalWeight,
      length,
      width,
      height,
      items,
    } = body;

    // Validate required fields
    if (!name || !code || !totalWeight || !length || !width || !height) {
      return NextResponse.json(
        { error: { message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.kit.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: { message: 'Kit code already exists' } },
        { status: 409 }
      );
    }

    const kit = await prisma.kit.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        totalWeight,
        length,
        width,
        height,
        items: {
          create: items?.map((item: any) => ({
            stockItemId: item.stockItemId,
            quantity: item.quantity,
          })) || [],
        },
      },
      include: {
        items: {
          include: {
            stockItem: true,
          },
        },
      },
    });

    return NextResponse.json({ data: kit }, { status: 201 });
  } catch (error) {
    console.error('Error creating kit:', error);
    return NextResponse.json(
      { error: { message: 'Failed to create kit' } },
      { status: 500 }
    );
  }
}
