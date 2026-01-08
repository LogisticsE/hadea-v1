import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/stock/:id/adjust - Adjust stock quantity
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { quantityChange, notes } = body;

    if (quantityChange === undefined || quantityChange === 0) {
      return NextResponse.json(
        { error: { message: 'Quantity change is required and must be non-zero' } },
        { status: 400 }
      );
    }

    const stockItem = await prisma.stockItem.findUnique({
      where: { id: params.id },
    });

    if (!stockItem) {
      return NextResponse.json(
        { error: { message: 'Stock item not found' } },
        { status: 404 }
      );
    }

    // Check if adjustment would result in negative quantity
    const newQuantity = stockItem.quantity + quantityChange;
    if (newQuantity < 0) {
      return NextResponse.json(
        { error: { message: 'Adjustment would result in negative quantity' } },
        { status: 400 }
      );
    }

    // Perform adjustment in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.stockItem.update({
        where: { id: params.id },
        data: {
          quantity: newQuantity,
        },
      });

      await tx.stockMovement.create({
        data: {
          stockItemId: params.id,
          quantityChange,
          movementType: quantityChange > 0 ? 'MANUAL_INCREASE' : 'MANUAL_DECREASE',
          notes: notes || 'Manual adjustment',
        },
      });

      return updated;
    });

    return NextResponse.json({
      data: result,
      message: 'Stock adjusted successfully',
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return NextResponse.json(
      { error: { message: 'Failed to adjust stock' } },
      { status: 500 }
    );
  }
}
