import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/labs/:id/contacts - Create lab contact
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, phone, department, isPrimary } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: { message: 'Name and email are required' } },
        { status: 400 }
      );
    }

    // Check if lab exists
    const lab = await prisma.lab.findUnique({
      where: { id: params.id },
    });

    if (!lab) {
      return NextResponse.json(
        { error: { message: 'Lab not found' } },
        { status: 404 }
      );
    }

    // If this is set as primary, unset other primary contacts
    if (isPrimary) {
      await prisma.labContact.updateMany({
        where: {
          labId: params.id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    const contact = await prisma.labContact.create({
      data: {
        labId: params.id,
        name,
        email,
        phone,
        department,
        isPrimary: isPrimary || false,
      },
    });

    return NextResponse.json({ data: contact }, { status: 201 });
  } catch (error) {
    console.error('Error creating lab contact:', error);
    return NextResponse.json(
      { error: { message: 'Failed to create contact' } },
      { status: 500 }
    );
  }
}
