import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/stock - List stock items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (lowStock === 'true') {
      where.AND = [
        { quantity: { lte: prisma.stockItem.fields.minStockLevel } },
      ];
    }

    const stockItems = await prisma.stockItem.findMany({
      where,
      include: {
        _count: {
          select: { kitItems: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: stockItems });
  } catch (error) {
    console.error('Error fetching stock items:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch stock items' } },
      { status: 500 }
    );
  }
}

// POST /api/stock - Create stock item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      sku,
      description,
      quantity,
      minStockLevel,
      unitPrice,
      unitWeight,
      length,
      width,
      height,
    } = body;

    // Validate required fields
    if (!name || !sku || !unitPrice || !unitWeight) {
      return NextResponse.json(
        { error: { message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existing = await prisma.stockItem.findUnique({
      where: { sku },
    });

    if (existing) {
      return NextResponse.json(
        { error: { message: 'SKU already exists' } },
        { status: 409 }
      );
    }

    const stockItem = await prisma.stockItem.create({
      data: {
        name,
        sku: sku.toUpperCase(),
        description,
        quantity: quantity || 0,
        minStockLevel: minStockLevel || 0,
        unitPrice,
        unitWeight,
        length,
        width,
        height,
      },
    });

    return NextResponse.json({ data: stockItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating stock item:', error);
    return NextResponse.json(
      { error: { message: 'Failed to create stock item' } },
      { status: 500 }
    );
  }
}
