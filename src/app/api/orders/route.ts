import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateOutboundShipDate } from '@/lib/utils/date-utils';
import { generateOrderNumber, getTodayOrderPrefix } from '@/lib/utils/order-number';

// GET /api/orders - List orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status');
    const siteId = searchParams.get('siteId');
    const labId = searchParams.get('labId');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    if (siteId) {
      where.siteId = siteId;
    }
    if (labId) {
      where.labId = labId;
    }
    if (search) {
      where.orderNumber = { contains: search };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          site: true,
          lab: true,
          kit: true,
          siteContact: true,
          labContact: true,
          shipments: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch orders' } },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create order(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      siteId,
      labId,
      kitId,
      quantity,
      outboundCarrier,
      sampleCarrier,
      siteContactId,
      labContactId,
      samplingDates,
      notes,
    } = body;

    // Validate required fields
    if (!siteId || !labId || !kitId || !siteContactId || !labContactId || !samplingDates || samplingDates.length === 0) {
      return NextResponse.json(
        { error: { message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Get today's order prefix to find the next sequence number
    const prefix = getTodayOrderPrefix();
    const latestOrder = await prisma.order.findFirst({
      where: {
        orderNumber: { startsWith: prefix },
      },
      orderBy: { orderNumber: 'desc' },
    });

    let sequence = 1;
    if (latestOrder) {
      const parts = latestOrder.orderNumber.split('-');
      sequence = parseInt(parts[3], 10) + 1;
    }

    // Check if site and lab require customs docs
    const [site, lab] = await Promise.all([
      prisma.site.findUnique({ where: { id: siteId } }),
      prisma.lab.findUnique({ where: { id: labId } }),
    ]);

    const requiresCustomsDocs = !site?.isEU || !lab?.isEU;

    // Create orders for each sampling date
    const orders = await Promise.all(
      samplingDates.map(async (samplingDateStr: string, index: number) => {
        const samplingDate = new Date(samplingDateStr);
        const outboundShipDate = calculateOutboundShipDate(samplingDate);
        const orderNumber = generateOrderNumber(new Date(), sequence + index);

        return prisma.order.create({
          data: {
            orderNumber,
            siteId,
            labId,
            kitId,
            siteContactId,
            labContactId,
            quantity: quantity || 1,
            samplingDate,
            outboundShipDate,
            outboundCarrier,
            sampleCarrier,
            requiresCustomsDocs,
            notes,
            status: 'DRAFT',
          },
          include: {
            site: true,
            lab: true,
            kit: true,
          },
        });
      })
    );

    return NextResponse.json(
      {
        data: orders,
        message: `Successfully created ${orders.length} order(s)`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating orders:', error);
    return NextResponse.json(
      { error: { message: 'Failed to create orders' } },
      { status: 500 }
    );
  }
}
