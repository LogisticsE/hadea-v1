import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { format } from 'date-fns';

// GET /api/calendar - Get calendar data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') || 'all';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: { message: 'Start date and end date are required' } },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get orders in date range
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          {
            outboundShipDate: {
              gte: start,
              lte: end,
            },
          },
          {
            samplingDate: {
              gte: start,
              lte: end,
            },
          },
        ],
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        site: true,
        lab: true,
        kit: true,
      },
      orderBy: { samplingDate: 'asc' },
    });

    // Group by date
    const calendarData: Record<string, any> = {};

    orders.forEach((order) => {
      // Add to outbound date
      const outboundKey = format(order.outboundShipDate, 'yyyy-MM-dd');
      if (!calendarData[outboundKey]) {
        calendarData[outboundKey] = {
          date: outboundKey,
          outboundCount: 0,
          samplingCount: 0,
          orders: [],
        };
      }
      if (type === 'all' || type === 'outbound') {
        calendarData[outboundKey].outboundCount++;
        calendarData[outboundKey].orders.push({
          id: order.id,
          orderNumber: order.orderNumber,
          type: 'outbound',
          siteName: order.site.name,
          labName: order.lab.name,
          status: order.status,
          kitName: order.kit.name,
          quantity: order.quantity,
        });
      }

      // Add to sampling date
      const samplingKey = format(order.samplingDate, 'yyyy-MM-dd');
      if (!calendarData[samplingKey]) {
        calendarData[samplingKey] = {
          date: samplingKey,
          outboundCount: 0,
          samplingCount: 0,
          orders: [],
        };
      }
      if (type === 'all' || type === 'sampling') {
        calendarData[samplingKey].samplingCount++;
        calendarData[samplingKey].orders.push({
          id: order.id,
          orderNumber: order.orderNumber,
          type: 'sampling',
          siteName: order.site.name,
          labName: order.lab.name,
          status: order.status,
          kitName: order.kit.name,
          quantity: order.quantity,
        });
      }
    });

    return NextResponse.json({
      data: Object.values(calendarData),
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch calendar data' } },
      { status: 500 }
    );
  }
}
