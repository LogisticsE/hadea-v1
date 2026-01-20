/**
 * Document Generation Service
 * Generates PDF documents for box content labels, non-ADR declarations, etc.
 * Uses pdf-lib for PDF generation
 */

import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';
import {
  OutboundContentLabelData,
  SampleContentLabelData,
  NonAdrDeclarationData,
  GeneratedDocument,
  LabelGenerationOptions,
  KitItemData,
} from './document-types';

// Page dimensions (A4 in points: 595.28 x 841.89)
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 50;
const LINE_HEIGHT = 18;
const SECTION_GAP = 25;

/**
 * Format a date for display on labels
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Draw a bordered table row
 */
function drawTableRow(
  page: PDFPage,
  y: number,
  columns: { text: string; width: number }[],
  font: PDFFont,
  fontSize: number,
  startX: number,
  rowHeight: number,
  isHeader: boolean = false
): void {
  let x = startX;
  const color = isHeader ? rgb(0.9, 0.9, 0.9) : rgb(1, 1, 1);

  // Draw background for header
  if (isHeader) {
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
    page.drawRectangle({
      x: startX,
      y: y - rowHeight + 5,
      width: totalWidth,
      height: rowHeight,
      color,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });
  }

  // Draw each cell
  for (const col of columns) {
    // Draw cell border
    page.drawRectangle({
      x,
      y: y - rowHeight + 5,
      width: col.width,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });

    // Draw text
    page.drawText(col.text, {
      x: x + 5,
      y: y - 3,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    x += col.width;
  }
}

/**
 * Draw a labeled field row (Label | Value)
 */
function drawLabeledField(
  page: PDFPage,
  y: number,
  label: string,
  value: string,
  font: PDFFont,
  boldFont: PDFFont,
  labelWidth: number = 180
): number {
  const startX = MARGIN;
  const valueX = startX + labelWidth;
  const rowHeight = 25;

  // Draw label cell
  page.drawRectangle({
    x: startX,
    y: y - rowHeight + 5,
    width: labelWidth,
    height: rowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });
  page.drawText(label, {
    x: startX + 5,
    y: y - 3,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Draw value cell
  const valueWidth = A4_WIDTH - MARGIN * 2 - labelWidth;
  page.drawRectangle({
    x: valueX,
    y: y - rowHeight + 5,
    width: valueWidth,
    height: rowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });
  page.drawText(value, {
    x: valueX + 5,
    y: y - 3,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });

  return y - rowHeight;
}

/**
 * Generate Outbound Box Content Label PDF
 */
export async function generateOutboundContentLabel(
  data: OutboundContentLabelData,
  options: LabelGenerationOptions = {}
): Promise<GeneratedDocument> {
  const {
    includeContractInfo = true,
    includeItemsTable = true,
    headerText = 'Box Contents Label',
  } = options;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = A4_HEIGHT - MARGIN;

  // Title
  page.drawText(headerText, {
    x: MARGIN,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 40;

  // Contract and delivery info table
  if (includeContractInfo) {
    y = drawLabeledField(page, y, 'Name of Contracting Authority', data.contract.contractingAuthorityName, font, boldFont);
    y = drawLabeledField(page, y, 'Delivery Address', data.deliveryAddress, font, boldFont);
    y = drawLabeledField(page, y, 'Name of Contractor', data.contract.contractorName, font, boldFont);
    y = drawLabeledField(page, y, 'Number of Specific Contract', data.contract.specificContractNumber, font, boldFont);
    y = drawLabeledField(page, y, 'Date of Specific Contract', formatDate(data.contract.specificContractDate), font, boldFont);
    y = drawLabeledField(page, y, 'Date of Delivery (Expected)', formatDate(data.expectedDeliveryDate), font, boldFont);
  }

  y -= SECTION_GAP;

  // Items table
  if (includeItemsTable && data.items.length > 0) {
    const tableStartX = MARGIN;
    const colWidths = {
      description: 300,
      qty: 80,
      unit: A4_WIDTH - MARGIN * 2 - 380,
    };

    // Table header
    drawTableRow(
      page,
      y,
      [
        { text: 'Item Description', width: colWidths.description },
        { text: 'Qty', width: colWidths.qty },
        { text: 'Unit', width: colWidths.unit },
      ],
      boldFont,
      10,
      tableStartX,
      22,
      true
    );
    y -= 22;

    // Table rows
    for (const item of data.items) {
      drawTableRow(
        page,
        y,
        [
          { text: item.name, width: colWidths.description },
          { text: String(item.quantity), width: colWidths.qty },
          { text: item.unit, width: colWidths.unit },
        ],
        font,
        10,
        tableStartX,
        20
      );
      y -= 20;
    }
  }

  // Footer with box info
  y -= SECTION_GAP;
  page.drawText(`Order: ${data.orderNumber} | Box ${data.boxNumber} of ${data.totalBoxes}`, {
    x: MARGIN,
    y,
    size: 9,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  if (data.waybillNumber) {
    page.drawText(`Waybill: ${data.waybillNumber}`, {
      x: MARGIN,
      y: y - 15,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save();

  // Create filename
  const dateStr = formatDate(new Date()).replace(/\//g, '-');
  const fileName = `outbound_content_${data.orderNumber}_box${data.boxNumber}_${dateStr}.pdf`;

  return {
    fileName,
    fileBuffer: pdfBytes,
    mimeType: 'application/pdf',
    fileSize: pdfBytes.length,
  };
}

/**
 * Generate Sample Box Content Label PDF
 */
export async function generateSampleContentLabel(
  data: SampleContentLabelData,
  options: LabelGenerationOptions = {}
): Promise<GeneratedDocument> {
  const {
    includeContractInfo = true,
    includeItemsTable = true,
    includeBarcode = true,
    headerText = 'Sample Contents Label',
  } = options;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = A4_HEIGHT - MARGIN;

  // Title
  page.drawText(headerText, {
    x: MARGIN,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 40;

  // Contract info
  if (includeContractInfo) {
    y = drawLabeledField(page, y, 'Name of Contracting Authority', data.contract.contractingAuthorityName, font, boldFont);
    y = drawLabeledField(page, y, 'Name of Contractor', data.contract.contractorName, font, boldFont);
    y = drawLabeledField(page, y, 'Number of Specific Contract', data.contract.specificContractNumber, font, boldFont);
    y = drawLabeledField(page, y, 'Date of Specific Contract', formatDate(data.contract.specificContractDate), font, boldFont);
  }

  // Lab info
  y = drawLabeledField(page, y, 'Destination Lab', data.labName, font, boldFont);
  y = drawLabeledField(page, y, 'Lab Address', data.labAddress, font, boldFont);
  y = drawLabeledField(page, y, 'Sampling Date', formatDate(data.samplingDate), font, boldFont);
  y = drawLabeledField(page, y, 'Expected Arrival', formatDate(data.expectedArrivalDate), font, boldFont);

  // Barcode info
  if (includeBarcode && data.barcodeSequence) {
    y -= SECTION_GAP / 2;
    y = drawLabeledField(page, y, 'Barcode Sequence', data.barcodeSequence, font, boldFont);
    if (data.barcodeCount) {
      y = drawLabeledField(page, y, 'Number of Samples', String(data.barcodeCount), font, boldFont);
    }
  }

  y -= SECTION_GAP;

  // Items table
  if (includeItemsTable && data.items.length > 0) {
    const tableStartX = MARGIN;
    const colWidths = {
      description: 300,
      qty: 80,
      unit: A4_WIDTH - MARGIN * 2 - 380,
    };

    // Table header
    drawTableRow(
      page,
      y,
      [
        { text: 'Item Description', width: colWidths.description },
        { text: 'Qty', width: colWidths.qty },
        { text: 'Unit', width: colWidths.unit },
      ],
      boldFont,
      10,
      tableStartX,
      22,
      true
    );
    y -= 22;

    // Table rows
    for (const item of data.items) {
      drawTableRow(
        page,
        y,
        [
          { text: item.name, width: colWidths.description },
          { text: String(item.quantity), width: colWidths.qty },
          { text: item.unit, width: colWidths.unit },
        ],
        font,
        10,
        tableStartX,
        20
      );
      y -= 20;
    }
  }

  // Footer
  y -= SECTION_GAP;
  page.drawText(`Order: ${data.orderNumber} | Box ${data.boxNumber} of ${data.totalBoxes}`, {
    x: MARGIN,
    y,
    size: 9,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  if (data.waybillNumber) {
    page.drawText(`Waybill: ${data.waybillNumber}`, {
      x: MARGIN,
      y: y - 15,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  const pdfBytes = await pdfDoc.save();

  const dateStr = formatDate(new Date()).replace(/\//g, '-');
  const fileName = `sample_content_${data.orderNumber}_box${data.boxNumber}_${dateStr}.pdf`;

  return {
    fileName,
    fileBuffer: pdfBytes,
    mimeType: 'application/pdf',
    fileSize: pdfBytes.length,
  };
}

/**
 * Generate Non-ADR Declaration PDF
 */
export async function generateNonAdrDeclaration(
  data: NonAdrDeclarationData
): Promise<GeneratedDocument> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = A4_HEIGHT - MARGIN;

  // Title
  page.drawText('DECLARATION', {
    x: A4_WIDTH / 2 - 60,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  page.drawText('(Non-Dangerous Goods)', {
    x: A4_WIDTH / 2 - 70,
    y,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });
  y -= 50;

  // Declaration text
  const declarationText = [
    'I, the undersigned, hereby declare that the shipment described below does not contain',
    'any dangerous goods as defined by the International Air Transport Association (IATA)',
    'Dangerous Goods Regulations and the Agreement concerning the International Carriage',
    'of Dangerous Goods by Road (ADR).',
    '',
    'The goods are properly packaged and labeled for transportation.',
  ];

  for (const line of declarationText) {
    page.drawText(line, {
      x: MARGIN,
      y,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });
    y -= LINE_HEIGHT;
  }

  y -= SECTION_GAP;

  // Shipment details
  y = drawLabeledField(page, y, 'Shipper', data.shipperName, font, boldFont);
  y = drawLabeledField(page, y, 'Shipper Address', data.shipperAddress, font, boldFont);
  y = drawLabeledField(page, y, 'Consignee', data.consigneeName, font, boldFont);
  y = drawLabeledField(page, y, 'Consignee Address', data.consigneeAddress, font, boldFont);
  y = drawLabeledField(page, y, 'Description of Goods', data.description, font, boldFont);
  y = drawLabeledField(page, y, 'Number of Packages', String(data.numberOfPackages), font, boldFont);
  y = drawLabeledField(page, y, 'Total Weight (kg)', data.totalWeight.toFixed(2), font, boldFont);

  y -= SECTION_GAP * 2;

  // Signature section
  page.drawText('Declared by:', {
    x: MARGIN,
    y,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= LINE_HEIGHT * 2;

  page.drawText(`Name: ${data.declarerName}`, {
    x: MARGIN,
    y,
    size: 11,
    font,
    color: rgb(0, 0, 0),
  });
  y -= LINE_HEIGHT * 2;

  page.drawText(`Date: ${formatDate(data.declarationDate)}`, {
    x: MARGIN,
    y,
    size: 11,
    font,
    color: rgb(0, 0, 0),
  });
  y -= LINE_HEIGHT * 3;

  page.drawText('Signature: _______________________________', {
    x: MARGIN,
    y,
    size: 11,
    font,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();

  const dateStr = formatDate(new Date()).replace(/\//g, '-');
  const fileName = `non_adr_declaration_${dateStr}.pdf`;

  return {
    fileName,
    fileBuffer: pdfBytes,
    mimeType: 'application/pdf',
    fileSize: pdfBytes.length,
  };
}
