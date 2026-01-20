/**
 * Types for document generation service
 */

export type LabelType = 'OUTBOUND_CONTENT' | 'SAMPLE_CONTENT' | 'NON_ADR';

/**
 * Contract information from HadeaConfig
 */
export interface ContractInfo {
  contractingAuthorityName: string;
  contractorName: string;
  specificContractNumber: string;
  specificContractDate: Date;
}

/**
 * Kit item for the items table
 */
export interface KitItemData {
  name: string;
  description?: string;
  quantity: number;
  unit: string;
}

/**
 * Data required to generate an Outbound Box Content Label
 */
export interface OutboundContentLabelData {
  // Contract info (from HadeaConfig)
  contract: ContractInfo;

  // Delivery info (from Site)
  deliveryAddress: string;
  siteName: string;
  siteCity: string;
  siteCountry: string;

  // Dates
  expectedDeliveryDate: Date;

  // Kit items (from Kit BOM)
  items: KitItemData[];

  // Box info
  boxNumber: number;
  totalBoxes: number;
  waybillNumber?: string;

  // Order info
  orderNumber: string;
}

/**
 * Data required to generate a Sample Box Content Label
 */
export interface SampleContentLabelData {
  // Contract info (from HadeaConfig)
  contract: ContractInfo;

  // Lab info (destination)
  labName: string;
  labAddress: string;
  labCity: string;
  labCountry: string;

  // Dates
  expectedArrivalDate: Date;
  samplingDate: Date;

  // Barcode info
  barcodeSequence?: string;
  barcodeStart?: string;
  barcodeEnd?: string;
  barcodeCount?: number;

  // Kit items (from Kit BOM)
  items: KitItemData[];

  // Box info
  boxNumber: number;
  totalBoxes: number;
  waybillNumber?: string;

  // Order info
  orderNumber: string;
}

/**
 * Data required to generate a Non-ADR Declaration
 */
export interface NonAdrDeclarationData {
  // Shipper info
  shipperName: string;
  shipperAddress: string;

  // Consignee info
  consigneeName: string;
  consigneeAddress: string;

  // Shipment info
  description: string;
  numberOfPackages: number;
  totalWeight: number;

  // Declaration
  declarationDate: Date;
  declarerName: string;
}

/**
 * Generated document result
 */
export interface GeneratedDocument {
  fileName: string;
  fileBuffer: Uint8Array;
  mimeType: string;
  fileSize: number;
}

/**
 * Label generation options
 */
export interface LabelGenerationOptions {
  includeContractInfo?: boolean;
  includeItemsTable?: boolean;
  includeBarcode?: boolean;
  includeLogo?: boolean;
  headerText?: string;
  pageSize?: 'A4' | 'LETTER';
}
