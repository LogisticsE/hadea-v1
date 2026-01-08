import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/sites/:id - Get site detail
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const site = await prisma.site.findUnique({
      where: { id: params.id },
      include: {
        contacts: {
          where: { isActive: true },
          orderBy: { isPrimary: 'desc' },
        },
        orders: {
          take: 10,
          orderBy: { samplingDate: 'desc' },
          include: {
            lab: true,
            kit: true,
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: { message: 'Site not found' } },
        { status: 404 }
      );
    }

    // Get statistics
    const [totalOrders, ordersThisYear] = await Promise.all([
      prisma.order.count({ where: { siteId: params.id } }),
      prisma.order.count({
        where: {
          siteId: params.id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: {
        ...site,
        statistics: {
          totalOrders,
          ordersThisYear,
          avgOrdersPerMonth: ordersThisYear / (new Date().getMonth() + 1),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch site' } },
      { status: 500 }
    );
  }
}

// PUT /api/sites/:id - Update site
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const site = await prisma.site.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ data: site });
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json(
      { error: { message: 'Failed to update site' } },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/:id - Deactivate site
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const site = await prisma.site.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      data: site,
      message: 'Site deactivated successfully',
    });
  } catch (error) {
    console.error('Error deactivating site:', error);
    return NextResponse.json(
      { error: { message: 'Failed to deactivate site' } },
      { status: 500 }
    );
  }
}
