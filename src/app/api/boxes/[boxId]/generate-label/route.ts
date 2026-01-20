/**
 * API Route: Generate Box Content Label
 * POST /api/boxes/[boxId]/generate-label
 *
 * Generates a PDF label for a specific box (outbound or sample content label)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  generateOutboundContentLabel,
  generateSampleContentLabel,
  OutboundContentLabelData,
  SampleContentLabelData,
  KitItemData,
  ContractInfo,
} from '@/lib/services';

interface RouteParams {
  params: {
    boxId: string;
  };
}

interface GenerateLabelRequest {
  labelType: 'OUTBOUND_CONTENT' | 'SAMPLE_CONTENT';
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { boxId } = params;
    const body: GenerateLabelRequest = await request.json();
    const { labelType } = body;

    if (!labelType || !['OUTBOUND_CONTENT', 'SAMPLE_CONTENT'].includes(labelType)) {
      return NextResponse.json(
        { error: 'Invalid labelType. Must be OUTBOUND_CONTENT or SAMPLE_CONTENT' },
        { status: 400 }
      );
    }

    // Fetch the box with all related data
    const box = await prisma.orderBox.findUnique({
      where: { id: boxId },
      include: {
        order: {
          include: {
            site: true,
            lab: true,
            kit: {
              include: {
                items: {
                  include: {
                    stockItem: true,
                  },
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!box) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 });
    }

    // Fetch HaDEA config for contract info
    const hadeaConfig = await prisma.hadeaConfig.findFirst({
      where: { isActive: true },
    });

    if (!hadeaConfig) {
      return NextResponse.json(
        { error: 'HaDEA configuration not found. Please configure contract details in Settings.' },
        { status: 400 }
      );
    }

    // Build contract info
    const contract: ContractInfo = {
      contractingAuthorityName: hadeaConfig.contractingAuthorityName,
      contractorName: hadeaConfig.contractorName,
      specificContractNumber: hadeaConfig.specificContractNumber,
      specificContractDate: hadeaConfig.specificContractDate,
    };

    // Build kit items data
    const kitItems: KitItemData[] = box.order.kit.items.map((item) => ({
      name: item.stockItem.name,
      description: item.stockItem.description || undefined,
      quantity: item.quantity,
      unit: 'pcs', // Default unit, could be extended from StockItem
    }));

    // Count total boxes for this order
    const totalBoxes = await prisma.orderBox.count({
      where: { orderId: box.orderId },
    });

    let generatedDoc;

    if (labelType === 'OUTBOUND_CONTENT') {
      // Build delivery address
      const site = box.order.site;
      const deliveryAddress = site.deliveryAddress ||
        [site.addressLine1, site.addressLine2, site.city, site.postalCode, site.countryName]
          .filter(Boolean)
          .join(', ');

      const labelData: OutboundContentLabelData = {
        contract,
        deliveryAddress,
        siteName: site.companyOrName || site.name,
        siteCity: site.city,
        siteCountry: site.countryName,
        expectedDeliveryDate: box.order.outboundShipDate, // Could add transit time
        items: kitItems,
        boxNumber: box.boxNumber,
        totalBoxes,
        waybillNumber: box.outboundWaybill || undefined,
        orderNumber: box.order.orderNumber,
      };

      generatedDoc = await generateOutboundContentLabel(labelData);

      // Update box to mark label as generated
      await prisma.orderBox.update({
        where: { id: boxId },
        data: {
          boxContentGeneratedOutbound: true,
          outboundLabelCreatedAt: new Date(),
        },
      });
    } else {
      // SAMPLE_CONTENT
      const lab = box.order.lab;
      const labAddress = lab.deliveryAddress ||
        [lab.addressLine1, lab.addressLine2, lab.city, lab.postalCode, lab.countryName]
          .filter(Boolean)
          .join(', ');

      const labelData: SampleContentLabelData = {
        contract,
        labName: lab.companyOrName || lab.name,
        labAddress,
        labCity: lab.city,
        labCountry: lab.countryName,
        expectedArrivalDate: box.order.samplingDate, // Estimate based on sampling + transit
        samplingDate: box.order.samplingDate,
        barcodeSequence: box.barcodeSequence || undefined,
        barcodeStart: box.barcodeStart || undefined,
        barcodeEnd: box.barcodeEnd || undefined,
        barcodeCount: box.barcodeCount || undefined,
        items: kitItems,
        boxNumber: box.boxNumber,
        totalBoxes,
        waybillNumber: box.sampleWaybill || undefined,
        orderNumber: box.order.orderNumber,
      };

      generatedDoc = await generateSampleContentLabel(labelData);

      // Update box to mark label as generated
      await prisma.orderBox.update({
        where: { id: boxId },
        data: {
          boxContentGeneratedSample: true,
          sampleLabelCreatedAt: new Date(),
        },
      });
    }

    // Store the document record in BoxDocument
    const boxDocument = await prisma.boxDocument.create({
      data: {
        boxId,
        documentType: labelType,
        fileName: generatedDoc.fileName,
        filePath: `/documents/${generatedDoc.fileName}`, // In production, use actual storage path
        fileSize: generatedDoc.fileSize,
        mimeType: generatedDoc.mimeType,
      },
    });

    // Return the PDF as a download
    return new NextResponse(generatedDoc.fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': generatedDoc.mimeType,
        'Content-Disposition': `attachment; filename="${generatedDoc.fileName}"`,
        'Content-Length': String(generatedDoc.fileSize),
        'X-Document-Id': boxDocument.id,
      },
    });
  } catch (error) {
    console.error('Error generating label:', error);
    return NextResponse.json(
      { error: 'Failed to generate label', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET - Check if label has been generated
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { boxId } = params;
    const { searchParams } = new URL(request.url);
    const labelType = searchParams.get('labelType');

    const box = await prisma.orderBox.findUnique({
      where: { id: boxId },
      select: {
        boxContentGeneratedOutbound: true,
        boxContentGeneratedSample: true,
        outboundLabelCreatedAt: true,
        sampleLabelCreatedAt: true,
        boxDocuments: {
          where: labelType ? { documentType: labelType } : undefined,
          orderBy: { generatedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!box) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 });
    }

    return NextResponse.json({
      outboundGenerated: box.boxContentGeneratedOutbound,
      outboundGeneratedAt: box.outboundLabelCreatedAt,
      sampleGenerated: box.boxContentGeneratedSample,
      sampleGeneratedAt: box.sampleLabelCreatedAt,
      documents: box.boxDocuments,
    });
  } catch (error) {
    console.error('Error checking label status:', error);
    return NextResponse.json(
      { error: 'Failed to check label status' },
      { status: 500 }
    );
  }
}
