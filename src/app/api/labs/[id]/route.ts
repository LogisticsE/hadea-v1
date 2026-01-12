import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isEUCountry } from '@/lib/utils/validation';

// GET /api/labs/:id - Get lab detail
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lab = await prisma.lab.findUnique({
      where: { id: params.id },
      include: {
        contacts: {
          where: { isActive: true },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!lab) {
      return NextResponse.json(
        { error: { message: 'Lab not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: lab });
  } catch (error) {
    console.error('Error fetching lab:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch lab' } },
      { status: 500 }
    );
  }
}

// PUT /api/labs/:id - Update lab
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive,
      notes,
    } = body;

    // Check if lab exists
    const existing = await prisma.lab.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: { message: 'Lab not found' } },
        { status: 404 }
      );
    }

    // Check if code is being changed and if it already exists
    if (code && code !== existing.code) {
      const codeExists = await prisma.lab.findUnique({
        where: { code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: { message: 'Lab code already exists' } },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code.toUpperCase();
    if (addressLine1) updateData.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2;
    if (city) updateData.city = city;
    if (stateProvince !== undefined) updateData.stateProvince = stateProvince;
    if (postalCode) updateData.postalCode = postalCode;
    if (countryCode) {
      updateData.countryCode = countryCode.toUpperCase();
      updateData.isEU = isEUCountry(countryCode);
    }
    if (countryName) updateData.countryName = countryName;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (notes !== undefined) updateData.notes = notes;

    const lab = await prisma.lab.update({
      where: { id: params.id },
      data: updateData,
      include: {
        contacts: {
          where: { isActive: true },
        },
      },
    });

    return NextResponse.json({ data: lab });
  } catch (error) {
    console.error('Error updating lab:', error);
    return NextResponse.json(
      { error: { message: 'Failed to update lab' } },
      { status: 500 }
    );
  }
}

// DELETE /api/labs/:id - Delete lab
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lab = await prisma.lab.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!lab) {
      return NextResponse.json(
        { error: { message: 'Lab not found' } },
        { status: 404 }
      );
    }

    // Check if lab has orders
    if (lab._count.orders > 0) {
      return NextResponse.json(
        { error: { message: 'Cannot delete lab with existing orders' } },
        { status: 400 }
      );
    }

    await prisma.lab.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Lab deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab:', error);
    return NextResponse.json(
      { error: { message: 'Failed to delete lab' } },
      { status: 500 }
    );
  }
}
