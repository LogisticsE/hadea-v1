import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/orders/:id/approve - Approve order
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        kit: {
          include: {
            items: {
              include: {
                stockItem: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: { message: 'Order not found' } },
        { status: 404 }
      );
    }

    if (order.status !== 'DRAFT' && order.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: { message: 'Order cannot be approved in current status' } },
        { status: 400 }
      );
    }

    // Check stock availability
    const stockDeductions = [];
    for (const kitItem of order.kit.items) {
      const requiredQuantity = kitItem.quantity * order.quantity;
      if (kitItem.stockItem.quantity < requiredQuantity) {
        return NextResponse.json(
          {
            error: {
              message: `Insufficient stock for ${kitItem.stockItem.name}. Required: ${requiredQuantity}, Available: ${kitItem.stockItem.quantity}`,
            },
          },
          { status: 400 }
        );
      }
      stockDeductions.push({
        itemId: kitItem.stockItemId,
        quantity: requiredQuantity,
      });
    }

    // Use transaction to approve order and deduct stock
    const result = await prisma.$transaction(async (tx) => {
      // Deduct stock
      for (const deduction of stockDeductions) {
        await tx.stockItem.update({
          where: { id: deduction.itemId },
          data: {
            quantity: {
              decrement: deduction.quantity,
            },
          },
        });

        // Create stock movement record
        await tx.stockMovement.create({
          data: {
            stockItemId: deduction.itemId,
            orderId: order.id,
            quantityChange: -deduction.quantity,
            movementType: 'ORDER_ALLOCATION',
            notes: `Stock allocated for order ${order.orderNumber}`,
          },
        });
      }

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          // TODO: Add approvedById from authenticated user
        },
        include: {
          site: true,
          lab: true,
          kit: true,
        },
      });

      // Create shipment records
      await tx.shipment.create({
        data: {
          orderId: order.id,
          type: 'OUTBOUND',
          carrier: order.outboundCarrier,
          scheduledShipDate: order.outboundShipDate,
          status: 'PENDING',
        },
      });

      return updatedOrder;
    });

    return NextResponse.json({
      data: result,
      stockDeducted: stockDeductions,
      message: 'Order approved successfully',
    });
  } catch (error) {
    console.error('Error approving order:', error);
    return NextResponse.json(
      { error: { message: 'Failed to approve order' } },
      { status: 500 }
    );
  }
}
