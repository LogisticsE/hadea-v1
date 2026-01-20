import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/orders/:id - Get order detail
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        site: true,
        lab: true,
        kit: {
          include: {
            items: {
              include: {
                stockItem: true,
              },
            },
          },
        },
        siteContact: true,
        labContact: true,
        shipments: {
          include: {
            trackingEvents: {
              orderBy: { eventDate: 'desc' },
            },
          },
        },
        documents: true,
        stockMovements: {
          include: {
            stockItem: true,
          },
        },
        orderBoxes: {
          include: {
            boxDocuments: true,
          },
          orderBy: { boxNumber: 'asc' },
        },
        shippingScenario: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: { message: 'Order not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch order' } },
      { status: 500 }
    );
  }
}

// PUT /api/orders/:id - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { samplingDate, outboundCarrier, sampleCarrier, siteContactId, labContactId, notes } = body;

    // Check if order exists and can be updated
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: { message: 'Order not found' } },
        { status: 404 }
      );
    }

    // Only allow updates for DRAFT or PENDING_APPROVAL orders
    if (!['DRAFT', 'PENDING_APPROVAL'].includes(existingOrder.status)) {
      return NextResponse.json(
        { error: { message: 'Order cannot be updated in current status' } },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (outboundCarrier) updateData.outboundCarrier = outboundCarrier;
    if (sampleCarrier) updateData.sampleCarrier = sampleCarrier;
    if (siteContactId) updateData.siteContactId = siteContactId;
    if (labContactId) updateData.labContactId = labContactId;
    if (notes !== undefined) updateData.notes = notes;

    if (samplingDate) {
      updateData.samplingDate = new Date(samplingDate);
      updateData.outboundShipDate = calculateOutboundShipDate(new Date(samplingDate));
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        site: true,
        lab: true,
        kit: true,
      },
    });

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: { message: 'Failed to update order' } },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/:id - Cancel order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({
      data: order,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: { message: 'Failed to cancel order' } },
      { status: 500 }
    );
  }
}

function calculateOutboundShipDate(samplingDate: Date): Date {
  const outboundDate = new Date(samplingDate);
  outboundDate.setDate(outboundDate.getDate() - 14);
  
  // If weekend, move to Monday
  const day = outboundDate.getDay();
  if (day === 0) { // Sunday
    outboundDate.setDate(outboundDate.getDate() + 1);
  } else if (day === 6) { // Saturday
    outboundDate.setDate(outboundDate.getDate() + 2);
  }
  
  return outboundDate;
}
