import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isEUCountry } from '@/lib/utils/validation';

// GET /api/labs - List labs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const labs = await prisma.lab.findMany({
      where,
      include: {
        contacts: {
          where: { isActive: true },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: labs });
  } catch (error) {
    console.error('Error fetching labs:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch labs' } },
      { status: 500 }
    );
  }
}

// POST /api/labs - Create lab
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      code,
      addressLine1,
      addressLine2,
      city,
      stateProvince,
      postalCode,
      countryCode,
      countryName,
      notes,
    } = body;

    // Validate required fields
    if (!name || !code || !addressLine1 || !city || !postalCode || !countryCode || !countryName) {
      return NextResponse.json(
        { error: { message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.lab.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: { message: 'Lab code already exists' } },
        { status: 409 }
      );
    }

    const lab = await prisma.lab.create({
      data: {
        name,
        code: code.toUpperCase(),
        addressLine1,
        addressLine2,
        city,
        stateProvince,
        postalCode,
        countryCode: countryCode.toUpperCase(),
        countryName,
        isEU: isEUCountry(countryCode),
        notes,
      },
    });

    return NextResponse.json({ data: lab }, { status: 201 });
  } catch (error) {
    console.error('Error creating lab:', error);
    return NextResponse.json(
      { error: { message: 'Failed to create lab' } },
      { status: 500 }
    );
  }
}
