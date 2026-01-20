/**
 * API Route: Order Boxes
 * GET /api/orders/[id]/boxes - List boxes for an order
 * POST /api/orders/[id]/boxes - Create a new box for an order
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - List all boxes for an order
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId } = params;

    const boxes = await prisma.orderBox.findMany({
      where: { orderId },
      include: {
        boxDocuments: {
          orderBy: { generatedAt: 'desc' },
        },
      },
      orderBy: { boxNumber: 'asc' },
    });

    return NextResponse.json({ data: boxes });
  } catch (error) {
    console.error('Error fetching boxes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boxes' },
      { status: 500 }
    );
  }
}

// POST - Create a new box for an order
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId } = params;
    const body = await request.json();
    const { outboundWaybill, sampleWaybill, barcodeSequence, barcodeStart, barcodeEnd, barcodeCount } = body;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get the next box number
    const existingBoxes = await prisma.orderBox.count({
      where: { orderId },
    });
    const nextBoxNumber = existingBoxes + 1;

    // Create the box
    const box = await prisma.orderBox.create({
      data: {
        orderId,
        boxNumber: nextBoxNumber,
        outboundWaybill: outboundWaybill || `WB-OUT-${order.orderNumber}-${nextBoxNumber}`,
        sampleWaybill: sampleWaybill || `WB-SAM-${order.orderNumber}-${nextBoxNumber}`,
        barcodeSequence: barcodeSequence || undefined,
        barcodeStart: barcodeStart || undefined,
        barcodeEnd: barcodeEnd || undefined,
        barcodeCount: barcodeCount || undefined,
        status: 'PENDING',
      },
      include: {
        boxDocuments: true,
      },
    });

    return NextResponse.json({ data: box }, { status: 201 });
  } catch (error) {
    console.error('Error creating box:', error);
    return NextResponse.json(
      { error: 'Failed to create box', details: String(error) },
      { status: 500 }
    );
  }
}
